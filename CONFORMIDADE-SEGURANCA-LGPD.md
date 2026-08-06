# Plano Mestre de Conformidade — Segurança e LGPD (MEDSY 5.0)

> Plano consolidado da varredura de segurança e auditoria LGPD.
> Nada foi executado ainda — os scripts SQL existem como entregáveis.
> Legenda de status: **⏳ pendente** · **📝 script pronto** · **✋ manual (dashboard/legal)**

---

## P0 — Conter a exposição ativa (fazer HOJE)

| # | Ação | Status |
|---|------|--------|
| 1 | **Rotacionar a `service_role` key** (Supabase → Settings → API → Rotate). Ela vazou commitada em `run-sql-migration.js`; é irrevogável mesmo após purge | ✋ manual |
| 2 | Remover chave hardcoded de `run-sql-migration.js` (ler de env) | ⏳ código |
| 3 | Purge do git history (`git filter-repo`/BFG) + force push | ✋ manual |
| 4 | Trocar senhas seed conhecidas (`paodequeijo123`, `2103`, `123456`) e remover backdoor em `lib/db.ts:649,657` | ⏳ código |
| 5 | Remover botões "Acesso Rápido" com credenciais de `LoginModal.tsx:76-106` | ⏳ código |

---

## P1 — Banco de dados (SQL)

| # | Ação | Status |
|---|------|--------|
| 6 | Migrar credenciais `usuarios` → `auth.users` (bcrypt) + claims `cargo`/`medico_id` no JWT | 📝 SQL 2.0 |
| 7 | `ENABLE ROW LEVEL SECURITY` nas 7 tabelas existentes + revoke de grants `anon` | 📝 SQL 2.2 |
| 8 | **Criar as 3 tabelas faltantes** (`transacoes_financeiras`, `fila_atendimento`, `prontuarios`) + RLS | ⏳ precisa gerar CREATE TABLE |
| 9 | Políticas RLS granulares por role (ADMIN/SECRETARIA/MEDICO) em todas as tabelas | 📝 SQL 2.3 |
| 10 | `pgcrypto`: bcrypt em `senha` (trigger) + `pgp_sym_encrypt` nos tokens OAuth (trigger) + function de descriptografia só p/ dono | 📝 SQL 2.4 |
| 11 | Índices p/ RLS performático (`usuarios.id/ref_id`, `consultas.medico_id`, etc.) | 📝 SQL 2.5 |
| 12 | Tabela `termos_aceite` + `consent_logs` (com IP) + RLS própria-linha, sem UPDATE/DELETE | 📝 LGPD 3.1 |
| 13 | `audit_logs` imutável + trigger de acesso a prontuário | 📝 LGPD 3.2 |
| 14 | Functions DSR: `anonimizar_paciente`, `eliminar_paciente` (prontuário retido 20 anos), `exportar_dados_titular` | 📝 LGPD 3.3 |
| 15 | Rodar `eliminar_paciente` sobre seeds com PII real | ⏳ após 8 |

**Bloqueador:** os scripts assumem as 3 tabelas do item 8.
**Ordem de execução: 8 → 7 → 9 → 10 → 11 → 12 → 13 → 14.**

---

## P2 — Código / API (Next.js)

| # | Ação | Status |
|---|------|--------|
| 16 | Trocar auth custom → `supabase.auth.signInWithPassword`; remover `.or()` concatenado (injeção PostgREST) e `select('*')` com `senha` | ⏳ código |
| 17 | `middleware.ts` validando sessão (instalar `@supabase/ssr`) | ⏳ código |
| 18 | `app/api/calendar/sync/route.ts`: exigir sessão + validar input (instalar `zod`) | ⏳ código |
| 19 | OAuth Google/Outlook: nonce aleatório no `state` + validar CSRF + gravar tokens criptografados via Edge Function/RPC | ⏳ código |
| 20 | Não usar mais `NEXT_PUBLIC_GOOGLE_CLIENT_ID` em chamadas desnecessárias; `GOOGLE_CLIENT_SECRET` só server-side (já é) | ⏳ verificar |
| 21 | Tela de consentimento LGPD no primeiro login + botão DSR (exportar/corrigir/eliminar dados) | ⏳ código |
| 22 | Desvincular Google/Outlook (revogar tokens) em `CalendarIntegrationsModal` | ⏳ código |

---

## P3 — LGPD / Governança (fora de código)

| # | Ação | Status |
|---|------|--------|
| 23 | Documentar base legal p/ dados de saúde (Art. 11: consentimento específico + tutela da saúde) e finalidade de cada coleta | ✋ legal |
| 24 | Redigir Política de Privacidade versionada (`termos_aceite`) | ✋ legal |
| 25 | Nomear Encarregado (DPO) + canal público (Art. 41) | ✋ gestão |
| 26 | Política de retenção: consultas/fila 5 anos, prontuários 20 anos anonimizados, logs 10 anos | ✋ gestão |
| 27 | Runbook de incidente (Art. 48): notificar ANPD + titulares em 2 dias úteis | ✋ gestão |
| 28 | Base legal p/ transferência internacional (Google/Microsoft, Art. 33) | ✋ legal |
| 29 | Substituir seeds/PII reais do git por dados fictícios | ⏳ código |
| 30 | Validar conformidade: `npm run build` + testes RLS como anon/secretária/médico/admin | ⏳ validação |

---

## O que pode ser executado automaticamente

- Itens 2, 4, 5, 8, 16, 17, 18, 19, 21, 22, 29, 30 → mudanças de código + geração do `CREATE TABLE` das 3 tabelas faltantes.

## O que depende de ação manual

- Itens 1, 3, 23–28 (dashboard/legal).
- **Sem o item 1, nada no banco é seguro** — a chave vazada continua dando acesso total.
