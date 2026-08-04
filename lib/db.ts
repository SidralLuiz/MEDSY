import { supabase, isSupabaseConfigured } from './supabase';

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
  criado_em?: string;
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
  google_access_token?: string;
  google_refresh_token?: string;
  outlook_access_token?: string;
  outlook_refresh_token?: string;
  criado_em?: string;
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
  criado_em?: string;
}

export interface Consulta {
  id: string;
  paciente_id?: string;
  paciente_nome: string;
  medico_id?: string;
  medico_nome: string;
  especialidade: string;
  data_consulta: string;
  horario: string;
  status: 'AGENDADA' | 'CONFIRMADA' | 'REALIZADA' | 'CANCELADA';
  observacoes?: string;
  google_event_id?: string;
  outlook_event_id?: string;
  criado_em?: string;
}

export interface HorarioDisponivel {
  id: string;
  medico_id?: string;
  medico_nome: string;
  especialidade: string;
  dia_semana: number;
  horario: string;
  disponivel: boolean;
  criado_em?: string;
}

export interface Usuario {
  id: string;
  cpf: string;
  senha: string;
  nome: string;
  nivel_acesso: number;
  cargo: 'ADMIN' | 'SECRETARIA' | 'MEDICO';
  google_connected?: boolean;
  outlook_connected?: boolean;
}

// Helper para gerar UUID v4 válido no navegador ou Node.js
function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'f' + Date.now().toString(16) + '-4000-8000-000000000000'.substring(13);
}

// UUIDs válidos de 36 caracteres para compatibilidade total com PostgreSQL UUID
const INITIAL_PACIENTES: Paciente[] = [
  {
    id: 'a1000000-0000-0000-0000-000000000001',
    nome: 'Luiz Fernando Sidral',
    cpf: '82815453991',
    email: 'luiz.sidral@email.com',
    data_nascimento: '17/05/1998',
    telefone: '(47) 99141-5518',
    endereco: 'Rua 15 de Agosto, 2103',
    google_connected: true
  },
  {
    id: 'a1000000-0000-0000-0000-000000000002',
    nome: 'Maria Silva',
    cpf: '29406135700',
    email: 'maria.silva@email.com',
    data_nascimento: '12/03/1990',
    telefone: '(11) 91234-5678',
    endereco: 'Rua das Flores, 102'
  },
  {
    id: 'a1000000-0000-0000-0000-000000000003',
    nome: 'João Santos',
    cpf: '72538041900',
    email: 'joao123@gmail.com',
    data_nascimento: '04/11/1985',
    telefone: '(21) 99876-5432',
    endereco: 'Av. Atlântica, 500'
  }
];

const INITIAL_MEDICOS: Medico[] = [
  {
    id: 'b1000000-0000-0000-0000-000000000001',
    nome: 'Dr. Carlos Oliveira',
    cpf: '51892637000',
    email: 'carlos.oliveira@yahoo.com',
    data_nascimento: '22/08/1980',
    telefone: '(47) 99141-3413',
    endereco: 'Rua 16 de Agosto, 45',
    crm: '123456/SP',
    especialidade: 'Cardiologia',
    senha: '2103',
    google_connected: true,
    outlook_connected: true
  },
  {
    id: 'b1000000-0000-0000-0000-000000000002',
    nome: 'Dra. Ana Beatriz',
    cpf: '61928374511',
    email: 'ana.beatriz@medsy.com',
    data_nascimento: '10/01/1988',
    telefone: '(47) 98877-6655',
    endereco: 'Av. Brasil, 890',
    crm: '654321/SC',
    especialidade: 'Pediatria',
    senha: '123456',
    google_connected: true
  }
];

const INITIAL_SECRETARIAS: Secretaria[] = [
  {
    id: 'c1000000-0000-0000-0000-000000000001',
    nome: 'Luiza Martins',
    cpf: '05824196300',
    email: 'ana.martins@hotmail.com',
    data_nascimento: '15/09/1995',
    telefone: '(47) 99141-9988',
    endereco: 'Rua 15 de Agosto, 100',
    senha: '2103'
  }
];

