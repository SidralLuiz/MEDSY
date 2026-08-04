'use client';

import React, { useState } from 'react';
import { Database, CheckCircle2, AlertTriangle, Copy, Check, ExternalLink, X, Code2 } from 'lucide-react';
import { isSupabaseConfigured } from '@/lib/supabase';

interface DatabaseStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DatabaseStatusModal: React.FC<DatabaseStatusModalProps> = ({
  isOpen,
  onClose
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyEnv = () => {
    const text = `NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co\nNEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima-aqui`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="glass-card rounded-3xl w-full max-w-xl p-6 sm:p-8 border border-slate-700 shadow-2xl relative">
        
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
          <div className="flex items-center space-x-3">
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold ${
              isSupabaseConfigured ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
            }`}>
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Status do Banco de Dados</h3>
              <p className="text-xs text-slate-400">PostgreSQL (Supabase) Integration</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          {/* STATUS INDICATOR */}
          <div className={`p-4 rounded-2xl border flex items-start space-x-3 ${
            isSupabaseConfigured
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
          }`}>
            {isSupabaseConfigured ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
            )}

            <div>
              <h4 className="font-bold text-sm">
                {isSupabaseConfigured ? 'Conexão Supabase Ativa' : 'Modo Demonstrativo com Engine Local Ativo'}
              </h4>
              <p className="text-xs mt-1 text-slate-300">
                {isSupabaseConfigured
                  ? 'A aplicação está conectada diretamente ao seu projeto PostgreSQL Supabase.'
                  : 'Atualmente o sistema está rodando com persitência local offline. Para conectar seu banco Supabase real, adicione as chaves no arquivo `.env.local` e execute o script SQL disponibilizado.'}
              </p>
            </div>
          </div>

          {/* INSTRUÇÕES PARA CONECTAR AO SUPABASE */}
          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-3">
            <h4 className="font-bold text-slate-200 text-xs flex items-center space-x-2">
              <Code2 className="h-4 w-4 text-sky-400" />
              <span>Passo a Passo de Configuração do Supabase:</span>
            </h4>

            <ol className="list-decimal list-inside space-y-1.5 text-slate-400 text-[11px] leading-relaxed">
              <li>Crie um projeto em <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-sky-400 underline">supabase.com</a>.</li>
              <li>Acesse o <strong>SQL Editor</strong> do painel e execute o conteúdo do arquivo <code className="text-emerald-400 bg-slate-950 px-1 py-0.5 rounded">supabase_schema.sql</code>.</li>
              <li>Copie a <strong>Project URL</strong> e a <strong>anon key</strong> em <strong>Project Settings -&gt; API</strong>.</li>
              <li>Cole as variáveis no seu arquivo <code className="text-emerald-400 bg-slate-950 px-1 py-0.5 rounded">.env.local</code> na raiz do projeto.</li>
            </ol>

            <button
              onClick={handleCopyEnv}
              className="flex items-center space-x-2 text-[11px] font-semibold px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 transition-all"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? 'Variáveis Copiadas!' : 'Copiar Modelo de Variáveis .env.local'}</span>
            </button>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl gradient-bg text-white font-semibold shadow-lg shadow-sky-500/20"
            >
              Entendido
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
