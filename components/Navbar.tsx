'use client';

import React from 'react';
import { Activity, User, LogOut, Shield, Database, Calendar } from 'lucide-react';
import { Usuario } from '@/lib/db';
import { isSupabaseConfigured } from '@/lib/supabase';

interface NavbarProps {
  currentUser: Usuario | null;
  onOpenLogin: () => void;
  onLogout: () => void;
  onOpenDbModal: () => void;
  onOpenCalendarModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onOpenLogin,
  onLogout,
  onOpenDbModal,
  onOpenCalendarModal
}) => {
  return (
    <header className="sticky top-0 z-30 w-full glass-card border-b border-slate-800/80 px-4 lg:px-8 py-3">
      <div className="flex items-center justify-between">
        
        {/* LOGO & BRAND */}
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl gradient-bg flex items-center justify-center shadow-lg shadow-sky-500/20">
            <Activity className="h-6 w-6 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-extrabold tracking-wider gradient-text">MEDSY</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/30 font-semibold">
                v5.0 Node + Supabase
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">Sistema Inteligente de Gestão Médica</p>
          </div>
        </div>

        {/* CONTROLES E PERFIL */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          
          {/* BOTÃO CALENDÁRIOS GOOGLE / OUTLOOK */}
          <button
            onClick={onOpenCalendarModal}
            className="flex items-center space-x-2 text-xs font-semibold px-3 py-1.5 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-300 hover:bg-sky-500/20 transition-all"
            title="Conexão com Google Calendar e Outlook"
          >
            <Calendar className="h-4 w-4 text-sky-400" />
            <span className="hidden lg:inline">Agenda Google & Outlook</span>
          </button>

          {/* BANCO DE DADOS STATUS BUTTON */}
          <button
            onClick={onOpenDbModal}
            className={`flex items-center space-x-2 text-xs font-medium px-3 py-1.5 rounded-lg border transition-all ${
              isSupabaseConfigured
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20'
            }`}
          >
            <Database className="h-4 w-4" />
            <span className="hidden md:inline">
              {isSupabaseConfigured ? 'Supabase Conectado' : 'Modo Local'}
            </span>
          </button>

          {/* PERFIL / LOGIN */}
          {currentUser ? (
            <div className="flex items-center space-x-3 bg-slate-800/60 pl-3 pr-2 py-1.5 rounded-xl border border-slate-700/50">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-lg bg-sky-600/30 text-sky-400 flex items-center justify-center font-bold text-sm">
                  {currentUser.nome.charAt(0)}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-semibold text-slate-200 leading-none">{currentUser.nome}</p>
                  <span className="text-[10px] text-sky-400 font-medium">
                    {currentUser.cargo === 'ADMIN' && 'Administrador (Nível 4)'}
                    {currentUser.cargo === 'SECRETARIA' && 'Secretária (Nível 3)'}
                    {currentUser.cargo === 'MEDICO' && 'Médico (Nível 1)'}
                  </span>
                </div>
              </div>

              <button
                onClick={onLogout}
                title="Sair da Conta"
                className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="flex items-center space-x-2 text-xs font-semibold px-4 py-2 rounded-xl gradient-bg text-white shadow-lg shadow-sky-500/20 hover:opacity-90 transition-all"
            >
              <User className="h-4 w-4" />
              <span>Entrar no Sistema</span>
            </button>
          )}

        </div>
      </div>
    </header>
  );
};
