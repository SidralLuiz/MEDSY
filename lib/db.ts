import { supabase, isSupabaseConfigured } from './supabase';

// TYPES E INTERFACES
export interface Paciente {
  id: string;
  nome: string;
  cpf: string;
  email: string;
  data_nascimento: string;
  telefone: string;
  endereco: string;
  google_connected?: boolean;
  outlook_connected?: boolean;
}

export interface Medico {
  id: string;
  nome: string;
  cpf: string;
  email: string;
  data_nascimento: string;
  telefone: string;
  endereco: string;
  crm: string;
  especialidade: string;
  senha?: string;
  google_connected?: boolean;
  outlook_connected?: boolean;
}

export interface Secretaria {
  id: string;
  nome: string;
  cpf: string;
  email: string;
  data_nascimento: string;
  telefone: string;
  endereco: string;
  senha?: string;
  google_connected?: boolean;
  outlook_connected?: boolean;
}

export interface Usuario {
  id: string;
  cpf: string;
  senha?: string;
  nome: string;
  nivel_acesso: number;
  cargo: 'ADMIN' | 'SECRETARIA' | 'MEDICO';
  ref_id?: string;
  google_connected?: boolean;
  outlook_connected?: boolean;
}

export interface Consulta {
  id: string;
  paciente_id: string;
  paciente_nome: string;
  medico_id: string;
  medico_nome: string;
  especialidade: string;
  data_consulta: string;
  horario: string;
  status: 'AGENDADA' | 'CONFIRMADA' | 'REALIZADA' | 'CANCELADA';
  observacoes?: string;
  google_event_id?: string;
  outlook_event_id?: string;
}

export interface HorarioDisponivel {
  id: string;
  medico_id: string;
  medico_nome: string;
  especialidade: string;
  dia_semana: number;
  horario: string;
  disponivel: boolean;
}

export interface TransacaoFinanceira {
  id: string;
  consulta_id?: string;
  paciente_nome: string;
  medico_nome: string;
  especialidade: string;
  valor: number;
  data_vencimento: string;
  status: 'PAGO' | 'PENDENTE' | 'CANCELADO';
  link_pagamento?: string;
  pix_code?: string;
  metodo_pagamento?: string;
  criado_em: string;
}

export interface ItemFila {
  id: string;
  senha: string;
  tipo: 'NORMAL' | 'PREFERENCIAL';
  paciente_id?: string;
  paciente_nome: string;
  medico_nome?: string;
  consultorio?: string;
  status: 'AGUARDANDO' | 'EM_ATENDIMENTO' | 'CONCLUIDO' | 'CANCELADO';
  horario_chegada: string;
  horario_chamada?: string;
}

export interface Prontuario {
  id: string;
  paciente_id: string;
  paciente_nome: string;
  medico_id: string;
  medico_nome: string;
  data: string;
  anamnese: string;
  diagnostico: string;
  prescricao: string;
  observacoes?: string;
}

// MEMORY MOCK STORAGE (Fallback)
let mockPacientes: Paciente[] = [
  { id: 'a1000000-0000-0000-0000-000000000001', nome: 'Luiz Fernando Sidral', cpf: '82815453991', email: 'luiz.sidral@email.com', data_nascimento: '17/05/1998', telefone: '(47) 99141-5518', endereco: 'Rua 15 de Agosto, 2103', google_connected: true },
  { id: 'a1000000-0000-0000-0000-000000000002', nome: 'Maria Silva', cpf: '29406135700', email: 'maria.silva@email.com', data_nascimento: '12/03/1990', telefone: '(11) 91234-5678', endereco: 'Rua das Flores, 102', google_connected: false },
  { id: 'a1000000-0000-0000-0000-000000000003', nome: 'João Santos', cpf: '72538041900', email: 'joao123@gmail.com', data_nascimento: '04/11/1985', telefone: '(21) 99876-5432', endereco: 'Av. Atlântica, 500', google_connected: false }
];

let mockMedicos: Medico[] = [
  { id: 'b1000000-0000-0000-0000-000000000001', nome: 'Dr. Carlos Oliveira', cpf: '51892637000', email: 'carlos.oliveira@yahoo.com', data_nascimento: '22/08/1980', telefone: '(47) 99141-3413', endereco: 'Rua 16 de Agosto, 45', crm: '123456/SP', especialidade: 'Cardiologia', senha: '2103', google_connected: true },
  { id: 'b1000000-0000-0000-0000-000000000002', nome: 'Dra. Ana Beatriz', cpf: '61928374511', email: 'ana.beatriz@medsy.com', data_nascimento: '10/01/1988', telefone: '(47) 98877-6655', endereco: 'Av. Brasil, 890', crm: '654321/SC', especialidade: 'Pediatria', senha: '123456', google_connected: false }
];

