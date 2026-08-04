-- ===================================================
-- MEDSY 5.0 - SCHEMAS E ESTRUTURA PARA POSTGRESQL / SUPABASE
-- Converted from legacy MySQL (MEDSY2) to PostgreSQL / Supabase
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
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. TABELA DE USUÁRIOS E AUTENTICAÇÃO / NÍVEL DE ACESSO
-- Nível 4: Administrador | Nível 3: Secretária | Nível 1: Médico
CREATE TABLE IF NOT EXISTS public.usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cpf VARCHAR(20) UNIQUE NOT NULL,
    senha VARCHAR(100) NOT NULL,
    nome VARCHAR(100) NOT NULL,
    nivel_acesso INT NOT NULL DEFAULT 1,
    cargo VARCHAR(30) NOT NULL, -- 'ADMIN', 'SECRETARIA', 'MEDICO'
    ref_id UUID, -- ID opcional apontando para a tabela de médico ou secretária
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. TABELA DE HORÁRIOS DISPONÍVEIS DOS MÉDICOS
CREATE TABLE IF NOT EXISTS public.horarios_disponiveis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    medico_id UUID REFERENCES public.medicos(id) ON DELETE CASCADE,
    medico_nome VARCHAR(100) NOT NULL,
    especialidade VARCHAR(50) NOT NULL,
    dia_semana INT NOT NULL, -- 1=Segunda, 2=Terça... 7=Domingo
    horario VARCHAR(10) NOT NULL, -- Ex: "08:00", "09:30"
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
    status VARCHAR(20) DEFAULT 'AGENDADA', -- 'AGENDADA', 'CONFIRMADA', 'REALIZADA', 'CANCELADA'
    observacoes TEXT,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ===================================================
-- DADOS INICIAIS DE TESTE / SEED DATA
-- Conversão dos registros SQL legados do MEDSY2
-- ===================================================

-- Inserir Administrador Padrão
INSERT INTO public.usuarios (cpf, senha, nome, nivel_acesso, cargo)
VALUES ('131', 'paodequeijo123', 'Luiz (Admin)', 4, 'ADMIN')
ON CONFLICT (cpf) DO NOTHING;

-- Inserir Pacientes
INSERT INTO public.pacientes (nome, cpf, email, data_nascimento, telefone, endereco) VALUES
('Luiz Fernando Sidral', '82815453991', 'luiz.sidral@email.com', '17/05/1998', '(47) 99141-5518', 'Rua 15 de Agosto, 2103'),
('Maria Silva', '29406135700', 'maria.silva@email.com', '12/03/1990', '(11) 91234-5678', 'Rua das Flores, 102'),
('João Santos', '72538041900', 'joao123@gmail.com', '04/11/1985', '(21) 99876-5432', 'Av. Atlântica, 500')
ON CONFLICT (cpf) DO NOTHING;

-- Inserir Médicos
INSERT INTO public.medicos (nome, cpf, email, data_nascimento, telefone, endereco, crm, especialidade, senha) VALUES
('Dr. Carlos Oliveira', '51892637000', 'carlos.oliveira@yahoo.com', '22/08/1980', '(47) 99141-3413', 'Rua 16 de Agosto, 45', '123456/SP', 'Cardiologia', '2103'),
('Dra. Ana Beatriz', '61928374511', 'ana.beatriz@medsy.com', '10/01/1988', '(47) 98877-6655', 'Av. Brasil, 890', '654321/SC', 'Pediatria', '123456')
ON CONFLICT (cpf) DO NOTHING;

-- Criar Login para Médicos
INSERT INTO public.usuarios (cpf, senha, nome, nivel_acesso, cargo) VALUES
('51892637000', '2103', 'Dr. Carlos Oliveira', 1, 'MEDICO'),
('61928374511', '123456', 'Dra. Ana Beatriz', 1, 'MEDICO')
ON CONFLICT (cpf) DO NOTHING;

-- Inserir Secretárias
INSERT INTO public.secretarias (nome, cpf, email, data_nascimento, telefone, endereco, senha) VALUES
('Luiza Martins', '05824196300', 'ana.martins@hotmail.com', '15/09/1995', '(47) 99141-9988', 'Rua 15 de Agosto, 100', '2103')
ON CONFLICT (cpf) DO NOTHING;

-- Criar Login para Secretária
INSERT INTO public.usuarios (cpf, senha, nome, nivel_acesso, cargo) VALUES
('05824196300', '2103', 'Luiza Martins (Secretária)', 3, 'SECRETARIA')
ON CONFLICT (cpf) DO NOTHING;

-- Inserir Horários Disponíveis
INSERT INTO public.horarios_disponiveis (medico_nome, especialidade, dia_semana, horario) VALUES
('Dr. Carlos Oliveira', 'Cardiologia', 1, '08:00'),
('Dr. Carlos Oliveira', 'Cardiologia', 1, '09:00'),
('Dr. Carlos Oliveira', 'Cardiologia', 1, '10:30'),
('Dr. Carlos Oliveira', 'Cardiologia', 1, '14:00'),
('Dra. Ana Beatriz', 'Pediatria', 2, '08:30'),
('Dra. Ana Beatriz', 'Pediatria', 2, '10:00'),
('Dra. Ana Beatriz', 'Pediatria', 2, '13:30');

-- Inserir Consultas Iniciais
INSERT INTO public.consultas (paciente_nome, medico_nome, especialidade, data_consulta, horario, status, observacoes) VALUES
('Luiz Fernando Sidral', 'Dr. Carlos Oliveira', 'Cardiologia', CURRENT_DATE, '09:00', 'CONFIRMADA', 'Exame de rotina e eletrocardiograma'),
('Maria Silva', 'Dra. Ana Beatriz', 'Pediatria', CURRENT_DATE + INTERVAL '1 day', '10:00', 'AGENDADA', 'Consulta pediátrica de acompanhamento');
