const { createClient } = require('@supabase/supabase-js');

const url = 'https://ltcsrbmnaqepaxmcozbm.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0Y3NyYm1uYXFlcGF4bWNvemJtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTgwMTExMCwiZXhwIjoyMTAxMzc3MTEwfQ.XDysyAABSt42onWwKI7oCqsoeEVq-T0mL6y1qonuvcI';

const supabase = createClient(url, serviceKey);

async function runSeed() {
  console.log('Verificando ou criando dados iniciais no Supabase via API Service Role...');

  // Inserir Admin
  const { error: adminErr } = await supabase.from('usuarios').upsert([
    {
      id: 'f1000000-0000-0000-0000-000000000001',
      cpf: '131',
      senha: 'paodequeijo123',
      nome: 'Luiz (Admin)',
      nivel_acesso: 4,
      cargo: 'ADMIN',
      google_connected: true,
      outlook_connected: true
    }
  ], { onConflict: 'cpf' });

  if (adminErr) {
    console.log('Erro ao inserir admin no Supabase:', adminErr.message);
  } else {
    console.log('✅ Tabela usuarios & Admin criados com sucesso no Supabase!');
  }

  // Inserir Pacientes
  const { error: pacErr } = await supabase.from('pacientes').upsert([
    { id: 'a1000000-0000-0000-0000-000000000001', nome: 'Luiz Fernando Sidral', cpf: '82815453991', email: 'luiz.sidral@email.com', data_nascimento: '17/05/1998', telefone: '(47) 99141-5518', endereco: 'Rua 15 de Agosto, 2103' },
    { id: 'a1000000-0000-0000-0000-000000000002', nome: 'Maria Silva', cpf: '29406135700', email: 'maria.silva@email.com', data_nascimento: '12/03/1990', telefone: '(11) 91234-5678', endereco: 'Rua das Flores, 102' },
    { id: 'a1000000-0000-0000-0000-000000000003', nome: 'João Santos', cpf: '72538041900', email: 'joao123@gmail.com', data_nascimento: '04/11/1985', telefone: '(21) 99876-5432', endereco: 'Av. Atlântica, 500' }
  ], { onConflict: 'cpf' });

  if (pacErr) {
    console.log('Erro ao inserir pacientes:', pacErr.message);
  } else {
    console.log('✅ Tabela pacientes & registros seed populados com sucesso!');
  }

  // Inserir Médicos
  const { error: medErr } = await supabase.from('medicos').upsert([
    { id: 'b1000000-0000-0000-0000-000000000001', nome: 'Dr. Carlos Oliveira', cpf: '51892637000', email: 'carlos.oliveira@yahoo.com', data_nascimento: '22/08/1980', telefone: '(47) 99141-3413', endereco: 'Rua 16 de Agosto, 45', crm: '123456/SP', especialidade: 'Cardiologia', senha: '2103' },
    { id: 'b1000000-0000-0000-0000-000000000002', nome: 'Dra. Ana Beatriz', cpf: '61928374511', email: 'ana.beatriz@medsy.com', data_nascimento: '10/01/1988', telefone: '(47) 98877-6655', endereco: 'Av. Brasil, 890', crm: '654321/SC', especialidade: 'Pediatria', senha: '123456' }
  ], { onConflict: 'cpf' });

  if (medErr) {
    console.log('Erro ao inserir medicos:', medErr.message);
  } else {
    console.log('✅ Tabela medicos populada!');
  }
}

runSeed();