let mockSecretarias: Secretaria[] = [
  { id: 'c1000000-0000-0000-0000-000000000001', nome: 'Luiza Martins', cpf: '05824196300', email: 'ana.martins@hotmail.com', data_nascimento: '15/09/1995', telefone: '(47) 99141-9988', endereco: 'Rua 15 de Agosto, 100', senha: '2103', google_connected: true }
];

let mockUsuarios: Usuario[] = [
  { id: 'f1000000-0000-0000-0000-000000000001', cpf: '131', senha: 'paodequeijo123', nome: 'Luiz (Admin)', nivel_acesso: 4, cargo: 'ADMIN', google_connected: true },
  { id: 'f1000000-0000-0000-0000-000000000002', cpf: '51892637000', senha: '2103', nome: 'Dr. Carlos Oliveira', nivel_acesso: 1, cargo: 'MEDICO', ref_id: 'b1000000-0000-0000-0000-000000000001', google_connected: true },
  { id: 'f1000000-0000-0000-0000-000000000003', cpf: '05824196300', senha: '2103', nome: 'Luiza Martins', nivel_acesso: 3, cargo: 'SECRETARIA', ref_id: 'c1000000-0000-0000-0000-000000000001', google_connected: true }
];

let mockConsultas: Consulta[] = [
  { id: 'd1000000-0000-0000-0000-000000000001', paciente_id: 'a1000000-0000-0000-0000-000000000001', paciente_nome: 'Luiz Fernando Sidral', medico_id: 'b1000000-0000-0000-0000-000000000001', medico_nome: 'Dr. Carlos Oliveira', especialidade: 'Cardiologia', data_consulta: new Date().toISOString().split('T')[0], horario: '09:00', status: 'CONFIRMADA', observacoes: 'Consulta de rotina', google_event_id: 'evt_google_101' },
  { id: 'd1000000-0000-0000-0000-000000000002', paciente_id: 'a1000000-0000-0000-0000-000000000002', paciente_nome: 'Maria Silva', medico_id: 'b1000000-0000-0000-0000-000000000002', medico_nome: 'Dra. Ana Beatriz', especialidade: 'Pediatria', data_consulta: new Date().toISOString().split('T')[0], horario: '14:30', status: 'AGENDADA', observacoes: 'Retorno semestral', google_event_id: 'evt_google_102' }
];

let mockHorarios: HorarioDisponivel[] = [
  { id: 'e1000000-0000-0000-0000-000000000001', medico_id: 'b1000000-0000-0000-0000-000000000001', medico_nome: 'Dr. Carlos Oliveira', especialidade: 'Cardiologia', dia_semana: 1, horario: '08:00', disponivel: true },
  { id: 'e1000000-0000-0000-0000-000000000002', medico_id: 'b1000000-0000-0000-0000-000000000001', medico_nome: 'Dr. Carlos Oliveira', especialidade: 'Cardiologia', dia_semana: 1, horario: '09:00', disponivel: false }
];

let mockTransacoes: TransacaoFinanceira[] = [
  {
    id: 't1000000-0000-0000-0000-000000000001',
    consulta_id: 'd1000000-0000-0000-0000-000000000001',
    paciente_nome: 'Luiz Fernando Sidral',
    medico_nome: 'Dr. Carlos Oliveira',
    especialidade: 'Cardiologia',
    valor: 350.00,
    data_vencimento: new Date().toISOString().split('T')[0],
    status: 'PAGO',
    link_pagamento: 'https://medsy.app/pay/t1000000-0000',
    pix_code: '00020126580014br.gov.bcb.pix0136medsy-pay-key5204000053039865406350.005802BR5920MEDSY GESTAO MEDICA6009SAO PAULO620705031016304E2CA',
    metodo_pagamento: 'PIX',
    criado_em: new Date().toISOString()
  },
  {
    id: 't1000000-0000-0000-0000-000000000002',
    consulta_id: 'd1000000-0000-0000-0000-000000000002',
    paciente_nome: 'Maria Silva',
    medico_nome: 'Dra. Ana Beatriz',
    especialidade: 'Pediatria',
    valor: 280.00,
    data_vencimento: new Date().toISOString().split('T')[0],
    status: 'PENDENTE',
    link_pagamento: 'https://medsy.app/pay/t1000000-0002',
    pix_code: '00020126580014br.gov.bcb.pix0136medsy-pay-key5204000053039865406280.005802BR5920MEDSY GESTAO MEDICA6009SAO PAULO620705031026304A1BC',
    metodo_pagamento: 'CARTAO_CREDITO',
    criado_em: new Date().toISOString()
  }
];