const INITIAL_HORARIOS: HorarioDisponivel[] = [
  { id: 'd1000000-0000-0000-0000-000000000001', medico_nome: 'Dr. Carlos Oliveira', especialidade: 'Cardiologia', dia_semana: 1, horario: '08:00', disponivel: true },
  { id: 'd1000000-0000-0000-0000-000000000002', medico_nome: 'Dr. Carlos Oliveira', especialidade: 'Cardiologia', dia_semana: 1, horario: '09:00', disponivel: false },
  { id: 'd1000000-0000-0000-0000-000000000003', medico_nome: 'Dr. Carlos Oliveira', especialidade: 'Cardiologia', dia_semana: 1, horario: '10:30', disponivel: true },
  { id: 'd1000000-0000-0000-0000-000000000004', medico_nome: 'Dr. Carlos Oliveira', especialidade: 'Cardiologia', dia_semana: 1, horario: '14:00', disponivel: true },
  { id: 'd1000000-0000-0000-0000-000000000005', medico_nome: 'Dra. Ana Beatriz', especialidade: 'Pediatria', dia_semana: 2, horario: '08:30', disponivel: true },
  { id: 'd1000000-0000-0000-0000-000000000006', medico_nome: 'Dra. Ana Beatriz', especialidade: 'Pediatria', dia_semana: 2, horario: '10:00', disponivel: false }
];

const getTodayString = () => new Date().toISOString().split('T')[0];
const getTomorrowString = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
};

const INITIAL_CONSULTAS: Consulta[] = [
  {
    id: 'e1000000-0000-0000-0000-000000000001',
    paciente_id: 'a1000000-0000-0000-0000-000000000001',
    paciente_nome: 'Luiz Fernando Sidral',
    medico_id: 'b1000000-0000-0000-0000-000000000001',
    medico_nome: 'Dr. Carlos Oliveira',
    especialidade: 'Cardiologia',
    data_consulta: getTodayString(),
    horario: '09:00',
    status: 'CONFIRMADA',
    observacoes: 'Exame de rotina e eletrocardiograma',
    google_event_id: 'g_evt_sample1',
    outlook_event_id: 'o_evt_sample1'
  },
  {
    id: 'e1000000-0000-0000-0000-000000000002',
    paciente_id: 'a1000000-0000-0000-0000-000000000002',
    paciente_nome: 'Maria Silva',
    medico_id: 'b1000000-0000-0000-0000-000000000002',
    medico_nome: 'Dra. Ana Beatriz',
    especialidade: 'Pediatria',
    data_consulta: getTomorrowString(),
    horario: '10:00',
    status: 'AGENDADA',
    observacoes: 'Consulta de acompanhamento',
    google_event_id: 'g_evt_sample2'
  }
];

const INITIAL_USUARIOS: Usuario[] = [
  { id: 'f1000000-0000-0000-0000-000000000001', cpf: '131', senha: 'paodequeijo123', nome: 'Luiz (Admin)', nivel_acesso: 4, cargo: 'ADMIN', google_connected: true, outlook_connected: true },
  { id: 'f1000000-0000-0000-0000-000000000002', cpf: '51892637000', senha: '2103', nome: 'Dr. Carlos Oliveira', nivel_acesso: 1, cargo: 'MEDICO', google_connected: true, outlook_connected: true },
  { id: 'f1000000-0000-0000-0000-000000000003', cpf: '61928374511', senha: '123456', nome: 'Dra. Ana Beatriz', nivel_acesso: 1, cargo: 'MEDICO', google_connected: true },
  { id: 'f1000000-0000-0000-0000-000000000004', cpf: '05824196300', senha: '2103', nome: 'Luiza Martins', nivel_acesso: 3, cargo: 'SECRETARIA' }
];

function loadLocalData<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(`medsy_${key}`);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    return fallback;
  }
}

function saveLocalData<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`medsy_${key}`, JSON.stringify(data));
  } catch (e) {
    console.error('Erro ao salvar localData', e);
  }
}

