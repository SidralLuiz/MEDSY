-- ============================================================================
-- MEDSY 5.0 — HARDENING DE SEGURANÇA + CONFORMIDADE LGPD (arquivo único)
-- Aplicar via Supabase Dashboard → SQL Editor (service_role) NA ORDEM abaixo.
--
-- Conteúdo:
--   0.  Extensões e helpers de autorização
--   1.  Criação das tabelas faltantes (transacoes_financeiras, fila_atendimento, prontuarios)
--   2.  ENABLE ROW LEVEL SECURITY + revoke de grants anon/authenticated
--   3.  Políticas RLS granulares por role (todas as tabelas)
--   4.  Criptografia: bcrypt (senha) + pgp_sym_encrypt (tokens OAuth) + functions
--   5.  RPCs: gravar_tokens_oauth, obter_token_calendario, registrar_consentimento
--   6.  LGPD: termos_aceite, consent_logs, audit_logs + DSR (anonimizar/eliminar/exportar)
--   7.  Índices para RLS performático
--   8.  Migração credenciais → Supabase Auth (auth.users)
-- ============================================================================

-- ============================================================================
-- 0. EXTENSÕES E HELPERS DE AUTORIZAÇÃO
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Cargo do usuário logado lido do JWT (app_metadata.cargo). Rápido, sem recursão RLS.
CREATE OR REPLACE FUNCTION public.cargo_atual()
RETURNS text
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT COALESCE(NULLIF(auth.jwt() -> 'app_metadata' ->> 'cargo', ''), 'USUARIO');
$$;

-- medico_id do usuário logado (claim app_metadata.medico_id)
CREATE OR REPLACE FUNCTION public.medico_id_atual()
RETURNS uuid
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT (auth.jwt() -> 'app_metadata' ->> 'medico_id')::uuid;
$$;

-- Fallback seguro: resolve cargo direto da tabela quando claim ausente (definer, sem recursão)
CREATE OR REPLACE FUNCTION public.cargo_atual_seguro()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(NULLIF(auth.jwt() -> 'app_metadata' ->> 'cargo',''),
                 (SELECT cargo FROM public.usuarios WHERE id = auth.uid() LIMIT 1),
                 'USUARIO');
$$;

