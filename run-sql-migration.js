// Seed via Service Role — NUNCA commit keys em código.
// Uso: SUPABASE_URL=https://<ref>.supabase.co SUPABASE_SERVICE_ROLE_KEY=<key> node run-sql-migration.js
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config?.();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error('❌ Faltam NEXT_PUBLIC_SUPABASE_URL e/ou SUPABASE_SERVICE_ROLE_KEY no ambiente.');
  console.error('   Ex.: SUPABASE_SERVICE_ROLE_KEY=... node run-sql-migration.js');
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false }
});

// Seeds de TESTE com dados fictícios (sem PII real)
const adminId = 'f1000000-0000-0000-0000-000000000001';

async function runSeed() {
  console.log('Verificando ou criando dados iniciais no Supabase via API Service Role...');

  // Inserir Admin
  const { error: adminErr } = await supabase.from('usuarios').upsert([
    {
      id: adminId,
      cpf: '00000000000',
      nome: 'Admin (Teste)',
      nivel_acesso: 4,
      cargo: 'ADMIN',
      google_connected: false,
      outlook_connected: false
    }
  ], { onConflict: 'cpf' });

  if (adminErr) {
    console.log('Erro ao inserir admin no Supabase:', adminErr.message);
  } else {
    console.log('✅ Tabela usuarios & Admin criados com sucesso no Supabase!');
  }

  // Inserir Pacientes (fictícios)
  const { error: pacErr } = await supabase.from('pacientes').upsert([
    { id: 'a1000000-0000-0000-0000-000000000001', nome: 'Paciente Teste Um', cpf: '11111111111', email: 'paciente1@teste.local', data_nascimento: '01/01/1980', telefone: '(00) 00000-0001', endereco: 'Rua Fictícia, 100' },
    { id: 'a1000000-0000-0000-0000-000000000002', nome: 'Paciente Teste Dois', cpf: '22222222222', email: 'paciente2@teste.local', data_nascimento: '02/02/1990', telefone: '(00) 00000-0002', endereco: 'Rua Fictícia, 200' },
    { id: 'a1000000-0000-0000-0000-000000000003', nome: 'Paciente Teste Tres', cpf: '33333333333', email: 'paciente3@teste.local', data_nascimento: '03/03/1985', telefone: '(00) 00000-0003', endereco: 'Av. Fictícia, 300' }
  ], { onConflict: 'cpf' });

  if (pacErr) {
    console.log('Erro ao inserir pacientes:', pacErr.message);
  } else {
    console.log('✅ Tabela pacientes & registros seed populados com sucesso!');
  }

  // Inserir Médicos (fictícios)
  const { error: medErr } = await supabase.from('medicos').upsert([
    { id: 'b1000000-0000-0000-0000-000000000001', nome: 'Dr. Medico Teste Um', cpf: '44444444444', email: 'medico1@teste.local', data_nascimento: '04/04/1980', telefone: '(00) 00000-0004', endereco: 'Rua Fictícia, 400', crm: '000001/UF', especialidade: 'Cardiologia' },
    { id: 'b1000000-0000-0000-0000-000000000002', nome: 'Dra. Medica Teste Dois', cpf: '55555555555', email: 'medico2@teste.local', data_nascimento: '05/05/1988', telefone: '(00) 00000-0005', endereco: 'Av. Fictícia, 500', crm: '000002/UF', especialidade: 'Pediatria' }
  ], { onConflict: 'cpf' });

  if (medErr) {
    console.log('Erro ao inserir medicos:', medErr.message);
  } else {
    console.log('✅ Tabela medicos populada!');
  }
}

runSeed();
