'use client';

import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  Calendar, 
  Clock, 
  ShieldCheck,
  Stethoscope,
  Ticket,
  DollarSign,
  Lock,
  ChevronRight
} from 'lucide-react';
import { Usuario } from '@/lib/db';

export type ActiveTab = 'dashboard' | 'atendimento' | 'fila' | 'agendamentos' | 'financeiro' | 'pacientes' | 'equipe' | 'horarios' | 'database';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  currentUser: Usuario | null;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  currentUser
}) => {
  const isAllowed = (minLevel: number) => {
    if (!currentUser) return true;
    return currentUser.nivel_acesso >= minLevel;
  };

  const navItems = [
    {
      id: 'dashboard' as ActiveTab,
      label: 'Painel Principal',
      icon: LayoutDashboard,
      minLevel: 1,
      desc: 'Visão Geral e Métricas'
    },
    {
      id: 'atendimento' as ActiveTab,
      label: 'Atendimento Clínico',
      icon: Stethoscope,
      minLevel: 1,
      desc: 'Prontuário & Chamada'
    },
    {
      id: 'fila' as ActiveTab,
      label: 'Fila de Atendimento',
      icon: Ticket,
      minLevel: 1,
      desc: 'Totem & Painel de Senhas'
    },
    {
      id: 'agendamentos' as ActiveTab,
      label: 'Agendamentos',
      icon: Calendar,
      minLevel: 1,
      desc: 'Consultas e Calendário'
    },
    {
      id: 'financeiro' as ActiveTab,
      label: 'Financeiro & Pagamentos',
      icon: DollarSign,
      minLevel: 3,
      desc: 'Consolidação e Links PIX'
    },
    {
      id: 'pacientes' as ActiveTab,
      label: 'Pacientes',
      icon: Users,
      minLevel: 3,
      desc: 'Cadastro e Prontuários'
    },
    {
      id: 'equipe' as ActiveTab,
      label: 'Equipe Médica & Staff',
      icon: UserCheck,
      minLevel: 4,
      desc: 'Médicos e Secretárias'
    },
    {
      id: 'horarios' as ActiveTab,
      label: 'Grade de Horários',
      icon: Clock,
      minLevel: 1,
      desc: 'Horários dos Médicos'
    },
    {
      id: 'database' as ActiveTab,
      label: 'Segurança & Sistema',
      icon: ShieldCheck,
      minLevel: 4,
      desc: 'Configurações e Proteção'
    }
  ];

  return (
    <aside className="w-full lg:w-72 glass-card rounded-2xl p-4 flex flex-col justify-between shrink-0 mb-6 lg:mb-0">
      <div className="space-y-1">
        <div className="px-3 py-2 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
          Menu de Navegação
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const allowed = isAllowed(item.minLevel);
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              disabled={!allowed}
              onClick={() => allowed && setActiveTab(item.id)}
              className={`w-full flex items-center justify-between p-3.5 rounded-xl transition-all group ${
                isActive
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-lg shadow-sky-500/10'
                  : allowed
                  ? 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                  : 'text-slate-600 opacity-50 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${isActive ? 'bg-sky-500 text-white' : 'bg-slate-800/80 text-slate-400 group-hover:text-sky-400'}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold leading-none">{item.label}</p>
                  <p className="text-[10px] text-slate-400 mt-1">{item.desc}</p>
                </div>
              </div>

              {!allowed ? (
                <Lock className="h-3.5 w-3.5 text-amber-500/70" />
              ) : (
                <ChevronRight className={`h-4 w-4 transition-transform ${isActive ? 'text-sky-400 translate-x-0.5' : 'text-slate-600 opacity-0 group-hover:opacity-100'}`} />
              )}
            </button>
          );
        })}
      </div>

      {/* FOOTER INFO DA SIDEBAR */}
      <div className="pt-4 border-t border-slate-800/80 mt-4 text-center">
        <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
          <p className="text-[11px] font-semibold text-slate-300">MEDSY Enterprise</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Plataforma Médica Integrada</p>
        </div>
      </div>
    </aside>
  );
};
