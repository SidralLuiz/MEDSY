'use client';

import React, { useState } from 'react';
import { Calendar, CheckCircle2, XCircle, ExternalLink, RefreshCw, X, ShieldCheck, Mail, Sparkles } from 'lucide-react';
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
  const [loadingOutlook, setLoadingOutlook] = useState(false);

  if (!isOpen) return null;

  const isGoogleConnected = currentUser?.google_connected ?? true;
  const isOutlookConnected = currentUser?.outlook_connected ?? true;

  const handleToggleGoogle = async () => {
    if (!currentUser) return;
    setLoadingGoogle(true);
    await dbService.toggleCalendarConnection(currentUser.id, 'google', !isGoogleConnected);
    onUpdateUserStatus();
    setLoadingGoogle(false);
  };

  const handleToggleOutlook = async () => {
    if (!currentUser) return;
    setLoadingOutlook(true);
    await dbService.toggleCalendarConnection(currentUser.id, 'outlook', !isOutlookConnected);
    onUpdateUserStatus();
    setLoadingOutlook(false);
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
              <h3 className="text-base font-bold text-white">Integração de Agendas (Google & Outlook)</h3>
              <p className="text-xs text-slate-400">Sincronização bidirecional em tempo real</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          
          {/* CARD 1: GOOGLE CALENDAR */}
          <div className="glass-card rounded-2xl p-4 border border-slate-800 flex items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold shrink-0 border border-blue-500/20">
                🗓️
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="font-bold text-slate-100 text-sm">Google Calendar</h4>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold">
                    Gratuito (R$ 0,00)
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Criar e sincronizar eventos na agenda do Google Workspace/Gmail.
                </p>
              </div>
            </div>

            <button
              onClick={handleToggleGoogle}
              disabled={loadingGoogle}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all shrink-0 ${
                isGoogleConnected
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                  : 'gradient-bg text-white shadow-lg shadow-sky-500/20'
              }`}
            >
              {isGoogleConnected ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Conectado</span>
                </>
              ) : (
                <>
                  <ExternalLink className="h-4 w-4" />
                  <span>Conectar Google</span>
                </>
              )}
            </button>
          </div>

          {/* CARD 2: MICROSOFT OUTLOOK CALENDAR */}
          <div className="glass-card rounded-2xl p-4 border border-slate-800 flex items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold shrink-0 border border-purple-500/20">
                📧
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="font-bold text-slate-100 text-sm">Microsoft Outlook Calendar</h4>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold">
                    Gratuito (Microsoft Graph)
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Sincronização com contas Outlook, Hotmail e Microsoft 365.
                </p>
              </div>
            </div>

            <button
              onClick={handleToggleOutlook}
              disabled={loadingOutlook}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all shrink-0 ${
                isOutlookConnected
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 hover:bg-purple-500/30'
                  : 'gradient-bg text-white shadow-lg shadow-purple-500/20'
              }`}
            >
              {isOutlookConnected ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Conectado</span>
                </>
              ) : (
                <>
                  <ExternalLink className="h-4 w-4" />
                  <span>Conectar Outlook</span>
                </>
              )}
            </button>
          </div>

          {/* DICA DE SINCRONIZAÇÃO */}
          <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 flex items-start space-x-3 text-slate-300">
            <Sparkles className="h-4 w-4 text-sky-400 shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed">
              <p className="font-semibold text-slate-200">Como funciona a Sincronização Dual:</p>
              <p className="text-slate-400 mt-0.5">
                Ao cadastrar ou confirmar consultas no MEDSY, os convites de agendamento são enviados automaticamente para as agendas do médico e do paciente conectadas.
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