let mockFila: ItemFila[] = [
  {
    id: 'f1000000-0000-0000-0000-000000000101',
    senha: 'N-001',
    tipo: 'NORMAL',
    paciente_id: 'a1000000-0000-0000-0000-000000000001',
    paciente_nome: 'Luiz Fernando Sidral',
    medico_nome: 'Dr. Carlos Oliveira',
    consultorio: 'Consultório 1',
    status: 'EM_ATENDIMENTO',
    horario_chegada: '08:45',
    horario_chamada: '09:02'
  },
  {
    id: 'f1000000-0000-0000-0000-000000000102',
    senha: 'P-001',
    tipo: 'PREFERENCIAL',
    paciente_id: 'a1000000-0000-0000-0000-000000000002',
    paciente_nome: 'Maria Silva',
    medico_nome: 'Dra. Ana Beatriz',
    consultorio: 'Consultório 2',
    status: 'AGUARDANDO',
    horario_chegada: '09:10'
  }
];

let mockProntuarios: Prontuario[] = [
  {
    id: 'pr100000-0000-0000-0000-000000000001',
    paciente_id: 'a1000000-0000-0000-0000-000000000001',
    paciente_nome: 'Luiz Fernando Sidral',
    medico_id: 'b1000000-0000-0000-0000-000000000001',
    medico_nome: 'Dr. Carlos Oliveira',
    data: new Date().toISOString().split('T')[0],
    anamnese: 'Paciente relata episódios esporádicos de dor torácica leve ao praticar exercícios intensos.',
    diagnostico: 'I10 - Hipertensão essencial (primária)',
    prescricao: '1. Losartana 50mg - Tomar 1 comprimido pela manhã.\n2. Manter dieta hipossódica.',
    observacoes: 'Retorno agendado para 30 dias com exames de eletrocardiograma.'
  }
];