export const dbService = {
  // PACIENTES
  async getPacientes(): Promise<Paciente[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('pacientes').select('*').order('nome');
      if (!error && data) return data;
    }
    return loadLocalData('pacientes', INITIAL_PACIENTES);
  },

  async addPaciente(paciente: Omit<Paciente, 'id'>): Promise<Paciente> {
    const newId = generateUUID();
    const item: Paciente = { ...paciente, id: newId };
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('pacientes').insert([item]).select().single();
      if (!error && data) return data;
    }
    const current = loadLocalData('pacientes', INITIAL_PACIENTES);
    const updated = [item, ...current];
    saveLocalData('pacientes', updated);
    return item;
  },

  async updatePaciente(id: string, paciente: Partial<Paciente>): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('pacientes').update(paciente).eq('id', id);
      return;
    }
    const current = loadLocalData('pacientes', INITIAL_PACIENTES);
    const updated = current.map(p => p.id === id ? { ...p, ...paciente } : p);
    saveLocalData('pacientes', updated);
  },

  async deletePaciente(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('pacientes').delete().eq('id', id);
      return;
    }
    const current = loadLocalData('pacientes', INITIAL_PACIENTES);
    const updated = current.filter(p => p.id !== id);
    saveLocalData('pacientes', updated);
  },

  // MÉDICOS
  async getMedicos(): Promise<Medico[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('medicos').select('*').order('nome');
      if (!error && data) return data;
    }
    return loadLocalData('medicos', INITIAL_MEDICOS);
  },

  async addMedico(medico: Omit<Medico, 'id'>): Promise<Medico> {
    const newId = generateUUID();
    const item: Medico = { ...medico, id: newId };
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('medicos').insert([item]).select().single();
      if (!error && data) return data;
    }
    const current = loadLocalData('medicos', INITIAL_MEDICOS);
    const updated = [item, ...current];
    saveLocalData('medicos', updated);
    return item;
  },

  async updateMedico(id: string, medico: Partial<Medico>): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('medicos').update(medico).eq('id', id);
      return;
    }
    const current = loadLocalData('medicos', INITIAL_MEDICOS);
    const updated = current.map(m => m.id === id ? { ...m, ...medico } : m);
    saveLocalData('medicos', updated);
  },

  async deleteMedico(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('medicos').delete().eq('id', id);
      return;
    }
    const current = loadLocalData('medicos', INITIAL_MEDICOS);
    const updated = current.filter(m => m.id !== id);
    saveLocalData('medicos', updated);
  },

  // SECRETÁRIAS
  async getSecretarias(): Promise<Secretaria[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('secretarias').select('*').order('nome');
      if (!error && data) return data;
    }
    return loadLocalData('secretarias', INITIAL_SECRETARIAS);
  },

  async addSecretaria(sec: Omit<Secretaria, 'id'>): Promise<Secretaria> {
    const newId = generateUUID();
    const item: Secretaria = { ...sec, id: newId };
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('secretarias').insert([item]).select().single();
      if (!error && data) return data;
    }
    const current = loadLocalData('secretarias', INITIAL_SECRETARIAS);
    const updated = [item, ...current];
    saveLocalData('secretarias', updated);
    return item;
  },

  async deleteSecretaria(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('secretarias').delete().eq('id', id);
      return;
    }
    const current = loadLocalData('secretarias', INITIAL_SECRETARIAS);
    const updated = current.filter(s => s.id !== id);
    saveLocalData('secretarias', updated);
  },

  // CONSULTAS
  async getConsultas(): Promise<Consulta[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('consultas').select('*').order('data_consulta', { ascending: true });
      if (!error && data) return data;
    }
    return loadLocalData('consultas', INITIAL_CONSULTAS);
  },

  async addConsulta(consulta: Omit<Consulta, 'id'>): Promise<Consulta> {
    const startDateTime = `${consulta.data_consulta}T${consulta.horario}:00`;
    const endDate = new Date(new Date(startDateTime).getTime() + 40 * 60000);
    const endDateTime = endDate.toISOString();

    const summary = `Consulta MEDSY: ${consulta.paciente_nome} com ${consulta.medico_nome}`;
    const description = `Consulta de ${consulta.especialidade} agendada pelo MEDSY.\nObservações: ${consulta.observacoes || 'Nenhuma'}`;

    let googleEventId = 'g_evt_' + Date.now();
    let outlookEventId = 'o_evt_' + Date.now();

    try {
      const res = await fetch('/api/calendar/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CREATE',
          payload: { summary, description, startDateTime, endDateTime }
        })
      });
      if (res.ok) {
        const resData = await res.json();
        if (resData.google_event_id) googleEventId = resData.google_event_id;
        if (resData.outlook_event_id) outlookEventId = resData.outlook_event_id;
      }
    } catch (e) {
      console.warn('Calendar sync api notice:', e);
    }

    const newId = generateUUID();
    const item: Consulta = { 
      ...consulta, 
      id: newId,
      google_event_id: googleEventId,
      outlook_event_id: outlookEventId
    };

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('consultas').insert([item]).select().single();
      if (!error && data) return data;
    }

    const current = loadLocalData('consultas', INITIAL_CONSULTAS);
    const updated = [item, ...current];
    saveLocalData('consultas', updated);
    return item;
  },

  async updateConsultaStatus(id: string, status: Consulta['status']): Promise<void> {
    const consultas = await this.getConsultas();
    const target = consultas.find(c => c.id === id);

    if (target && status === 'CANCELADA') {
      try {
        if (target.google_event_id) {
          await fetch('/api/calendar/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'DELETE', provider: 'google', eventId: target.google_event_id })
          });
        }
        if (target.outlook_event_id) {
          await fetch('/api/calendar/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'DELETE', provider: 'outlook', eventId: target.outlook_event_id })
          });
        }
      } catch (e) {
        console.warn('Calendar delete api notice:', e);
      }
    }

    if (isSupabaseConfigured && supabase) {
      await supabase.from('consultas').update({ status }).eq('id', id);
      return;
    }

    const current = loadLocalData('consultas', INITIAL_CONSULTAS);
    const updated = current.map(c => c.id === id ? { ...c, status } : c);
    saveLocalData('consultas', updated);
  },

  // HORÁRIOS
  async getHorarios(): Promise<HorarioDisponivel[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('horarios_disponiveis').select('*');
      if (!error && data) return data;
    }
    return loadLocalData('horarios', INITIAL_HORARIOS);
  },

  async addHorario(horario: Omit<HorarioDisponivel, 'id'>): Promise<HorarioDisponivel> {
    const newId = generateUUID();
    const item: HorarioDisponivel = { ...horario, id: newId };
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('horarios_disponiveis').insert([item]).select().single();
      if (!error && data) return data;
    }
    const current = loadLocalData('horarios', INITIAL_HORARIOS);
    const updated = [item, ...current];
    saveLocalData('horarios', updated);
    return item;
  },

  // AUTENTICAÇÃO / LOGIN & CALENDÁRIOS
  async autencicarUsuario(cpf: string, senha: string): Promise<Usuario | null> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('cpf', cpf)
        .eq('senha', senha)
        .single();
      if (!error && data) return data;
    }
    
    const usuarios = loadLocalData('usuarios', INITIAL_USUARIOS);
    const user = usuarios.find(u => u.cpf === cpf && u.senha === senha);
    return user || null;
  },

  async toggleCalendarConnection(userId: string, provider: 'google' | 'outlook', status: boolean): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const field = provider === 'google' ? 'google_connected' : 'outlook_connected';
      await supabase.from('usuarios').update({ [field]: status }).eq('id', userId);
      return;
    }

    const current = loadLocalData('usuarios', INITIAL_USUARIOS);
    const updated = current.map(u => {
      if (u.id === userId) {
        return provider === 'google' 
          ? { ...u, google_connected: status }
          : { ...u, outlook_connected: status };
      }
      return u;
    });
    saveLocalData('usuarios', updated);
  }
};
