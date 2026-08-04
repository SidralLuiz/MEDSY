'use client';

import React from 'react';
import { 
  Users, 
  UserPlus, 
  Calendar, 
  Clock, 
  Activity, 
  CheckCircle2, 
  AlertCircle,
  PlusCircle,
  ChevronRight,
  TrendingUp,
  HeartPulse
} from 'lucide-react';
import { Paciente, Medico, Consulta, HorarioDisponivel, Usuario } from '@/lib/db';
import { ActiveTab } from './Sidebar';

interface DashboardProps {
  pacientes: Paciente[];
  medicos: Medico[];
  consultas: Consulta[];
  horarios: HorarioDisponivel[];
  currentUser: Usuario | null;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenAgendamentoModal: () => void;
  onOpenPacienteModal: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  pacientes,
  medicos,
  consultas,
  horarios,
  currentUser,
  setActiveTab,
  onOpenAgendamentoModal,
  onOpenPacienteModal
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const hojeConsultas = consultas.filter(c => c.data_consulta === todayStr);
  const horariosLivres = horarios.filter(h => h.disponivel).length;

  return (
    <div className="space-y-6">
      
      {/* BOAS-VINDAS HERO BANNER */}
      <div className="relative overflow-hidden glass-card rounded-3xl p-6 sm:p-8 border border-sky-500/20">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/30 text-xs font-semibold mb-3">
              <HeartPulse className="h-3.5 w-3.5 animate-bounce" />
              <span>Painel de Controle MEDSY</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Bem-vindo, <span className="gradient-text">{currentUser ? currentUser.nome : 'Administrador'}</span>!
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-xl">
              Sistema de controle médico atualizado para Node.js & PostgreSQL (Supabase). Acompanhe os agendamentos, pacientes e grade horária de forma centralizada.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={onOpenAgendamentoModal}
              className="flex items-center space-x-2 text-xs font-semibold px-4 py-2.5 rounded-xl gradient-bg text-white shadow-lg shadow-sky-500/25 hover:opacity-90 transition-all"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Nova Consulta</span>
            </button>

            <button
              onClick={onOpenPacienteModal}
              className="flex items-center space-x-2 text-xs font-semibold px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
            >
              <UserPlus className="h-4 w-4 text-sky-400" />
              <span>Novo Paciente</span>
            </button>
          </div>
        </div>
      </div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* CARD 1: PACIENTES */}
        <div className="glass-card glass-card-hover rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Pacientes</span>
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-bold text-white">{pacientes.length}</div>
            <div className="flex items-center space-x-1 text-[11px] text-emerald-400 mt-1">
              <TrendingUp className="h-3 w-3" />
              <span>Cadastrados no sistema</span>
            </div>
          </div>
        </div>

        {/* CARD 2: MÉDICOS */}
        <div className="glass-card glass-card-hover rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Corpo Médico</span>
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
              <Activity className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-bold text-white">{medicos.length}</div>
            <div className="text-[11px] text-purple-300 mt-1">Especialistas ativos</div>
          </div>
        </div>

        {/* CARD 3: CONSULTAS HOJE */}
        <div className="glass-card glass-card-hover rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Consultas de Hoje</span>
            <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400">
              <Calendar className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-bold text-white">{hojeConsultas.length}</div>
            <div className="text-[11px] text-sky-300 mt-1">Agendadas para a data atual</div>
          </div>
        </div>

        {/* CARD 4: HORÁRIOS LIVRES */}
        <div className="glass-card glass-card-hover rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Vagas / Horários Livres</span>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-bold text-white">{horariosLivres}</div>
            <div className="text-[11px] text-emerald-300 mt-1">Disponíveis na grade</div>
          </div>
        </div>

      </div>

      {/* SEÇÃO PRINCIPAL: PRÓXIMAS CONSULTAS & ATALHOS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LISTA DE CONSULTAS */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-sky-400" />
                <span>Próximas Consultas Agendadas</span>
              </h2>
              <p className="text-xs text-slate-400">Agenda atual da clínica</p>
            </div>
            <button
              onClick={() => setActiveTab('agendamentos')}
              className="text-xs text-sky-400 hover:text-sky-300 font-semibold flex items-center space-x-1"
            >
              <span>Ver todas</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-medium">
                  <th className="pb-3 px-2">Paciente</th>
                  <th className="pb-3 px-2">Médico / Especialidade</th>
                  <th className="pb-3 px-2">Data & Horário</th>
                  <th className="pb-3 px-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {consultas.slice(0, 5).map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-2 font-semibold text-slate-200">{c.paciente_nome}</td>
                    <td className="py-3 px-2">
                      <div className="text-slate-300 font-medium">{c.medico_nome}</div>
                      <div className="text-[10px] text-slate-500">{c.especialidade}</div>
                    </td>
                    <td className="py-3 px-2 text-slate-300">
                      <div>{c.data_consulta}</div>
                      <div className="text-[10px] text-sky-400 font-semibold">{c.horario}h</div>
                    </td>
                    <td className="py-3 px-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        c.status === 'CONFIRMADA'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : c.status === 'AGENDADA'
                          ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30'
                          : c.status === 'REALIZADA'
                          ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                          : 'bg-red-500/10 text-red-400 border border-red-500/30'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {consultas.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-500">
                      Nenhuma consulta agendada até o momento.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ATALHOS E DICAS */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-white mb-1">Ações Rápidas</h2>
            <p className="text-xs text-slate-400 mb-4">Acesse os módulos do sistema</p>

            <div className="space-y-3">
              <button
                onClick={() => setActiveTab('pacientes')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 transition-all text-left group"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                    <Users className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-200">Gerenciar Pacientes</p>
                    <p className="text-[10px] text-slate-400">Ver cadastros e históricos</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-sky-400 transition-transform group-hover:translate-x-1" />
              </button>

              <button
                onClick={() => setActiveTab('equipe')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 transition-all text-left group"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                    <UserPlus className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-200">Equipe Médica</p>
                    <p className="text-[10px] text-slate-400">Médicos e Secretárias</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-purple-400 transition-transform group-hover:translate-x-1" />
              </button>

              <button
                onClick={() => setActiveTab('horarios')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 transition-all text-left group"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-200">Grade de Horários</p>
                    <p className="text-[10px] text-slate-400">Ajustar turnos de atendimento</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-emerald-400 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 text-slate-400 text-[11px] flex items-center space-x-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>Node.js v26 runtime ativada com persistência via Supabase PostgreSQL.</span>
          </div>
        </div>

      </div>

    </div>
  );
};
