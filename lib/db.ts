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
  { id: 'a1000000-0000-0000-0000-000000000001', nome: 'Paciente Teste Um', cpf: '11111111111', email: 'paciente1@teste.local', data_nascimento: '01/01/1980', telefone: '(00) 00000-0001', endereco: 'Rua Fictícia, 100', google_connected: false },
  { id: 'a1000000-0000-0000-0000-000000000002', nome: 'Paciente Teste Dois', cpf: '22222222222', email: 'paciente2@teste.local', data_nascimento: '02/02/1990', telefone: '(00) 00000-0002', endereco: 'Rua Fictícia, 200', google_connected: false },
  { id: 'a1000000-0000-0000-0000-000000000003', nome: 'Paciente Teste Tres', cpf: '33333333333', email: 'paciente3@teste.local', data_nascimento: '03/03/1985', telefone: '(00) 00000-0003', endereco: 'Av. Fictícia, 300', google_connected: false }
];

let mockMedicos: Medico[] = [
  { id: 'b1000000-0000-0000-0000-000000000001', nome: 'Dr. Medico Teste Um', cpf: '44444444444', email: 'medico1@teste.local', data_nascimento: '04/04/1980', telefone: '(00) 00000-0004', endereco: 'Rua Fictícia, 400', crm: '000001/UF', especialidade: 'Cardiologia', google_connected: false },
  { id: 'b1000000-0000-0000-0000-000000000002', nome: 'Dra. Medica Teste Dois', cpf: '55555555555', email: 'medico2@teste.local', data_nascimento: '05/05/1988', telefone: '(00) 00000-0005', endereco: 'Av. Fictícia, 500', crm: '000002/UF', especialidade: 'Pediatria', google_connected: false }
];

