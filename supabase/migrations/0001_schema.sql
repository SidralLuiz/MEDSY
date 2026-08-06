-- ===================================================
-- MEDSY 5.0 - SCHEMAS E ESTRUTURA PARA POSTGRESQL / SUPABASE
-- Converted from legacy MySQL (MEDSY2) to PostgreSQL / Supabase
-- Updated with valid UUID v4 primary keys
-- ===================================================

-- 1. EXTENSÕES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABELA DE PACIENTES
CREATE TABLE IF NOT EXISTS public.pacientes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(100) NOT NULL,
    cpf VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(100),
    data_nascimento VARCHAR(20),
    telefone VARCHAR(30),
    endereco TEXT,
    google_connected BOOLEAN DEFAULT FALSE,
    outlook_connected BOOLEAN DEFAULT FALSE,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. TABELA DE MÉDICOS
CREATE TABLE IF NOT EXISTS public.medicos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(100) NOT NULL,
    cpf VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(100),
    data_nascimento VARCHAR(20),
    telefone VARCHAR(30),
    endereco TEXT,
    crm VARCHAR(30) UNIQUE NOT NULL,
    especialidade VARCHAR(50) NOT NULL,
    senha VARCHAR(100) NOT NULL,
    google_refresh_token TEXT,
    google_access_token TEXT,
    google_token_expiry BIGINT,
    google_connected BOOLEAN DEFAULT FALSE,
    outlook_refresh_token TEXT,
    outlook_access_token TEXT,
    outlook_token_expiry BIGINT,
    outlook_connected BOOLEAN DEFAULT FALSE,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. TABELA DE SECRETÁRIAS
CREATE TABLE IF NOT EXISTS public.secretarias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(100) NOT NULL,
    cpf VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(100),
    data_nascimento VARCHAR(20),
    telefone VARCHAR(30),
    endereco TEXT,
    senha VARCHAR(100) NOT NULL,
    google_connected BOOLEAN DEFAULT FALSE,
    outlook_connected BOOLEAN DEFAULT FALSE,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. TABELA DE USUÁRIOS E AUTENTICAÇÃO / NÍVEL DE ACESSO
CREATE TABLE IF NOT EXISTS public.usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cpf VARCHAR(20) UNIQUE NOT NULL,
    senha VARCHAR(100) NOT NULL,
    nome VARCHAR(100) NOT NULL,
    nivel_acesso INT NOT NULL DEFAULT 1,
    cargo VARCHAR(30) NOT NULL,
    ref_id UUID,
    google_refresh_token TEXT,
    google_access_token TEXT,
    google_token_expiry BIGINT,
    google_connected BOOLEAN DEFAULT FALSE,
    outlook_refresh_token TEXT,
    outlook_access_token TEXT,
    outlook_token_expiry BIGINT,
    outlook_connected BOOLEAN DEFAULT FALSE,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. TABELA DE HORÁRIOS DISPONÍVEIS DOS MÉDICOS
CREATE TABLE IF NOT EXISTS public.horarios_disponiveis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    medico_id UUID REFERENCES public.medicos(id) ON DELETE CASCADE,
    medico_nome VARCHAR(100) NOT NULL,
    especialidade VARCHAR(50) NOT NULL,
    dia_semana INT NOT NULL,
    horario VARCHAR(10) NOT NULL,
    disponivel BOOLEAN DEFAULT TRUE,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. TABELA DE CONSULTAS
CREATE TABLE IF NOT EXISTS public.consultas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    paciente_id UUID REFERENCES public.pacientes(id) ON DELETE SET NULL,
    paciente_nome VARCHAR(100) NOT NULL,
    medico_id UUID REFERENCES public.medicos(id) ON DELETE SET NULL,
    medico_nome VARCHAR(100) NOT NULL,
    especialidade VARCHAR(50) NOT NULL,
    data_consulta DATE NOT NULL,
    horario VARCHAR(10) NOT NULL,
    status VARCHAR(20) DEFAULT 'AGENDADA',
    observacoes TEXT,
    google_event_id TEXT,
    outlook_event_id TEXT,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ===================================================
-- DADOS INICIAIS DE TESTE COM UUIDs VÁLIDOS
-- NOTA DE SEGURANÇA: dados 100% fictícios (sem PII real).
-- Senhas em claro são hasheadas automaticamente pelo trigger
-- trg_hash_senha_* (ver supabase_security.sql seção 4).
-- ===================================================

-- Inserir Administrador Padrão (teste)
INSERT INTO public.usuarios (id, cpf, senha, nome, nivel_acesso, cargo)
VALUES ('f1000000-0000-0000-0000-000000000001', '00000000000', 'senhaadmin', 'Admin Teste', 4, 'ADMIN')
ON CONFLICT DO NOTHING;

-- Inserir Pacientes (fictícios)
INSERT INTO public.pacientes (id, nome, cpf, email, data_nascimento, telefone, endereco) VALUES
('a1000000-0000-0000-0000-000000000001', 'Paciente Teste Um', '11111111111', 'paciente1@teste.local', '01/01/1980', '(00) 00000-0001', 'Rua Fictícia, 100'),
('a1000000-0000-0000-0000-000000000002', 'Paciente Teste Dois', '22222222222', 'paciente2@teste.local', '02/02/1990', '(00) 00000-0002', 'Rua Fictícia, 200'),
('a1000000-0000-0000-0000-000000000003', 'Paciente Teste Tres', '33333333333', 'paciente3@teste.local', '03/03/1985', '(00) 00000-0003', 'Av. Fictícia, 300')
ON CONFLICT DO NOTHING;

-- Inserir Médicos (fictícios)
INSERT INTO public.medicos (id, nome, cpf, email, data_nascimento, telefone, endereco, crm, especialidade, senha) VALUES
('b1000000-0000-0000-0000-000000000001', 'Dr. Medico Teste Um', '44444444444', 'medico1@teste.local', '04/04/1980', '(00) 00000-0004', 'Rua Fictícia, 400', '000001/UF', 'Cardiologia', 'senhamedico'),
('b1000000-0000-0000-0000-000000000002', 'Dra. Medica Teste Dois', '55555555555', 'medico2@teste.local', '05/05/1988', '(00) 00000-0005', 'Av. Fictícia, 500', '000002/UF', 'Pediatria', 'senhamedica')
ON CONFLICT DO NOTHING;

-- Criar Login para Médicos
INSERT INTO public.usuarios (id, cpf, senha, nome, nivel_acesso, cargo) VALUES
('f1000000-0000-0000-0000-000000000002', '44444444444', 'senhamedico', 'Dr. Medico Teste Um', 1, 'MEDICO'),
('f1000000-0000-0000-0000-000000000003', '55555555555', 'senhamedica', 'Dra. Medica Teste Dois', 1, 'MEDICO')
ON CONFLICT DO NOTHING;

-- Inserir Secretárias (fictícias)
INSERT INTO public.secretarias (id, nome, cpf, email, data_nascimento, telefone, endereco, senha) VALUES
('c1000000-0000-0000-0000-000000000001', 'Secretaria Teste', '66666666666', 'secretaria@teste.local', '06/06/1995', '(00) 00000-0006', 'Rua Fictícia, 600', 'senhasecretaria')
ON CONFLICT DO NOTHING;

-- Criar Login para Secretária
INSERT INTO public.usuarios (id, cpf, senha, nome, nivel_acesso, cargo) VALUES
('f1000000-0000-0000-0000-000000000004', '66666666666', 'senhasecretaria', 'Secretaria Teste', 3, 'SECRETARIA')
ON CONFLICT DO NOTHING;
