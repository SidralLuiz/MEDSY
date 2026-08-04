import { supabase, isSupabaseConfigured } from './supabase';

export interface Paciente {
  id: string;
  nome: string;
  cpf: string;
  email: string;
  data_nascimento: string;
  telefone: string;
  endereco: string;
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
  criado_em?: string;
}

export interface HorarioDisponivel {
  id: string;
  medico_id?: string;
  medico_nome: string;
  especialidade: string;
  dia_semana: number; // 1 to 7
  horario: string;
  disponivel: boolean;
  criado_em?: string;
}

export interface Usuario {
  id: string;
  cpf: string;
  senha: string;
  nome: string;
  nivel_acesso: number; // 4=Admin, 3=Secretaria, 1=Medico
  cargo: 'ADMIN' | 'SECRETARIA' | 'MEDICO';
}

// Dados padrão iniciais (do banco MEDSY2 legado)
const INITIAL_PACIENTES: Paciente[] = [
  {
    id: 'p1',
    nome: 'Luiz Fernando Sidral',
    cpf: '82815453991',
    email: 'luiz.sidral@email.com',
    data_nascimento: '17/05/1998',
    telefone: '(47) 99141-5518',
    endereco: 'Rua 15 de Agosto, 2103'
  },
  {
    id: 'p2',
    nome: 'Maria Silva',
    cpf: '29406135700',
    email: 'maria.silva@email.com',
    data_nascimento: '12/03/1990',
    telefone: '(11) 91234-5678',
    endereco: 'Rua das Flores, 102'
  },
  {
    id: 'p3',
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
    id: 'm1',
    nome: 'Dr. Carlos Oliveira',
    cpf: '51892637000',
    email: 'carlos.oliveira@yahoo.com',
    data_nascimento: '22/08/1980',
    telefone: '(47) 99141-3413',
    endereco: 'Rua 16 de Agosto, 45',
    crm: '123456/SP',
    especialidade: 'Cardiologia',
    senha: '2103'
  },
  {
    id: 'm2',
    nome: 'Dra. Ana Beatriz',
    cpf: '61928374511',
    email: 'ana.beatriz@medsy.com',
    data_nascimento: '10/01/1988',
    telefone: '(47) 98877-6655',
    endereco: 'Av. Brasil, 890',
    crm: '654321/SC',
    especialidade: 'Pediatria',
    senha: '123456'
  }
];

const INITIAL_SECRETARIAS: Secretaria[] = [
  {
    id: 's1',
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
  { id: 'h1', medico_nome: 'Dr. Carlos Oliveira', especialidade: 'Cardiologia', dia_semana: 1, horario: '08:00', disponivel: true },
  { id: 'h2', medico_nome: 'Dr. Carlos Oliveira', especialidade: 'Cardiologia', dia_semana: 1, horario: '09:00', disponivel: false },
  { id: 'h3', medico_nome: 'Dr. Carlos Oliveira', especialidade: 'Cardiologia', dia_semana: 1, horario: '10:30', disponivel: true },
  { id: 'h4', medico_nome: 'Dr. Carlos Oliveira', especialidade: 'Cardiologia', dia_semana: 1, horario: '14:00', disponivel: true },
  { id: 'h5', medico_nome: 'Dra. Ana Beatriz', especialidade: 'Pediatria', dia_semana: 2, horario: '08:30', disponivel: true },
  { id: 'h6', medico_nome: 'Dra. Ana Beatriz', especialidade: 'Pediatria', dia_semana: 2, horario: '10:00', disponivel: false }
];

const getTodayString = () => new Date().toISOString().split('T')[0];
const getTomorrowString = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
};

const INITIAL_CONSULTAS: Consulta[] = [
  {
    id: 'c1',
    paciente_id: 'p1',
    paciente_nome: 'Luiz Fernando Sidral',
    medico_id: 'm1',
    medico_nome: 'Dr. Carlos Oliveira',
    especialidade: 'Cardiologia',
    data_consulta: getTodayString(),
    horario: '09:00',
    status: 'CONFIRMADA',
    observacoes: 'Exame de rotina e eletrocardiograma'
  },
  {
    id: 'c2',
    paciente_id: 'p2',
    paciente_nome: 'Maria Silva',
    medico_id: 'm2',
    medico_nome: 'Dra. Ana Beatriz',
    especialidade: 'Pediatria',
    data_consulta: getTomorrowString(),
    horario: '10:00',
    status: 'AGENDADA',
    observacoes: 'Consulta de acompanhamento'
  }
];

const INITIAL_USUARIOS: Usuario[] = [
  { id: 'u1', cpf: '131', senha: 'paodequeijo123', nome: 'Luiz (Admin)', nivel_acesso: 4, cargo: 'ADMIN' },
  { id: 'u2', cpf: '51892637000', senha: '2103', nome: 'Dr. Carlos Oliveira', nivel_acesso: 1, cargo: 'MEDICO' },
  { id: 'u3', cpf: '61928374511', senha: '123456', nome: 'Dra. Ana Beatriz', nivel_acesso: 1, cargo: 'MEDICO' },
  { id: 'u4', cpf: '05824196300', senha: '2103', nome: 'Luiza Martins', nivel_acesso: 3, cargo: 'SECRETARIA' }
];

// Helper local Storage para testes offline/mock
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

// APIs DO BANCO DE DADOS (SUPABASE OU LOCAL STORAGE FALLBACK)

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
    const newId = 'p_' + Date.now();
    const item: Paciente = { ...paciente, id: newId };
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('pacientes').insert([paciente]).select().single();
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
    const newId = 'm_' + Date.now();
    const item: Medico = { ...medico, id: newId };
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('medicos').insert([medico]).select().single();
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
    const newId = 's_' + Date.now();
    const item: Secretaria = { ...sec, id: newId };
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('secretarias').insert([sec]).select().single();
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
    const newId = 'c_' + Date.now();
    const item: Consulta = { ...consulta, id: newId };
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('consultas').insert([consulta]).select().single();
      if (!error && data) return data;
    }
    const current = loadLocalData('consultas', INITIAL_CONSULTAS);
    const updated = [item, ...current];
    saveLocalData('consultas', updated);
    return item;
  },

  async updateConsultaStatus(id: string, status: Consulta['status']): Promise<void> {
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
    const newId = 'h_' + Date.now();
    const item: HorarioDisponivel = { ...horario, id: newId };
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('horarios_disponiveis').insert([horario]).select().single();
      if (!error && data) return data;
    }
    const current = loadLocalData('horarios', INITIAL_HORARIOS);
    const updated = [item, ...current];
    saveLocalData('horarios', updated);
    return item;
  },

  // AUTENTICAÇÃO / LOGIN
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
  }
};