let mockSecretarias: Secretaria[] = [
  { id: 'c1000000-0000-0000-0000-000000000001', nome: 'Secretaria Teste', cpf: '66666666666', email: 'secretaria@teste.local', data_nascimento: '06/06/1995', telefone: '(00) 00000-0006', endereco: 'Rua Fictícia, 600', google_connected: false }
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
      try {
        const { data, error } = await supabase.from('pacientes').select('*').order('nome');
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase catch fallback pac:', err);
      }
    }
    return [...mockPacientes];
  },

  async addPaciente(p: Omit<Paciente, 'id'>): Promise<Paciente> {
    const newId = crypto.randomUUID();
    const newP = { ...p, id: newId, google_connected: false, outlook_connected: false };
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('pacientes').insert([newP]).select().single();
        if (!error && data) {
          mockPacientes.unshift(data);
          return data;
        }
      } catch (err) {
        console.warn('Erro ao inserir paciente no Supabase, salvando localmente:', err);
      }
    }
    mockPacientes.unshift(newP);
    return newP;
  },

  async updatePaciente(id: string, p: Partial<Paciente>): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('pacientes').update(p).eq('id', id);
      } catch (err) {
        console.warn('Err update Supabase:', err);
      }
    }
    mockPacientes = mockPacientes.map(item => item.id === id ? { ...item, ...p } : item);
  },

  async deletePaciente(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('pacientes').delete().eq('id', id);
      } catch (err) {
        console.warn('Err delete Supabase:', err);
      }
    }
    mockPacientes = mockPacientes.filter(p => p.id !== id);
  },

  // MÉDICOS
  async getMedicos(): Promise<Medico[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('medicos')
          .select('id, nome, cpf, email, data_nascimento, telefone, endereco, crm, especialidade, google_connected, outlook_connected, criado_em')
          .order('nome');
        if (!error && data) return data;
      } catch (err) {}
    }
    return [...mockMedicos];
  },

  async addMedico(m: Omit<Medico, 'id'>): Promise<Medico> {
    const newId = crypto.randomUUID();
    const { senha: _senha, ...dadosPublicos } = m;
    const newM = { ...dadosPublicos, id: newId, google_connected: false, outlook_connected: false };
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('medicos').insert([newM]).select().single();
        if (!error && data) {
          mockMedicos.unshift(data);
          return data;
        }
      } catch (err) {}
    }
    mockMedicos.unshift(newM);
    return newM;
  },

  async updateMedico(id: string, m: Partial<Medico>): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('medicos').update(m).eq('id', id);
      } catch (err) {}
    }
    mockMedicos = mockMedicos.map(item => item.id === id ? { ...item, ...m } : item);
  },

  async deleteMedico(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('medicos').delete().eq('id', id);
      } catch (err) {}
    }
    mockMedicos = mockMedicos.filter(m => m.id !== id);
  },

  // SECRETÁRIAS
  async getSecretarias(): Promise<Secretaria[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('secretarias')
          .select('id, nome, cpf, email, data_nascimento, telefone, endereco, google_connected, outlook_connected, criado_em')
          .order('nome');
        if (!error && data) return data;
      } catch (err) {}
    }
    return [...mockSecretarias];
  },

  async addSecretaria(s: Omit<Secretaria, 'id'>): Promise<Secretaria> {
    const newId = crypto.randomUUID();
    const { senha: _senha, ...dadosPublicos } = s;
    const newS = { ...dadosPublicos, id: newId, google_connected: false, outlook_connected: false };
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('secretarias').insert([newS]).select().single();
        if (!error && data) {
          mockSecretarias.unshift(data);
          return data;
        }
      } catch (err) {}
    }
    mockSecretarias.unshift(newS);
    return newS;
  },

  async deleteSecretaria(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('secretarias').delete().eq('id', id);
      } catch (err) {}
    }
    mockSecretarias = mockSecretarias.filter(s => s.id !== id);
  },

  // CONSULTAS
  async getConsultas(): Promise<Consulta[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('consultas').select('*').order('data_consulta', { ascending: true });
        if (!error && data) return data;
      } catch (err) {}
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
      try {
        const { data, error } = await supabase.from('consultas').insert([newC]).select().single();
        if (!error && data) {
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
          mockConsultas.unshift(data);
          return data;
        }
      } catch (err) {}
    }

    mockConsultas.unshift(newC);
    mockTransacoes.unshift({
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
      try {
        await supabase.from('consultas').update({ status }).eq('id', id);
      } catch (err) {}
    }
    mockConsultas = mockConsultas.map(item => item.id === id ? { ...item, status } : item);
  },

  // HORÁRIOS DISPONÍVEIS
  async getHorarios(): Promise<HorarioDisponivel[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('horarios_disponiveis').select('*');
        if (!error && data) return data;
      } catch (err) {}
    }
    return [...mockHorarios];
  },

  async addHorario(h: Omit<HorarioDisponivel, 'id'>): Promise<HorarioDisponivel> {
    const newId = crypto.randomUUID();
    const newH = { ...h, id: newId };
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('horarios_disponiveis').insert([newH]).select().single();
        if (!error && data) {
          mockHorarios.push(data);
          return data;
        }
      } catch (err) {}
    }
    mockHorarios.push(newH);
    return newH;
  },

  // FINANÇAS & LINKS DE PAGAMENTO
  async getTransacoes(): Promise<TransacaoFinanceira[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('transacoes_financeiras').select('*').order('criado_em', { ascending: false });
        if (!error && data) return data;
      } catch (err) {}
    }
    return [...mockTransacoes];
  },

  async addTransacao(t: Omit<TransacaoFinanceira, 'id'>): Promise<TransacaoFinanceira> {
    const newId = crypto.randomUUID();
    const newT = { ...t, id: newId };
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('transacoes_financeiras').insert([newT]).select().single();
        if (!error && data) {
          mockTransacoes.unshift(data);
          return data;
        }
      } catch (err) {}
    }
    mockTransacoes.unshift(newT);
    return newT;
  },

  async updateTransacaoStatus(id: string, status: TransacaoFinanceira['status']): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('transacoes_financeiras').update({ status }).eq('id', id);
      } catch (err) {}
    }
    mockTransacoes = mockTransacoes.map(t => t.id === id ? { ...t, status } : t);
  },

  // FILA DE ATENDIMENTO & PAINEL DE SENHAS
  async getFila(): Promise<ItemFila[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('fila_atendimento').select('*').order('horario_chegada', { ascending: true });
        if (!error && data) return data;
      } catch (err) {}
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
      try {
        const { data, error } = await supabase.from('fila_atendimento').insert([newItem]).select().single();
        if (!error && data) {
          mockFila.push(data);
          return data;
        }
      } catch (err) {}
    }

    mockFila.push(newItem);
    return newItem;
  },

  async chamarProximoFila(medico_nome: string, consultorio: string): Promise<ItemFila | null> {
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
      try {
        await supabase.from('fila_atendimento').update(updated).eq('id', proximo.id);
      } catch (err) {}
    }

    mockFila = mockFila.map(i => i.id === proximo.id ? updated : i);
    return updated;
  },

  async concluirAtendimentoFila(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('fila_atendimento').update({ status: 'CONCLUIDO' }).eq('id', id);
      } catch (err) {}
    }
    mockFila = mockFila.map(i => i.id === id ? { ...i, status: 'CONCLUIDO' } : i);
  },

  // PRONTUÁRIOS MÉDICOS
  async getProntuarios(paciente_id?: string): Promise<Prontuario[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase.from('prontuarios').select('*').order('data', { ascending: false });
        if (paciente_id) query = query.eq('paciente_id', paciente_id);
        const { data, error } = await query;
        if (!error && data) {
          const s = supabase;
          data.forEach((p) => s.rpc('registrar_acesso_prontuario', { p_prontuario_id: p.id }).then(() => {}, () => {}));
          return data;
        }
      } catch (err) {}
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
      try {
        const { data, error } = await supabase.from('prontuarios').insert([newP]).select().single();
        if (!error && data) {
          mockProntuarios.unshift(data);
          return data;
        }
      } catch (err) {}
    }
    mockProntuarios.unshift(newP);
    return newP;
  },

  // AUTENTICAÇÃO — via Supabase Auth (nunca comparar senha manualmente)
  async autencicarUsuario(cpf: string, senhaLimpa: string): Promise<Usuario | null> {    const login = cpf.replace(/\D/g, '');

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: `${login}@medsy.local`,
        password: senhaLimpa,
      });
      if (error || !data.user) return null;

      const { data: perfil, error: perfilError } = await supabase
        .from('usuarios')
        .select('id, cpf, nome, nivel_acesso, cargo, ref_id, google_connected, outlook_connected')
        .eq('id', data.user.id)
        .maybeSingle();

      if (perfilError || !perfil) return null;
      return perfil as Usuario;
    }

    return null;
  },

  async logout(): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
  },

  // ===== LGPD: CONSENTIMENTO E DIREITOS DO TITULAR (DSR) =====

  // Termo de consentimento de saúde vigente
  async getTermoConsentimento(): Promise<{ versao: string; texto_html: string } | null> {
    if (!isSupabaseConfigured || !supabase) return null;
    const { data, error } = await supabase
      .from('termos_aceite')
      .select('versao, texto_html')
      .eq('tipo', 'CONSENTIMENTO_DADOS_SAUDE')
      .eq('vigente', true)
      .maybeSingle();
    if (error || !data) return null;
    return data;
  },

  // O titular já consentiu com a versão vigente?
  async jaConsentiu(userId: string): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return true;
    const { data } = await supabase
      .from('consent_logs')
      .select('id')
      .eq('id_usuario', userId)
      .eq('consentiu', true)
      .maybeSingle();
    return Boolean(data);
  },

  // Registra o consentimento (inviolável — via RPC SECURITY DEFINER)
  async registrarConsentimento(versaoTermos: string, consentiu: boolean): Promise<void> {
    if (!isSupabaseConfigured || !supabase) return;
    await supabase.rpc('registrar_consentimento', {
      p_versao_termos: versaoTermos,
      p_finalidade: 'TATAMENTO_SAUDE',
      p_consentiu: consentiu,
      p_ip_origem: null,
      p_user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
    });
  },

  // Portabilidade (Art. 18, V) — exporta os dados do titular logado
  async exportarDadosTitular(): Promise<unknown> {
    if (!isSupabaseConfigured || !supabase) return null;
    const { data, error } = await supabase.rpc('exportar_dados_titular');
    if (error) throw error;
    return data;
  },

  async toggleCalendarConnection(userId: string, provider: 'google' | 'outlook', status: boolean): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        const updateData = provider === 'google' ? { google_connected: status } : { outlook_connected: status };
        await supabase.from('usuarios').update(updateData).eq('id', userId);
      } catch (err) {}
    }
  }
};
