'use client';

import React, { useState } from 'react';
import { 
  Ticket, 
  Bell, 
  UserPlus, 
  CheckCircle2, 
  Volume2, 
  Clock, 
  Users, 
  Sparkles, 
  Tv, 
  Smartphone,
  Plus
} from 'lucide-react';
import { ItemFila, Paciente } from '@/lib/db';

interface FilaAtendimentoModuleProps {
  fila: ItemFila[];
  pacientes: Paciente[];
  onGerarSenha: (nome: string, tipo: 'NORMAL' | 'PREFERENCIAL', pacienteId?: string) => Promise<ItemFila>;
  onConcluirFila: (id: string) => Promise<void>;
}

export const FilaAtendimentoModule: React.FC<FilaAtendimentoModuleProps> = ({
  fila,
  pacientes,
  onGerarSenha,
  onConcluirFila
}) => {
  const [selectedPacienteId, setSelectedPacienteId] = useState<string>('');
  const [customNome, setCustomNome] = useState<string>('');
  const [tipoSenha, setTipoSenha] = useState<'NORMAL' | 'PREFERENCIAL'>('NORMAL');
  const [ultimaSenhaGerada, setUltimaSenhaGerada] = useState<ItemFila | null>(null);

  // A senha que está sendo chamada no momento (em atendimento)
  const senhaEmAtendimento = fila.find(i => i.status === 'EM_ATENDIMENTO');
  const senhasAguardando = fila.filter(i => i.status === 'AGUARDANDO');
  const ultimasChamadas = fila.filter(i => i.status === 'EM_ATENDIMENTO' || i.status === 'CONCLUIDO').slice(-5);

  const handleRetirarSenha = async (e: React.FormEvent) => {
    e.preventDefault();
    let nome = customNome;
    let pacienteId: string | undefined = undefined;

    if (selectedPacienteId) {
      const p = pacientes.find(item => item.id === selectedPacienteId);
      if (p) {
        nome = p.nome;
        pacienteId = p.id;
      }
    }

    if (!nome) return;

    const novaSenha = await onGerarSenha(nome, tipoSenha, pacienteId);
    setUltimaSenhaGerada(novaSenha);
    setCustomNome('');
    setSelectedPacienteId('');
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER DA SEÇÃO */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-card rounded-2xl p-6 border border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center space-x-2">
            <Ticket className="h-5 w-5 text-sky-400" />
            <span>Fila de Atendimento & Totem de Senhas</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Emissão de senhas presenciais e painel de chamada em tempo real para a recepção.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-3 py-1.5 rounded-xl bg-purple-500/10 text-purple-300 border border-purple-500/30 text-xs font-semibold flex items-center space-x-1.5">
            <Tv className="h-4 w-4 text-purple-400" />
            <span>Painel da Recepção Ativo</span>
          </span>
        </div>
      </div>

      {/* BLIST PAINEL PRINCIPAL DE CHAMADA DA RECEPÇÃO (TV DISPLAY) */}
      <div className="glass-card rounded-3xl p-8 border border-sky-500/30 shadow-2xl relative overflow-hidden bg-gradient-to-br from-[#091124] via-[#050917] to-slate-950">
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/10 blur-[100px] pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* PAINEL CENTRAL DA SENHA ATUAL CHAMADA (8 COLS) */}
          <div className="lg:col-span-8 space-y-4 text-center lg:text-left">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
              <Volume2 className="h-4 w-4 text-emerald-400 animate-bounce" />
              <span>SENHA CHAMADA NO MOMENTO</span>
            </div>

            {senhaEmAtendimento ? (
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                  <span className="text-6xl sm:text-7xl font-black gradient-text tracking-wider">
                    {senhaEmAtendimento.senha}
                  </span>
                  <span className={`px-4 py-1.5 rounded-full text-xs font-black ${
                    senhaEmAtendimento.tipo === 'PREFERENCIAL'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                      : 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                  }`}>
                    {senhaEmAtendimento.tipo}
                  </span>
                </div>

                <div className="space-y-1">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                    {senhaEmAtendimento.paciente_nome}
                  </h2>
                  <p className="text-base font-semibold text-sky-400">
                    ➔ Dirija-se ao <strong className="text-white font-black underline">{senhaEmAtendimento.consultorio || 'Consultório 1'}</strong> com {senhaEmAtendimento.medico_nome || 'Médico'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-6 space-y-2">
                <p className="text-3xl font-extrabold text-slate-400">NENHUMA SENHA EM CHAMADA</p>
                <p className="text-xs text-slate-500">Aguardando o médico clicar em &quot;Chamar Próximo Paciente&quot;...</p>
              </div>
            )}
          </div>

          {/* ÚLTIMAS SENHAS CHAMADAS (4 COLS) */}
          <div className="lg:col-span-4 glass-card p-5 rounded-2xl border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
              <Clock className="h-4 w-4 text-sky-400" />
              <span>Últimas Chamadas</span>
            </h3>

            <div className="space-y-2">
              {ultimasChamadas.map((item) => (
                <div key={item.id} className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-sky-400 text-sm">{item.senha}</span>
                    <span className="font-semibold text-slate-200 truncate max-w-[130px]">{item.paciente_nome}</span>
                  </div>
                  <span className="text-[10px] text-slate-400">{item.consultorio || 'Sala 1'}</span>
                </div>
              ))}

              {ultimasChamadas.length === 0 && (
                <p className="text-xs text-slate-500 py-2 text-center">Nenhuma chamada anterior.</p>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* TOTEM DE EMISSÃO DE SENHAS E FILA COMPLETA */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* FORMULÁRIO TOTEM DE GERAR SENHA (5 COLS) */}
        <div className="lg:col-span-5 glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Ticket className="h-5 w-5 text-emerald-400" />
              <span>Totem de Emissão de Senhas</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">Recepção ou autoatendimento presencial para chegada de pacientes.</p>
          </div>

          {ultimaSenhaGerada && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-1 animate-in zoom-in-95">
              <span className="text-[10px] font-bold text-emerald-400 uppercase">Senha Gerada com Sucesso!</span>
              <div className="text-4xl font-black text-white font-mono">{ultimaSenhaGerada.senha}</div>
              <p className="text-xs text-emerald-300 font-semibold">{ultimaSenhaGerada.paciente_nome}</p>
            </div>
          )}

          <form onSubmit={handleRetirarSenha} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Selecione o Paciente Cadastrado (ou digite abaixo):</label>
              <select
                value={selectedPacienteId}
                onChange={(e) => {
                  setSelectedPacienteId(e.target.value);
                  setCustomNome('');
                }}
                className="w-full glass-input px-3 py-2.5 rounded-xl"
              >
                <option value="">-- Selecionar da Lista de Pacientes --</option>
                {pacientes.map(p => (
                  <option key={p.id} value={p.id}>{p.nome} (CPF: {p.cpf})</option>
                ))}
              </select>
            </div>

            {!selectedPacienteId && (
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nome Completo do Paciente:</label>
                <input
                  type="text"
                  placeholder="Ex: João da Silva"
                  value={customNome}
                  onChange={(e) => setCustomNome(e.target.value)}
                  className="w-full glass-input px-3 py-2.5 rounded-xl"
                />
              </div>
            )}

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Tipo de Atendimento:</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTipoSenha('NORMAL')}
                  className={`py-3 rounded-xl font-bold border transition-all text-xs flex items-center justify-center space-x-1.5 ${
                    tipoSenha === 'NORMAL'
                      ? 'bg-sky-500/20 text-sky-300 border-sky-500/50'
                      : 'bg-slate-900/60 text-slate-400 border-slate-800'
                  }`}
                >
                  <span>Atendimento Normal</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTipoSenha('PREFERENCIAL')}
                  className={`py-3 rounded-xl font-bold border transition-all text-xs flex items-center justify-center space-x-1.5 ${
                    tipoSenha === 'PREFERENCIAL'
                      ? 'bg-purple-500/20 text-purple-300 border-purple-500/50'
                      : 'bg-slate-900/60 text-slate-400 border-slate-800'
                  }`}
                >
                  <span>Preferencial (Idoso/PNE)</span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl gradient-bg text-white font-bold text-xs shadow-lg shadow-sky-500/20 hover:opacity-90 flex items-center justify-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Emitir Senha & Adicionar à Fila</span>
            </button>
          </form>

        </div>

        {/* LISTA COMPLETA DA FILA DA RECEPÇÃO (7 COLS) */}
        <div className="lg:col-span-7 glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Users className="h-5 w-5 text-sky-400" />
              <span>Fila de Espera em Tempo Real ({senhasAguardando.length})</span>
            </h3>
            <span className="text-xs text-slate-400">Status atual da recepção</span>
          </div>

          <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
            {senhasAguardando.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-sky-500/30 flex items-center justify-between transition-all"
              >
                <div className="flex items-center space-x-3">
                  <div className="px-3 py-1.5 rounded-xl bg-sky-500/10 text-sky-400 font-mono font-black text-sm border border-sky-500/30">
                    {item.senha}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-100 text-xs">{item.paciente_nome}</h4>
                    <span className={`inline-block text-[10px] font-semibold ${
                      item.tipo === 'PREFERENCIAL' ? 'text-purple-400' : 'text-slate-400'
                    }`}>
                      {item.tipo} • Chegada: {item.horario_chegada}
                    </span>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 text-[10px] font-semibold">
                  Aguardando
                </span>
              </div>
            ))}

            {senhasAguardando.length === 0 && (
              <div className="py-12 text-center text-slate-500 space-y-1">
                <Ticket className="h-8 w-8 text-slate-600 mx-auto" />
                <p className="text-xs font-semibold">Nenhum paciente aguardando na fila da recepção no momento.</p>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
