'use client';

import React, { useEffect, useState } from 'react';
import { ShieldAlert, X, Loader2 } from 'lucide-react';
import { dbService } from '@/lib/db';

interface ConsentModalProps {
  onDone: () => void;
}

// Termo de consentimento de dados de saúde (LGPD — Art. 7º/11)
export const ConsentModal: React.FC<ConsentModalProps> = ({ onDone }) => {
  const [termo, setTermo] = useState<{ versao: string; texto_html: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    dbService.getTermoConsentimento().then((t) => {
      setTermo(t);
      setLoading(false);
    });
  }, []);

  const handleResponder = async (consentiu: boolean) => {
    if (!termo) return;
    setSaving(true);
    await dbService.registrarConsentimento(termo.versao, consentiu);
    setSaving(false);
    setAccepted(consentiu);
    if (consentiu) onDone();
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <div className="glass-card rounded-3xl p-8 flex flex-col items-center space-y-3">
          <Loader2 className="h-8 w-8 text-sky-400 animate-spin" />
          <p className="text-xs text-slate-400">Carregando termos de uso...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-card rounded-3xl w-full max-w-lg p-6 border border-sky-500/30 shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/30">
              <ShieldAlert className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Consentimento de Dados de Saúde</h3>
              <p className="text-xs text-slate-400">LGPD — Lei 13.709/2018 (Art. 7º e 11)</p>
            </div>
          </div>
          <button
            onClick={() => !accepted && handleResponder(false)}
            className="p-1 text-slate-400 hover:text-white rounded-lg"
            title="Recusar e encerrar acesso"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {termo ? (
          <>
            <div className="max-h-72 overflow-y-auto pr-2 space-y-4 text-xs text-slate-300 leading-relaxed">
              <div
                className="prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: termo.texto_html }}
              />
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                onClick={() => handleResponder(false)}
                disabled={saving}
                className="py-3 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 font-semibold text-xs transition-all"
              >
                Não autorizo
              </button>
              <button
                onClick={() => handleResponder(true)}
                disabled={saving}
                className="py-3 rounded-xl gradient-bg text-white font-bold shadow-lg shadow-sky-500/25 hover:opacity-90 transition-all text-xs flex items-center justify-center space-x-2"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                <span>Autorizo o tratamento</span>
              </button>
            </div>
          </>
        ) : (
          <p className="text-xs text-slate-400">
            Termo de consentimento indisponível no momento. Contate o Encarregado de Dados (DPO).
          </p>
        )}
      </div>
    </div>
  );
};