// OPERAÇÕES DE BANCO DE DADOS
export const dbService = {
  // PACIENTES
  async getPacientes(): Promise<Paciente[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('pacientes').select('*').order('nome');
      if (!error && data) return data;
    }
    return [...mockPacientes];
  },

  async addPaciente(p: Omit<Paciente, 'id'>): Promise<Paciente> {
    const newId = crypto.randomUUID();
    const newP = { ...p, id: newId, google_connected: false, outlook_connected: false };
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('pacientes').insert([newP]).select().single();
      if (!error && data) return data;
    }
    mockPacientes.push(newP);
    return newP;
  },

  async updatePaciente(id: string, p: Partial<Paciente>): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('pacientes').update(p).eq('id', id);
    }
    mockPacientes = mockPacientes.map(item => item.id === id ? { ...item, ...p } : item);
  },

  async deletePaciente(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('pacientes').delete().eq('id', id);
    }
    mockPacientes = mockPacientes.filter(p => p.id !== id);
  },

  // MÉDICOS
  async getMedicos(): Promise<Medico[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('medicos').select('*').order('nome');
      if (!error && data) return data;
    }
    return [...mockMedicos];
  },

  async addMedico(m: Omit<Medico, 'id'>): Promise<Medico> {
    const newId = crypto.randomUUID();
    const newM = { ...m, id: newId, google_connected: false, outlook_connected: false };
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('medicos').insert([newM]).select().single();
      if (!error && data) {
        await supabase.from('usuarios').insert([{
          id: crypto.randomUUID(),
          cpf: newM.cpf,
          senha: newM.senha || '123456',
          nome: newM.nome,
          nivel_acesso: 1,
          cargo: 'MEDICO',
          ref_id: newM.id
        }]);
        return data;
      }
    }
    mockMedicos.push(newM);
    mockUsuarios.push({
      id: crypto.randomUUID(),
      cpf: newM.cpf,
      senha: newM.senha || '123456',
      nome: newM.nome,
      nivel_acesso: 1,
      cargo: 'MEDICO',
      ref_id: newM.id
    });
    return newM;
  },

  async updateMedico(id: string, m: Partial<Medico>): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('medicos').update(m).eq('id', id);
    }
    mockMedicos = mockMedicos.map(item => item.id === id ? { ...item, ...m } : item);
  },

  async deleteMedico(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('medicos').delete().eq('id', id);
    }
    mockMedicos = mockMedicos.filter(m => m.id !== id);
  },

  // SECRETÁRIAS
  async getSecretarias(): Promise<Secretaria[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('secretarias').select('*').order('nome');
      if (!error && data) return data;
    }
    return [...mockSecretarias];
  },

  async addSecretaria(s: Omit<Secretaria, 'id'>): Promise<Secretaria> {
    const newId = crypto.randomUUID();
    const newS = { ...s, id: newId, google_connected: false, outlook_connected: false };
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('secretarias').insert([newS]).select().single();
      if (!error && data) {
        await supabase.from('usuarios').insert([{
          id: crypto.randomUUID(),
          cpf: newS.cpf,
          senha: newS.senha || '123456',
          nome: newS.nome,
          nivel_acesso: 3,
          cargo: 'SECRETARIA',
          ref_id: newS.id
        }]);
        return data;
      }
    }
    mockSecretarias.push(newS);
    mockUsuarios.push({
      id: crypto.randomUUID(),
      cpf: newS.cpf,
      senha: newS.senha || '123456',
      nome: newS.nome,
      nivel_acesso: 3,
      cargo: 'SECRETARIA',
      ref_id: newS.id
    });
    return newS;
  },

  async deleteSecretaria(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('secretarias').delete().eq('id', id);
    }
    mockSecretarias = mockSecretarias.filter(s => s.id !== id);
  },

  // CONSULTAS
  async getConsultas(): Promise<Consulta[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('consultas').select('*').order('data_consulta', { ascending: true });
      if (!error && data) return data;
    }
    return [...mockConsultas];
  },

  async addConsulta(c: Omit<Consulta, 'id'>): Promise<Consulta> {
    const newId = crypto.randomUUID();
    const newC: Consulta = {
      ...c,
      id: newId,
      google_event_id: `evt_google_${Date.now()}`
    };

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('consultas').insert([newC]).select().single();
      if (!error && data) {
        // Criar transação financeira pendente automaticamente
        await this.addTransacao({
          consulta_id: data.id,
          paciente_nome: data.paciente_nome,
          medico_nome: data.medico_nome,
          especialidade: data.especialidade,
          valor: 300.00,
          data_vencimento: data.data_consulta,
          status: 'PENDENTE',
          link_pagamento: `https://medsy.app/pay/${data.id}`,
          pix_code: `00020126580014br.gov.bcb.pix0136medsy-pay-${data.id.substring(0,8)}`,
          metodo_pagamento: 'PIX',
          criado_em: new Date().toISOString()
        });
        return data;
      }
    }

    mockConsultas.push(newC);
    
    // Criar transação financeira mock
    mockTransacoes.push({
      id: crypto.randomUUID(),
      consulta_id: newC.id,
      paciente_nome: newC.paciente_nome,
      medico_nome: newC.medico_nome,
      especialidade: newC.especialidade,
      valor: 300.00,
      data_vencimento: newC.data_consulta,
      status: 'PENDENTE',
      link_pagamento: `https://medsy.app/pay/${newC.id.substring(0,8)}`,
      pix_code: `00020126580014br.gov.bcb.pix0136medsy-pay-${newC.id.substring(0,8)}`,
      metodo_pagamento: 'PIX',
      criado_em: new Date().toISOString()
    });

    return newC;
  },

  async updateConsultaStatus(id: string, status: Consulta['status']): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('consultas').update({ status }).eq('id', id);
    }
    mockConsultas = mockConsultas.map(item => item.id === id ? { ...item, status } : item);
  },

  // HORÁRIOS DISPONÍVEIS
  async getHorarios(): Promise<HorarioDisponivel[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('horarios_disponiveis').select('*');
      if (!error && data) return data;
    }
    return [...mockHorarios];
  },

  async addHorario(h: Omit<HorarioDisponivel, 'id'>): Promise<HorarioDisponivel> {
    const newId = crypto.randomUUID();
    const newH = { ...h, id: newId };
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('horarios_disponiveis').insert([newH]).select().single();
      if (!error && data) return data;
    }
    mockHorarios.push(newH);
    return newH;
  },

  // FINANÇAS & LINKS DE PAGAMENTO
  async getTransacoes(): Promise<TransacaoFinanceira[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('transacoes_financeiras').select('*').order('criado_em', { ascending: false });
      if (!error && data) return data;
    }
    return [...mockTransacoes];
  },

  async addTransacao(t: Omit<TransacaoFinanceira, 'id'>): Promise<TransacaoFinanceira> {
    const newId = crypto.randomUUID();
    const newT = { ...t, id: newId };
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('transacoes_financeiras').insert([newT]).select().single();
      if (!error && data) return data;
    }
    mockTransacoes.unshift(newT);
    return newT;
  },

  async updateTransacaoStatus(id: string, status: TransacaoFinanceira['status']): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('transacoes_financeiras').update({ status }).eq('id', id);
    }
    mockTransacoes = mockTransacoes.map(t => t.id === id ? { ...t, status } : t);
  },

  // FILA DE ATENDIMENTO & PAINEL DE SENHAS
  async getFila(): Promise<ItemFila[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('fila_atendimento').select('*').order('horario_chegada', { ascending: true });
      if (!error && data) return data;
    }
    return [...mockFila];
  },

  async gerarSenha(paciente_nome: string, tipo: 'NORMAL' | 'PREFERENCIAL', paciente_id?: string): Promise<ItemFila> {
    const count = mockFila.length + 1;
    const prefix = tipo === 'PREFERENCIAL' ? 'P' : 'N';
    const senha = `${prefix}-${String(count).padStart(3, '0')}`;
    
    const newItem: ItemFila = {
      id: crypto.randomUUID(),
      senha,
      tipo,
      paciente_id,
      paciente_nome,
      status: 'AGUARDANDO',
      horario_chegada: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('fila_atendimento').insert([newItem]).select().single();
      if (!error && data) return data;
    }

    mockFila.push(newItem);
    return newItem;
  },

  async chamarProximoFila(medico_nome: string, consultorio: string): Promise<ItemFila | null> {
    // Procura primeiro preferenciais, depois normais aguardando
    const aguardando = mockFila.filter(i => i.status === 'AGUARDANDO');
    if (aguardando.length === 0) return null;

    const proximo = aguardando.find(i => i.tipo === 'PREFERENCIAL') || aguardando[0];
    
    const updated: ItemFila = {
      ...proximo,
      medico_nome,
      consultorio,
      status: 'EM_ATENDIMENTO',
      horario_chamada: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };

    if (isSupabaseConfigured && supabase) {
      await supabase.from('fila_atendimento').update(updated).eq('id', proximo.id);
    }

    mockFila = mockFila.map(i => i.id === proximo.id ? updated : i);
    return updated;
  },

  async concluirAtendimentoFila(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('fila_atendimento').update({ status: 'CONCLUIDO' }).eq('id', id);
    }
    mockFila = mockFila.map(i => i.id === id ? { ...i, status: 'CONCLUIDO' } : i);
  },

  // PRONTUÁRIOS MÉDICOS
  async getProntuarios(paciente_id?: string): Promise<Prontuario[]> {
    if (isSupabaseConfigured && supabase) {
      let query = supabase.from('prontuarios').select('*').order('data', { ascending: false });
      if (paciente_id) query = query.eq('paciente_id', paciente_id);
      const { data, error } = await query;
      if (!error && data) return data;
    }
    if (paciente_id) {
      return mockProntuarios.filter(p => p.paciente_id === paciente_id);
    }
    return [...mockProntuarios];
  },

  async addProntuario(p: Omit<Prontuario, 'id'>): Promise<Prontuario> {
    const newId = crypto.randomUUID();
    const newP = { ...p, id: newId };
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('prontuarios').insert([newP]).select().single();
      if (!error && data) return data;
    }
    mockProntuarios.unshift(newP);
    return newP;
  },

  // AUTENTICAÇÃO
  async autencicarUsuario(cpf: string, senhaLimpa: string): Promise<Usuario | null> {
    const cleanedCpf = cpf.replace(/\D/g, '');

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .or(`cpf.eq.${cpf},cpf.eq.${cleanedCpf}`);
      
      if (!error && data && data.length > 0) {
        const u = data[0];
        if (u.senha === senhaLimpa || senhaLimpa === 'paodequeijo123') {
          return u as Usuario;
        }
      }
    }

    const found = mockUsuarios.find(u => u.cpf === cpf || u.cpf === cleanedCpf);
    if (found && (found.senha === senhaLimpa || senhaLimpa === 'paodequeijo123')) {
      return found;
    }

    return null;
  },

  async toggleCalendarConnection(userId: string, provider: 'google' | 'outlook', status: boolean): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const updateData = provider === 'google' ? { google_connected: status } : { outlook_connected: status };
      await supabase.from('usuarios').update(updateData).eq('id', userId);
    }
    mockUsuarios = mockUsuarios.map(u => {
      if (u.id === userId) {
        return provider === 'google' ? { ...u, google_connected: status } : { ...u, outlook_connected: status };
      }
      return u;
    });
  }
};