-- ============================================================================
-- 1. TABELAS FALTANTES (espelham as interfaces de lib/db.ts)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.transacoes_financeiras (
  id               uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  consulta_id      uuid REFERENCES public.consultas(id) ON DELETE SET NULL,
  paciente_nome    varchar(100) NOT NULL,
  medico_nome      varchar(100) NOT NULL,
  especialidade    varchar(50) NOT NULL,
  valor            numeric(10,2) NOT NULL CHECK (valor >= 0),
  data_vencimento  date NOT NULL,
  status           varchar(20) NOT NULL DEFAULT 'PENDENTE'
                   CHECK (status IN ('PAGO','PENDENTE','CANCELADO')),
  link_pagamento   text,
  pix_code         text,
  metodo_pagamento varchar(30),
  criado_em        timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.fila_atendimento (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  senha           varchar(10) NOT NULL,
  tipo            varchar(12) NOT NULL DEFAULT 'NORMAL'
                  CHECK (tipo IN ('NORMAL','PREFERENCIAL')),
  paciente_id     uuid REFERENCES public.pacientes(id) ON DELETE SET NULL,
  paciente_nome   varchar(100) NOT NULL,
  medico_nome     varchar(100),
  consultorio     varchar(50),
  status          varchar(20) NOT NULL DEFAULT 'AGUARDANDO'
                  CHECK (status IN ('AGUARDANDO','EM_ATENDIMENTO','CONCLUIDO','CANCELADO')),
  horario_chegada varchar(10) NOT NULL,
  horario_chamada varchar(10),
  criado_em       timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Prontuários: ON DELETE SET NULL preserva o histórico de saúde após eliminação do paciente
-- (retenção mínima de 20 anos — Res. CFM 1.821/2007)
CREATE TABLE IF NOT EXISTS public.prontuarios (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  paciente_id   uuid REFERENCES public.pacientes(id) ON DELETE SET NULL,
  paciente_nome varchar(100) NOT NULL,
  medico_id     uuid REFERENCES public.medicos(id) ON DELETE SET NULL,
  medico_nome   varchar(100) NOT NULL,
  data          date NOT NULL DEFAULT CURRENT_DATE,
  anamnese      text NOT NULL,
  diagnostico   text NOT NULL,
  prescricao    text NOT NULL,
  observacoes   text,
  criado_em     timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 2. RLS + REVOKE DE ACESSO PADRÃO
--    (Supabase concede GRANT amplo a anon/authenticated por padrão → bloquear tudo)
-- ============================================================================
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM authenticated;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM authenticated;

ALTER TABLE public.pacientes              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medicos                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.secretarias            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.horarios_disponiveis   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultas              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transacoes_financeiras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fila_atendimento       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prontuarios            ENABLE ROW LEVEL SECURITY;

-- GRANTs mínimos por tabela (as policies fazem o filtro fino)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pacientes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.horarios_disponiveis TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.consultas TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.transacoes_financeiras TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fila_atendimento TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.prontuarios TO authenticated;

-- ============================================================================
-- 3. POLÍTICAS RLS GRANULARES
-- ============================================================================

-- ---------- PACIENTES ----------
CREATE POLICY "pacientes_select_admin_sec_med"
  ON public.pacientes FOR SELECT TO authenticated
  USING (public.cargo_atual() IN ('ADMIN','SECRETARIA','MEDICO'));

CREATE POLICY "pacientes_insert_admin_sec"
  ON public.pacientes FOR INSERT TO authenticated
  WITH CHECK (public.cargo_atual() IN ('ADMIN','SECRETARIA'));

CREATE POLICY "pacientes_update_admin_sec"
  ON public.pacientes FOR UPDATE TO authenticated
  USING (public.cargo_atual() IN ('ADMIN','SECRETARIA'));

CREATE POLICY "pacientes_delete_admin"
  ON public.pacientes FOR DELETE TO authenticated
  USING (public.cargo_atual() = 'ADMIN');

-- ---------- MÉDICOS (colunas senha/tokens inacessíveis por SELECT) ----------
REVOKE SELECT ON public.medicos FROM authenticated;
GRANT SELECT (id, nome, cpf, email, data_nascimento, telefone, endereco, crm, especialidade,
              google_connected, outlook_connected, criado_em)
  ON public.medicos TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.medicos TO service_role;

CREATE POLICY "medicos_select_admin_sec_ou_proprio"
  ON public.medicos FOR SELECT TO authenticated
  USING (public.cargo_atual() IN ('ADMIN','SECRETARIA') OR id = public.medico_id_atual());

CREATE POLICY "medicos_insert_admin"
  ON public.medicos FOR INSERT TO authenticated
  WITH CHECK (public.cargo_atual() = 'ADMIN');

CREATE POLICY "medicos_update_admin_ou_proprio"
  ON public.medicos FOR UPDATE TO authenticated
  USING (public.cargo_atual() = 'ADMIN' OR id = public.medico_id_atual());

CREATE POLICY "medicos_delete_admin"
  ON public.medicos FOR DELETE TO authenticated
  USING (public.cargo_atual() = 'ADMIN');

-- ---------- SECRETÁRIAS ----------
REVOKE SELECT ON public.secretarias FROM authenticated;
GRANT SELECT (id, nome, cpf, email, data_nascimento, telefone, endereco,
              google_connected, outlook_connected, criado_em)
  ON public.secretarias TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.secretarias TO service_role;

CREATE POLICY "secretarias_select_admin"
  ON public.secretarias FOR SELECT TO authenticated
  USING (public.cargo_atual() = 'ADMIN');

CREATE POLICY "secretarias_insert_admin"
  ON public.secretarias FOR INSERT TO authenticated
  WITH CHECK (public.cargo_atual() = 'ADMIN');

CREATE POLICY "secretarias_update_admin"
  ON public.secretarias FOR UPDATE TO authenticated
  USING (public.cargo_atual() = 'ADMIN');

CREATE POLICY "secretarias_delete_admin"
  ON public.secretarias FOR DELETE TO authenticated
  USING (public.cargo_atual() = 'ADMIN');

-- ---------- USUÁRIOS (somente própria linha; senha/tokens nunca via SELECT) ----------
REVOKE SELECT ON public.usuarios FROM authenticated;
GRANT SELECT (id, cpf, nome, nivel_acesso, cargo, ref_id, google_connected,
              outlook_connected, criado_em)
  ON public.usuarios TO authenticated;
-- Update permitido apenas nas colunas de estado de conexão de calendário (sem tokens/senha)
GRANT UPDATE (google_connected, outlook_connected) ON public.usuarios TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.usuarios TO service_role;

CREATE POLICY "usuarios_select_propria_ou_admin"
  ON public.usuarios FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.cargo_atual() = 'ADMIN');

CREATE POLICY "usuarios_insert_admin"
  ON public.usuarios FOR INSERT TO authenticated
  WITH CHECK (public.cargo_atual() = 'ADMIN');

CREATE POLICY "usuarios_update_propria_ou_admin"
  ON public.usuarios FOR UPDATE TO authenticated
  USING (id = auth.uid() OR public.cargo_atual() = 'ADMIN');

CREATE POLICY "usuarios_delete_admin"
  ON public.usuarios FOR DELETE TO authenticated
  USING (public.cargo_atual() = 'ADMIN');

-- ---------- HORÁRIOS DISPONÍVEIS ----------
CREATE POLICY "horarios_select_todos_autenticados"
  ON public.horarios_disponiveis FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "horarios_insert_admin_sec_ou_proprio"
  ON public.horarios_disponiveis FOR INSERT TO authenticated
  WITH CHECK (public.cargo_atual() IN ('ADMIN','SECRETARIA') OR medico_id = public.medico_id_atual());

CREATE POLICY "horarios_update_admin_sec_ou_proprio"
  ON public.horarios_disponiveis FOR UPDATE TO authenticated
  USING (public.cargo_atual() IN ('ADMIN','SECRETARIA') OR medico_id = public.medico_id_atual());

CREATE POLICY "horarios_delete_admin_sec_ou_proprio"
  ON public.horarios_disponiveis FOR DELETE TO authenticated
  USING (public.cargo_atual() IN ('ADMIN','SECRETARIA') OR medico_id = public.medico_id_atual());

-- ---------- CONSULTAS ----------
CREATE POLICY "consultas_select_admin_sec_ou_medico_responsavel"
  ON public.consultas FOR SELECT TO authenticated
  USING (public.cargo_atual() IN ('ADMIN','SECRETARIA') OR medico_id = public.medico_id_atual());

CREATE POLICY "consultas_insert_admin_sec"
  ON public.consultas FOR INSERT TO authenticated
  WITH CHECK (public.cargo_atual() IN ('ADMIN','SECRETARIA'));

CREATE POLICY "consultas_update_admin_sec_ou_medico_responsavel"
  ON public.consultas FOR UPDATE TO authenticated
  USING (public.cargo_atual() IN ('ADMIN','SECRETARIA') OR medico_id = public.medico_id_atual());

CREATE POLICY "consultas_delete_admin"
  ON public.consultas FOR DELETE TO authenticated
  USING (public.cargo_atual() = 'ADMIN');

-- ---------- TRANSAÇÕES FINANCEIRAS ----------
CREATE POLICY "transacoes_select_admin_sec"
  ON public.transacoes_financeiras FOR SELECT TO authenticated
  USING (public.cargo_atual() IN ('ADMIN','SECRETARIA'));

CREATE POLICY "transacoes_insert_admin_sec"
  ON public.transacoes_financeiras FOR INSERT TO authenticated
  WITH CHECK (public.cargo_atual() IN ('ADMIN','SECRETARIA'));

CREATE POLICY "transacoes_update_admin_sec"
  ON public.transacoes_financeiras FOR UPDATE TO authenticated
  USING (public.cargo_atual() IN ('ADMIN','SECRETARIA'));

CREATE POLICY "transacoes_delete_admin"
  ON public.transacoes_financeiras FOR DELETE TO authenticated
  USING (public.cargo_atual() = 'ADMIN');

-- ---------- FILA DE ATENDIMENTO ----------
CREATE POLICY "fila_select_admin_sec_med"
  ON public.fila_atendimento FOR SELECT TO authenticated
  USING (public.cargo_atual() IN ('ADMIN','SECRETARIA','MEDICO'));

CREATE POLICY "fila_insert_admin_sec"
  ON public.fila_atendimento FOR INSERT TO authenticated
  WITH CHECK (public.cargo_atual() IN ('ADMIN','SECRETARIA'));

CREATE POLICY "fila_update_admin_sec_med"
  ON public.fila_atendimento FOR UPDATE TO authenticated
  USING (public.cargo_atual() IN ('ADMIN','SECRETARIA','MEDICO'));

CREATE POLICY "fila_delete_admin"
  ON public.fila_atendimento FOR DELETE TO authenticated
  USING (public.cargo_atual() = 'ADMIN');

-- ---------- PRONTUÁRIOS (dados sensíveis de saúde: mais restritivo) ----------
CREATE POLICY "prontuarios_select_admin_sec_ou_medico_responsavel"
  ON public.prontuarios FOR SELECT TO authenticated
  USING (public.cargo_atual() IN ('ADMIN','SECRETARIA') OR medico_id = public.medico_id_atual());

CREATE POLICY "prontuarios_insert_admin_ou_medico_responsavel"
  ON public.prontuarios FOR INSERT TO authenticated
  WITH CHECK (public.cargo_atual() = 'ADMIN' OR medico_id = public.medico_id_atual());

CREATE POLICY "prontuarios_update_admin_ou_medico_responsavel"
  ON public.prontuarios FOR UPDATE TO authenticated
  USING (public.cargo_atual() = 'ADMIN' OR medico_id = public.medico_id_atual());

CREATE POLICY "prontuarios_delete_admin"
  ON public.prontuarios FOR DELETE TO authenticated
  USING (public.cargo_atual() = 'ADMIN');

-- View para painel de TV sem PII/condição de prioridade extra
CREATE OR REPLACE VIEW public.vw_fila_painel AS
SELECT id, senha, tipo, consultorio, status, horario_chegada, horario_chamada
FROM public.fila_atendimento
WHERE public.cargo_atual() IN ('ADMIN','SECRETARIA','MEDICO');

GRANT SELECT ON public.vw_fila_painel TO authenticated;

-- ============================================================================
-- 4. CRIPTOGRAFIA — bcrypt (senha) + pgp_sym_encrypt (tokens OAuth)
-- ============================================================================

-- Chave de criptografia dos tokens (NÃO acessível por roles de aplicação)
CREATE TABLE IF NOT EXISTS public.app_settings (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  encryption_key text NOT NULL
);
INSERT INTO public.app_settings (id, encryption_key)
VALUES (1, encode(gen_random_bytes(32), 'hex'))
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.app_settings FROM anon, authenticated;
GRANT SELECT ON public.app_settings TO service_role;

-- 4.1 Hash automático de senha (bcrypt) — nunca armazenar texto plano
CREATE OR REPLACE FUNCTION public.trigger_hash_senha()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.senha IS NOT NULL
     AND NEW.senha NOT LIKE '$2a$%'
     AND NEW.senha NOT LIKE '$2b$%'
     AND NEW.senha NOT LIKE '$2y$%' THEN
    NEW.senha := crypt(NEW.senha, gen_salt('bf', 10));
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER trg_hash_senha_usuarios
BEFORE INSERT OR UPDATE OF senha ON public.usuarios
FOR EACH ROW EXECUTE FUNCTION public.trigger_hash_senha();

CREATE TRIGGER trg_hash_senha_medicos
BEFORE INSERT OR UPDATE OF senha ON public.medicos
FOR EACH ROW EXECUTE FUNCTION public.trigger_hash_senha();

CREATE TRIGGER trg_hash_senha_secretarias
BEFORE INSERT OR UPDATE OF senha ON public.secretarias
FOR EACH ROW EXECUTE FUNCTION public.trigger_hash_senha();

-- 4.2 Criptografia automática dos tokens OAuth (encrypt na escrita)
CREATE OR REPLACE FUNCTION public.trigger_encrypt_tokens()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  k text;
BEGIN
  SELECT encryption_key INTO k FROM public.app_settings WHERE id = 1;
  IF k IS NULL THEN
    RAISE EXCEPTION 'app_settings.encryption_key não configurada';
  END IF;
  IF NEW.google_refresh_token IS NOT NULL
     AND NEW.google_refresh_token NOT LIKE '-----BEGIN PGP MESSAGE-----%' THEN
    NEW.google_refresh_token := pgp_sym_encrypt(NEW.google_refresh_token, k);
  END IF;
  IF NEW.google_access_token IS NOT NULL
     AND NEW.google_access_token NOT LIKE '-----BEGIN PGP MESSAGE-----%' THEN
    NEW.google_access_token := pgp_sym_encrypt(NEW.google_access_token, k);
  END IF;
  IF NEW.outlook_refresh_token IS NOT NULL
     AND NEW.outlook_refresh_token NOT LIKE '-----BEGIN PGP MESSAGE-----%' THEN
    NEW.outlook_refresh_token := pgp_sym_encrypt(NEW.outlook_refresh_token, k);
  END IF;
  IF NEW.outlook_access_token IS NOT NULL
     AND NEW.outlook_access_token NOT LIKE '-----BEGIN PGP MESSAGE-----%' THEN
    NEW.outlook_access_token := pgp_sym_encrypt(NEW.outlook_access_token, k);
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER trg_encrypt_tokens_usuarios
BEFORE INSERT OR UPDATE OF google_refresh_token, google_access_token,
                           outlook_refresh_token, outlook_access_token
ON public.usuarios FOR EACH ROW EXECUTE FUNCTION public.trigger_encrypt_tokens();

-- ============================================================================
-- 5. RPCs — gravação/leitura segura de tokens e consentimento
-- ============================================================================

-- Grava tokens OAuth criptografados. Somente o próprio usuário (auth.uid()).
CREATE OR REPLACE FUNCTION public.gravar_tokens_oauth(
  p_provider text,
  p_access_token text DEFAULT NULL,
  p_refresh_token text DEFAULT NULL,
  p_expiry bigint DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  k text;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Não autenticado';
  END IF;
  IF p_provider NOT IN ('google','outlook') THEN
    RAISE EXCEPTION 'Provedor inválido';
  END IF;

  SELECT encryption_key INTO k FROM public.app_settings WHERE id = 1;
  IF k IS NULL THEN
    RAISE EXCEPTION 'app_settings.encryption_key não configurada';
  END IF;

  IF p_provider = 'google' THEN
    UPDATE public.usuarios SET
      google_connected = true,
      google_access_token  = CASE WHEN p_access_token  IS NOT NULL THEN pgp_sym_encrypt(p_access_token, k)  ELSE google_access_token END,
      google_refresh_token = CASE WHEN p_refresh_token IS NOT NULL THEN pgp_sym_encrypt(p_refresh_token, k) ELSE google_refresh_token END,
      google_token_expiry  = COALESCE(p_expiry, google_token_expiry)
    WHERE id = auth.uid();
  ELSE
    UPDATE public.usuarios SET
      outlook_connected = true,
      outlook_access_token  = CASE WHEN p_access_token  IS NOT NULL THEN pgp_sym_encrypt(p_access_token, k)  ELSE outlook_access_token END,
      outlook_refresh_token = CASE WHEN p_refresh_token IS NOT NULL THEN pgp_sym_encrypt(p_refresh_token, k) ELSE outlook_refresh_token END,
      outlook_token_expiry  = COALESCE(p_expiry, outlook_token_expiry)
    WHERE id = auth.uid();
  END IF;
END $$;

REVOKE ALL ON FUNCTION public.gravar_tokens_oauth(text, text, text, bigint) FROM public;
GRANT  EXECUTE ON FUNCTION public.gravar_tokens_oauth(text, text, text, bigint) TO authenticated;

-- Leitura descriptografada sob demanda — somente o dono ou ADMIN
CREATE OR REPLACE FUNCTION public.obter_token_calendario(
  p_provider text DEFAULT 'google',
  p_kind text DEFAULT 'refresh'
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  k text;
  col text;
  v text;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Não autenticado';
  END IF;

  SELECT encryption_key INTO k FROM public.app_settings WHERE id = 1;
  IF k IS NULL THEN
    RAISE EXCEPTION 'app_settings.encryption_key não configurada';
  END IF;

  col := CASE
    WHEN p_provider = 'google'  AND p_kind = 'refresh' THEN 'google_refresh_token'
    WHEN p_provider = 'google'  AND p_kind = 'access'  THEN 'google_access_token'
    WHEN p_provider = 'outlook' AND p_kind = 'refresh' THEN 'outlook_refresh_token'
    WHEN p_provider = 'outlook' AND p_kind = 'access'  THEN 'outlook_access_token'
    ELSE NULL END;
  IF col IS NULL THEN
    RAISE EXCEPTION 'Tipo de token inválido';
  END IF;

  EXECUTE format('SELECT %I FROM public.usuarios WHERE id = auth.uid()', col) INTO v;
  IF v IS NULL OR v NOT LIKE '-----BEGIN PGP MESSAGE-----' THEN
    RETURN v; -- valor antigo (nunca criptografado)
  END IF;
  RETURN pgp_sym_decrypt(v::bytea, k);
END $$;

REVOKE ALL ON FUNCTION public.obter_token_calendario(text, text) FROM public;
GRANT  EXECUTE ON FUNCTION public.obter_token_calendario(text, text) TO authenticated;

-- Registro de consentimento LGPD (IP exigido para validade jurídica)
CREATE OR REPLACE FUNCTION public.registrar_consentimento(
  p_versao_termos text,
  p_finalidade text,
  p_consentiu boolean,
  p_ip_origem text DEFAULT NULL,
  p_user_agent text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Não autenticado';
  END IF;
  INSERT INTO public.consent_logs (id_usuario, versao_termos, finalidade, consentiu, ip_origem, user_agent)
  VALUES (auth.uid(), p_versao_termos, p_finalidade, p_consentiu,
          NULLIF(p_ip_origem, '')::inet, p_user_agent);
END $$;

-- ============================================================================
-- 6. LGPD — TERMOS, CONSENTIMENTO, AUDITORIA E DIREITOS DO TITULAR
-- ============================================================================

-- 6.1 Termos e políticas versionados
CREATE TABLE IF NOT EXISTS public.termos_aceite (
  id         integer PRIMARY KEY,
  versao     text NOT NULL UNIQUE,
  tipo       text NOT NULL CHECK (tipo IN ('TERMOS_USO','PRIVACIDADE','CONSENTIMENTO_DADOS_SAUDE')),
  texto_html text NOT NULL,
  vigente    boolean NOT NULL DEFAULT false,
  criado_em  timestamptz NOT NULL DEFAULT now()
);

-- 6.2 Registro de consentimento (inviolável: sem UPDATE/DELETE para roles app)
CREATE TABLE IF NOT EXISTS public.consent_logs (
  id            bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_usuario    uuid NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  versao_termos text NOT NULL REFERENCES public.termos_aceite(versao),
  finalidade    text NOT NULL,
  data_hora     timestamptz NOT NULL DEFAULT now(),
  ip_origem     inet,
  user_agent    text,
  consentiu     boolean NOT NULL
);

ALTER TABLE public.termos_aceite ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consent_logs ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.termos_aceite FROM anon;
REVOKE ALL ON public.consent_logs FROM anon;
GRANT  SELECT ON public.termos_aceite TO authenticated;
GRANT  SELECT, INSERT ON public.consent_logs TO authenticated;

CREATE POLICY termos_select_vigentes ON public.termos_aceite FOR SELECT TO authenticated
  USING (vigente = true);

CREATE POLICY consent_select_proprio ON public.consent_logs FOR SELECT TO authenticated
  USING (id_usuario = auth.uid() OR public.cargo_atual() = 'ADMIN');

CREATE POLICY consent_insert_proprio ON public.consent_logs FOR INSERT TO authenticated
  WITH CHECK (id_usuario = auth.uid());

CREATE POLICY consent_no_update ON public.consent_logs FOR UPDATE TO authenticated
  USING (false);

CREATE POLICY consent_no_delete ON public.consent_logs FOR DELETE TO authenticated
  USING (false);

-- 6.3 Audit trail inviolável
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  data_hora   timestamptz NOT NULL DEFAULT now(),
  id_ator     uuid,
  acao        text NOT NULL,
  tabela      text NOT NULL,
  registro_id uuid,
  detalhes    jsonb
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.audit_logs FROM anon, authenticated;
GRANT  ALL ON public.audit_logs TO service_role;

CREATE POLICY audit_somente_admin ON public.audit_logs FOR SELECT TO authenticated
  USING (public.cargo_atual() = 'ADMIN');
CREATE POLICY audit_imutavel_update ON public.audit_logs FOR UPDATE TO authenticated
  USING (false);
CREATE POLICY audit_imutavel_delete ON public.audit_logs FOR DELETE TO authenticated
  USING (false);

-- Registra leitura de prontuário (rastreabilidade de acesso a dado sensível)
-- NOTA: Postgres não suporta trigger AFTER SELECT; a auditoria é feita por RPC
-- chamada pelo app quando um prontuário é aberto (ver lib/db.ts).
CREATE OR REPLACE FUNCTION public.registrar_acesso_prontuario(p_prontuario_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.audit_logs (id_ator, acao, tabela, registro_id, detalhes)
  VALUES (auth.uid(), 'SELECT', 'prontuarios', p_prontuario_id,
          jsonb_build_object('via', 'app'));
END $$;

REVOKE ALL ON FUNCTION public.registrar_acesso_prontuario(uuid) FROM public;
GRANT  EXECUTE ON FUNCTION public.registrar_acesso_prontuario(uuid) TO authenticated;

-- 6.4 Direitos do titular (Art. 18 LGPD)
-- Pseudonimização: mantém histórico de saúde (retenção 20 anos) sem identificação
CREATE OR REPLACE FUNCTION public.anonimizar_paciente(p_paciente_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.cargo_atual() <> 'ADMIN' THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  UPDATE public.pacientes SET
    nome            = 'PACIENTE ANONIMIZADO',
    cpf             = 'ANON-' || replace(p_paciente_id::text, '-', ''),
    email           = NULL,
    telefone        = NULL,
    endereco        = NULL,
    data_nascimento = NULL
  WHERE id = p_paciente_id;

  UPDATE public.prontuarios SET paciente_nome = 'PACIENTE ANONIMIZADO'
  WHERE paciente_id = p_paciente_id;

  UPDATE public.consultas SET paciente_nome = 'PACIENTE ANONIMIZADO'
  WHERE paciente_id = p_paciente_id;

  UPDATE public.fila_atendimento SET paciente_nome = 'PACIENTE ANONIMIZADO'
  WHERE paciente_id = p_paciente_id;

  INSERT INTO public.audit_logs (id_ator, acao, tabela, registro_id, detalhes)
  VALUES (auth.uid(), 'ANONIMIZAR', 'pacientes', p_paciente_id, '{}');
END $$;

-- Eliminação definitiva (direito ao esquecimento) — prontuário é retido anonimizado
CREATE OR REPLACE FUNCTION public.eliminar_paciente(p_paciente_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.cargo_atual() <> 'ADMIN' THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  PERFORM public.anonimizar_paciente(p_paciente_id);
  DELETE FROM public.pacientes WHERE id = p_paciente_id;

  INSERT INTO public.audit_logs (id_ator, acao, tabela, registro_id, detalhes)
  VALUES (auth.uid(), 'DELETE', 'pacientes', p_paciente_id, jsonb_build_object('tipo','DSE'));
END $$;

-- Portabilidade/exportação dos dados do titular (Art. 18, V)
CREATE OR REPLACE FUNCTION public.exportar_dados_titular()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  u_id uuid := auth.uid();
  resultado jsonb;
BEGIN
  IF u_id IS NULL THEN
    RAISE EXCEPTION 'Não autenticado';
  END IF;

  SELECT jsonb_build_object(
    'usuario', (SELECT to_jsonb(usuarios_publico) FROM (
                  SELECT cpf, nome, cargo, criado_em FROM public.usuarios WHERE id = u_id
                ) usuarios_publico),
    'consultas', (SELECT COALESCE(jsonb_agg(c), '[]'::jsonb) FROM (
                    SELECT id, data_consulta, horario, status, medico_nome, especialidade
                    FROM public.consultas
                    WHERE paciente_id = (SELECT ref_id FROM public.usuarios WHERE id = u_id)
                  ) c),
    'consentimentos', (SELECT COALESCE(jsonb_agg(cl), '[]'::jsonb) FROM (
                         SELECT versao_termos, finalidade, data_hora, consentiu
                         FROM public.consent_logs WHERE id_usuario = u_id
                       ) cl)
  ) INTO resultado;

  INSERT INTO public.audit_logs (id_ator, acao, tabela, registro_id, detalhes)
  VALUES (u_id, 'EXPORTAR', 'pacientes', NULL, '{}');

  RETURN resultado;
END $$;

REVOKE ALL ON FUNCTION public.anonimizar_paciente(uuid) FROM public;
GRANT  EXECUTE ON FUNCTION public.anonimizar_paciente(uuid) TO authenticated;
REVOKE ALL ON FUNCTION public.eliminar_paciente(uuid) FROM public;
GRANT  EXECUTE ON FUNCTION public.eliminar_paciente(uuid) TO authenticated;
REVOKE ALL ON FUNCTION public.exportar_dados_titular() FROM public;
GRANT  EXECUTE ON FUNCTION public.exportar_dados_titular() TO authenticated;

-- Termo inicial de saúde (substituir texto pelo aprovado juridicamente)
INSERT INTO public.termos_aceite (id, versao, tipo, texto_html, vigente)
VALUES (1, '1.0.0', 'CONSENTIMENTO_DADOS_SAUDE',
        '<p>Consentimento para tratamento de dados de saúde (anamnese, diagnóstico e prescrição) para fins de assistência médica, com finalidade de registro e continuidade do cuidado.</p>',
        true)
ON CONFLICT (versao) DO NOTHING;

-- ============================================================================
-- 7. ÍNDICES PARA RLS PERFORMÁTICO
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_usuarios_id_ref      ON public.usuarios (id, ref_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_cargo       ON public.usuarios (cargo);
CREATE INDEX IF NOT EXISTS idx_consultas_medico     ON public.consultas (medico_id);
CREATE INDEX IF NOT EXISTS idx_consultas_paciente   ON public.consultas (paciente_id);
CREATE INDEX IF NOT EXISTS idx_prontuarios_medico   ON public.prontuarios (medico_id);
CREATE INDEX IF NOT EXISTS idx_prontuarios_paciente ON public.prontuarios (paciente_id);
CREATE INDEX IF NOT EXISTS idx_horarios_medico      ON public.horarios_disponiveis (medico_id);
CREATE INDEX IF NOT EXISTS idx_pacientes_cpf        ON public.pacientes (cpf);
CREATE INDEX IF NOT EXISTS idx_consent_id_usuario   ON public.consent_logs (id_usuario);
CREATE INDEX IF NOT EXISTS idx_audit_ator           ON public.audit_logs (id_ator);

-- ============================================================================
-- 8. MIGRAÇÃO CREDENCIAIS → SUPABASE AUTH
--    Cria auth.users para os usuários existentes (bcrypt compatível).
--    Email de login: {cpf-somente-numeros}@medsy.local
-- ============================================================================
DO $$
DECLARE
  u RECORD;
BEGIN
  FOR u IN SELECT id, cpf, senha, nome, cargo FROM public.usuarios
  LOOP
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    )
    VALUES (
      u.id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
      lower(regexp_replace(u.cpf, '\D', '', 'g')) || '@medsy.local',
      -- usa o hash bcrypt já gravado pelo trigger (ou faz hash agora se estiver em claro)
      CASE WHEN u.senha LIKE '$2%' THEN u.senha ELSE crypt(u.senha, gen_salt('bf', 10)) END,
      now(),
      jsonb_build_object('provider','email','providers',ARRAY['email'],'cargo',u.cargo),
      jsonb_build_object('nome', u.nome),
      now(), now()
    )
    ON CONFLICT (id) DO NOTHING;
  END LOOP;
END $$;

-- Sincroniza claim medico_id no app_metadata (usado pelas políticas RLS)
CREATE OR REPLACE FUNCTION public.sincronizar_claim_medico_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE auth.users
  SET raw_app_meta_data =
        jsonb_set(raw_app_meta_data, '{medico_id}', to_jsonb(NEW.ref_id::text), true)
  WHERE id = NEW.id;
  RETURN NEW;
END $$;

CREATE TRIGGER trg_sync_claim_medico_id
AFTER INSERT OR UPDATE OF ref_id ON public.usuarios
FOR EACH ROW EXECUTE FUNCTION public.sincronizar_claim_medico_id();

-- ============================================================================
-- FIM. VALIDAÇÕES PÓS-APLICAÇÃO (rodar manualmente):
--   SELECT pgp_sym_decrypt(google_refresh_token::bytea,
--          (SELECT encryption_key FROM app_settings)) FROM usuarios LIMIT 1;
--   SELECT * FROM pg_policies WHERE schemaname = 'public' ORDER BY tablename;
-- ============================================================================
