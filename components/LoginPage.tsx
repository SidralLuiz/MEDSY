'use client';

import React, { useState } from 'react';
import { 
  Activity, 
  User, 
  KeyRound, 
  ShieldCheck, 
  Sparkles, 
  Calendar, 
  Users, 
  Stethoscope, 
  ArrowRight,
  HeartPulse,
  Lock,
  Database
} from 'lucide-react';
import { dbService, Usuario } from '@/lib/db';

interface LoginPageProps {
  onLoginSuccess: (user: Usuario) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [cpf, setCpf] = useState('131');
  const [senha, setSenha] = useState('paodequeijo123');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const user = await dbService.autencicarUsuario(cpf, senha);
      if (user) {
        onLoginSuccess(user);
      } else {
        setErrorMsg('CPF ou Senha incorretos. Verifique suas credenciais.');
      }
    } catch (err) {
      setErrorMsg('Erro ao conectar com o sistema.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (demoCpf: string, demoSenha: string) => {
    setCpf(demoCpf);
    setSenha(demoSenha);
    setLoading(true);
    setErrorMsg('');

    try {
      const user = await dbService.autencicarUsuario(demoCpf, demoSenha);
      if (user) {
        onLoginSuccess(user);
      }
    } catch (err) {
      setErrorMsg('Erro no login rápido.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#040711] text-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-10 relative overflow-hidden">
      
      {/* GLOW DE FUNDO */}
      <div className="absolute top-1/4 left-10 w-96 h-96 rounded-full bg-sky-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-purple-500/10 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-6xl glass-card rounded-3xl border border-slate-800/80 shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 relative z-10">
        
        {/* LADO ESQUERDO: BRANDING & FEATURES HERO */}
        <div className="lg:col-span-6 p-8 lg:p-12 bg-gradient-to-br from-slate-950 via-[#070d1e] to-slate-900 border-b lg:border-b-0 lg:border-r border-slate-800/80 flex flex-col justify-between relative overflow-hidden">
          
          <div className="relative z-10 space-y-6">
            
            {/* LOGO */}
            <div className="flex items-center space-x-3">
              <div className="h-12 w-12 rounded-2xl gradient-bg flex items-center justify-center shadow-xl shadow-sky-500/25">
                <Activity className="h-7 w-7 text-white animate-pulse" />
              </div>
              <div>
                <span className="text-2xl font-black tracking-wider gradient-text">MEDSY</span>
                <p className="text-xs text-slate-400 font-medium">Gestão Médica Inteligente v5.0</p>
              </div>
            </div>

            {/* TÍTULO PRINCIPAL */}
            <div className="space-y-3 pt-4">
              <span className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/30 text-xs font-semibold">
                <HeartPulse className="h-3.5 w-3.5 text-sky-400" />
                <span>Plataforma Médica Modernizada</span>
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
                Controle total da sua <span className="gradient-text">clínica e agendamentos</span>.
              </h1>
              <p className="text-sm text-slate-400 leading-relaxed">
                Sistema de prontuários, equipe médica e sincronização em tempo real com **Google Calendar**.
              </p>
            </div>

            {/* RECURSOS EM DESTAQUE */}
            <div className="space-y-3 pt-2 text-xs text-slate-300">
              <div className="flex items-center space-x-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
                <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 shrink-0">
                  <Calendar className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-bold text-slate-200">Google Calendar Sync</p>
                  <p className="text-[11px] text-slate-400">Eventos criados automaticamente na agenda de médicos e pacientes.</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 shrink-0">
                  <Stethoscope className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-bold text-slate-200">Gestão de Corpo Médico & Staff</p>
                  <p className="text-[11px] text-slate-400">Cadastros de CRM, especialidades e perfil de secretárias.</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
                  <Database className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-bold text-slate-200">Armazenamento Seguro em Nuvem</p>
                  <p className="text-[11px] text-slate-400">Proteção de dados com controle de níveis de acesso.</p>
                </div>
              </div>
            </div>

          </div>

          <div className="pt-8 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-between">
            <span>© 2026 MEDSY Inc. Todos os direitos reservados.</span>
            <span className="text-sky-400 font-semibold">MEDSY v5.0 Enterprise</span>
          </div>
        </div>

        {/* LADO DIREITO: FORMULÁRIO DE LOGIN E CARDS PRÉ-DEFINIDOS */}
        <div className="lg:col-span-6 p-8 lg:p-12 bg-[#080d1e]/90 flex flex-col justify-center space-y-6">
          
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
              <Lock className="h-5 w-5 text-sky-400" />
              <span>Acessar o Sistema</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Informe seu CPF e senha cadastrados ou selecione um perfil pré-definido abaixo.
            </p>
          </div>

          {/* CARDS DE ACESSO RÁPIDO PRÉ-DEFINIDOS */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold tracking-wider text-sky-400 uppercase flex items-center space-x-1">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Selecione um Perfil Pré-definido para Entrar:</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              
              {/* ADMIN CARD */}
              <button
                type="button"
                onClick={() => handleQuickLogin('131', 'paodequeijo123')}
                className="p-3 rounded-2xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-left transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-sky-300">Administrador</span>
                  <ArrowRight className="h-3.5 w-3.5 text-sky-400 group-hover:translate-x-1 transition-transform" />
                </div>
                <p className="text-[10px] text-slate-300 font-semibold mt-1">Luiz (Admin)</p>
                <p className="text-[9px] text-slate-500 font-mono mt-0.5">CPF: 131</p>
              </button>

              {/* MÉRICO CARD */}
              <button
                type="button"
                onClick={() => handleQuickLogin('51892637000', '2103')}
                className="p-3 rounded-2xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-left transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-300">Médico</span>
                  <ArrowRight className="h-3.5 w-3.5 text-purple-400 group-hover:translate-x-1 transition-transform" />
                </div>
                <p className="text-[10px] text-slate-300 font-semibold mt-1">Dr. Carlos</p>
                <p className="text-[9px] text-slate-500 font-mono mt-0.5">Cardiologia</p>
              </button>

              {/* SECRETÁRIA CARD */}
              <button
                type="button"
                onClick={() => handleQuickLogin('05824196300', '2103')}
                className="p-3 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-left transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-300">Secretária</span>
                  <ArrowRight className="h-3.5 w-3.5 text-emerald-400 group-hover:translate-x-1 transition-transform" />
                </div>
                <p className="text-[10px] text-slate-300 font-semibold mt-1">Luiza Martins</p>
                <p className="text-[9px] text-slate-500 font-mono mt-0.5">Recepção</p>
              </button>

            </div>
          </div>

          <div className="relative py-1">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase">
              <span className="bg-[#080d1e] px-3 text-slate-500 font-bold">ou digite suas credenciais</span>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs text-center font-medium">
              {errorMsg}
            </div>
          )}

          {/* FORMULÁRIO DE LOGIN */}
          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">CPF do Usuário</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="Ex: 131 ou 518.926.370-00"
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value)}
                  className="w-full glass-input pl-10 pr-4 py-3 rounded-xl text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Senha de Acesso</label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="w-full glass-input pl-10 pr-4 py-3 rounded-xl text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl gradient-bg text-white font-bold shadow-xl shadow-sky-500/25 hover:opacity-95 transition-all text-sm flex items-center justify-center space-x-2 mt-2"
            >
              <ShieldCheck className="h-4 w-4" />
              <span>{loading ? 'Autenticando...' : 'Entrar no MEDSY'}</span>
            </button>
          </form>

        </div>

      </div>

    </div>
  );
};
