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
-- ===================================================

-- Inserir Administrador Padrão
INSERT INTO public.usuarios (id, cpf, senha, nome, nivel_acesso, cargo)
VALUES ('f1000000-0000-0000-0000-000000000001', '131', 'paodequeijo123', 'Luiz (Admin)', 4, 'ADMIN')
ON CONFLICT (cpf) DO NOTHING;

-- Inserir Pacientes
INSERT INTO public.pacientes (id, nome, cpf, email, data_nascimento, telefone, endereco) VALUES
('a1000000-0000-0000-0000-000000000001', 'Luiz Fernando Sidral', '82815453991', 'luiz.sidral@email.com', '17/05/1998', '(47) 99141-5518', 'Rua 15 de Agosto, 2103'),
('a1000000-0000-0000-0000-000000000002', 'Maria Silva', '29406135700', 'maria.silva@email.com', '12/03/1990', '(11) 91234-5678', 'Rua das Flores, 102'),
('a1000000-0000-0000-0000-000000000003', 'João Santos', '72538041900', 'joao123@gmail.com', '04/11/1985', '(21) 99876-5432', 'Av. Atlântica, 500')
ON CONFLICT (cpf) DO NOTHING;

-- Inserir Médicos
INSERT INTO public.medicos (id, nome, cpf, email, data_nascimento, telefone, endereco, crm, especialidade, senha) VALUES
('b1000000-0000-0000-0000-000000000001', 'Dr. Carlos Oliveira', '51892637000', 'carlos.oliveira@yahoo.com', '22/08/1980', '(47) 99141-3413', 'Rua 16 de Agosto, 45', '123456/SP', 'Cardiologia', '2103'),
('b1000000-0000-0000-0000-000000000002', 'Dra. Ana Beatriz', '61928374511', 'ana.beatriz@medsy.com', '10/01/1988', '(47) 98877-6655', 'Av. Brasil, 890', '654321/SC', 'Pediatria', '123456')
ON CONFLICT (cpf) DO NOTHING;

-- Criar Login para Médicos
INSERT INTO public.usuarios (id, cpf, senha, nome, nivel_acesso, cargo) VALUES
('f1000000-0000-0000-0000-000000000002', '51892637000', '2103', 'Dr. Carlos Oliveira', 1, 'MEDICO'),
('f1000000-0000-0000-0000-000000000003', '61928374511', '123456', 'Dra. Ana Beatriz', 1, 'MEDICO')
ON CONFLICT (cpf) DO NOTHING;

-- Inserir Secretárias
INSERT INTO public.secretarias (id, nome, cpf, email, data_nascimento, telefone, endereco, senha) VALUES
('c1000000-0000-0000-0000-000000000001', 'Luiza Martins', '05824196300', 'ana.martins@hotmail.com', '15/09/1995', '(47) 99141-9988', 'Rua 15 de Agosto, 100', '2103')
ON CONFLICT (cpf) DO NOTHING;

-- Criar Login para Secretária
INSERT INTO public.usuarios (id, cpf, senha, nome, nivel_acesso, cargo) VALUES
('f1000000-0000-0000-0000-000000000004', '05824196300', '2103', 'Luiza Martins (Secretária)', 3, 'SECRETARIA')
ON CONFLICT (cpf) DO NOTHING;
