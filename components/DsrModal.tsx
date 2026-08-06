'use client';

import React, { useState } from 'react';
import { FileDown, RefreshCcw, X, Loader2, CheckCircle2 } from 'lucide-react';
import { dbService } from '@/lib/db';

interface DsrModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Direitos do Titular (LGPD — Art. 18): portabilidade e revogação de consentimento
export const DsrModal: React.FC<DsrModalProps> = ({ isOpen, onClose }) => {
  const [exporting, setExporting] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleExport = async () => {
    setExporting(true);
    setMsg(null);
    try {
      const dados = await dbService.exportarDadosTitular();
      const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `meus-dados-medsy-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setMsg('Exportação gerada com sucesso. Arquivo baixado.');
    } catch {
      setMsg('Erro ao exportar. Verifique se o banco possui as funções de DSR aplicadas.');
    } finally {
      setExporting(false);
    }
  };

  const handleRevoke = async () => {
    setMsg(null);
    try {
      const termo = await dbService.getTermoConsentimento();
      if (termo) {
        await dbService.registrarConsentimento(termo.versao, false);
        setMsg('Consentimento revogado. O tratamento de novos dados está suspenso.');
      } else {
        setMsg('Não foi possível revogar: termo indisponível.');
      }
    } catch {
      setMsg('Erro ao revogar consentimento.');
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-card rounded-3xl w-full max-w-md p-6 border border-sky-500/30 shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
          <div>
            <h3 className="text-base font-bold text-white">Meus Dados (LGPD)</h3>
            <p className="text-xs text-slate-400">Direitos do titular — Art. 18</p>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>

        {msg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{msg}</span>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={handleExport}
            disabled={exporting}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-200 hover:bg-sky-500/20 transition-all text-xs font-semibold"
          >
            <span className="flex items-center space-x-2">
              {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
              <span>Exportar meus dados (Portabilidade)</span>
            </span>
          </button>

          <button
            onClick={handleRevoke}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 hover:bg-amber-500/20 transition-all text-xs font-semibold"
          >
            <span className="flex items-center space-x-2">
              <RefreshCcw className="h-4 w-4" />
              <span>Revogar consentimento de saúde</span>
            </span>
          </button>

          <p className="text-[10px] text-slate-500 leading-relaxed pt-2">
            Para correção, anonimização ou eliminação definitiva de dados, contate o Encarregado (DPO)
            pelo canal oficial da clínica. Prontuários são retidos anonimizados por 20 anos
            (Res. CFM 1.821/2007).
          </p>
        </div>
      </div>
    </div>
  );
};
