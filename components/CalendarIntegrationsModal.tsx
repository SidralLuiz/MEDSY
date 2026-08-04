'use client';

import React, { useState } from 'react';
import { Calendar, CheckCircle2, ExternalLink, X, Sparkles } from 'lucide-react';
import { Usuario, dbService } from '@/lib/db';

interface CalendarIntegrationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: Usuario | null;
  onUpdateUserStatus: () => void;
}

export const CalendarIntegrationsModal: React.FC<CalendarIntegrationsModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpdateUserStatus
}) => {
  const [loadingGoogle, setLoadingGoogle] = useState(false);

  if (!isOpen) return null;

  const isGoogleConnected = currentUser?.google_connected ?? true;

  const handleConnectGoogle = () => {
    setLoadingGoogle(true);
    const userId = currentUser?.id || 'f1000000-0000-0000-0000-000000000001';
    window.location.href = `/api/auth/google?userId=${userId}`;
  };

  const handleToggleGoogle = async () => {
    if (!currentUser) return;
    setLoadingGoogle(true);
    await dbService.toggleCalendarConnection(currentUser.id, 'google', !isGoogleConnected);
    onUpdateUserStatus();
    setLoadingGoogle(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-card rounded-3xl w-full max-w-xl p-6 sm:p-8 border border-sky-500/30 shadow-2xl relative overflow-hidden">
        
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Integração com Google Calendar</h3>
              <p className="text-xs text-slate-400">Sincronização em tempo real 100% gratuita</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          
          {/* CARD GOOGLE CALENDAR */}
          <div className="glass-card rounded-2xl p-5 border border-slate-800 flex items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="h-12 w-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold shrink-0 border border-blue-500/20 text-xl">
                🗓️
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="font-bold text-slate-100 text-sm">Google Calendar</h4>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
                    100% Gratuito
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Criar e sincronizar eventos nas agendas do médico e paciente no Google Workspace/Gmail.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleConnectGoogle}
                disabled={loadingGoogle}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold gradient-bg text-white shadow-lg shadow-sky-500/20 hover:opacity-90 flex items-center space-x-1.5 shrink-0"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Conectar Google</span>
              </button>

              <button
                onClick={handleToggleGoogle}
                className={`p-2.5 rounded-xl text-xs border transition-all ${
                  isGoogleConnected
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
                title="Alternar Status de Conexão"
              >
                <CheckCircle2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* DICA DE SINCRONIZAÇÃO */}
          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 flex items-start space-x-3 text-slate-300">
            <Sparkles className="h-4 w-4 text-sky-400 shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed">
              <p className="font-semibold text-slate-200">Como funciona a Sincronização:</p>
              <p className="text-slate-400 mt-0.5">
                Ao cadastrar ou confirmar consultas no MEDSY, os convites de agendamento são enviados e salvos automaticamente no Google Calendar dos médicos e pacientes cadastrados.
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl gradient-bg text-white font-semibold text-xs shadow-lg shadow-sky-500/20"
            >
              Concluído
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
