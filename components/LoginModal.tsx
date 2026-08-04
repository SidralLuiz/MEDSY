'use client';

import React, { useState } from 'react';
import { User, Lock, Activity, ShieldCheck, X, KeyRound, Sparkles } from 'lucide-react';
import { dbService, Usuario } from '@/lib/db';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: Usuario) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess
}) => {
  const [cpf, setCpf] = useState('');
  const [senha, setSenha] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const user = await dbService.autencicarUsuario(cpf, senha);
      if (user) {
        onLoginSuccess(user);
        onClose();
      } else {
        setErrorMsg('CPF ou Senha incorretos. Verifique suas credenciais.');
      }
    } catch (err) {
      setErrorMsg('Erro ao efetuar login.');
    } finally {
      setLoading(false);
    }
  };

  const setDemoUser = (demoCpf: string, demoSenha: string) => {
    setCpf(demoCpf);
    setSenha(demoSenha);
    setErrorMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-card rounded-3xl w-full max-w-md p-6 sm:p-8 border border-sky-500/30 shadow-2xl relative overflow-hidden">
        
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 rounded-full bg-sky-500/20 blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl gradient-bg flex items-center justify-center shadow-lg shadow-sky-500/20">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Autenticação MEDSY</h3>
              <p className="text-xs text-slate-400">Informe seu CPF e senha</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* DEMO ACCESSIBILITY HELPER */}
        <div className="mb-5 bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
          <div className="text-[11px] font-bold text-sky-400 flex items-center space-x-1 mb-2">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Acesso Rápido para Testes:</span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-[10px]">
            <button
              type="button"
              onClick={() => setDemoUser('131', 'paodequeijo123')}
              className="px-2 py-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 font-semibold text-center"
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => setDemoUser('51892637000', '2103')}
              className="px-2 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold text-center"
            >
              Médico
            </button>
            <button
              type="button"
              onClick={() => setDemoUser('05824196300', '2103')}
              className="px-2 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold text-center"
            >
              Secretária
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs text-center font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">CPF do Usuário</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                required
                placeholder="Digite o CPF cadastrado"
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                className="w-full glass-input pl-9 pr-3 py-2.5 rounded-xl text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Senha de Acesso</label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full glass-input pl-9 pr-3 py-2.5 rounded-xl text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl gradient-bg text-white font-bold shadow-lg shadow-sky-500/25 hover:opacity-90 transition-all text-sm mt-2 flex items-center justify-center space-x-2"
          >
            <ShieldCheck className="h-4 w-4" />
            <span>{loading ? 'Autenticando...' : 'Entrar no MEDSY'}</span>
          </button>
        </form>

      </div>
    </div>
  );
};
