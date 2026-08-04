'use client';

import React, { useState } from 'react';
import { Clock, Plus, Stethoscope, Calendar as CalendarIcon, CheckCircle2, X } from 'lucide-react';
import { HorarioDisponivel, Medico } from '@/lib/db';

interface HorariosModuleProps {
  horarios: HorarioDisponivel[];
  medicos: Medico[];
  onAddHorario: (h: Omit<HorarioDisponivel, 'id'>) => Promise<void>;
}

export const HorariosModule: React.FC<HorariosModuleProps> = ({
  horarios,
  medicos,
  onAddHorario
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMedicoId, setSelectedMedicoId] = useState<string>('');
  const [diaSemana, setDiaSemana] = useState<number>(1);
  const [horarioStr, setHorarioStr] = useState<string>('08:00');

  const diasNomes = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo'];

  const openModal = () => {
    if (medicos.length > 0) setSelectedMedicoId(medicos[0].id);
    setDiaSemana(1);
    setHorarioStr('08:00');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const medico = medicos.find(m => m.id === selectedMedicoId);
    if (!medico) return;

    await onAddHorario({
      medico_id: medico.id,
      medico_nome: medico.nome,
      especialidade: medico.especialidade,
      dia_semana: Number(diaSemana),
      horario: horarioStr,
      disponivel: true
    });

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER DA SEÇÃO */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-card rounded-2xl p-6 border border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center space-x-2">
            <Clock className="h-5 w-5 text-emerald-400" />
            <span>Grade de Horários Ativos dos Médicos</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Configuração das janelas de atendimento por médico e dia da semana.
          </p>
        </div>

        <button
          onClick={openModal}
          className="flex items-center space-x-2 text-xs font-semibold px-4 py-2.5 rounded-xl gradient-bg text-white shadow-lg shadow-emerald-500/20 hover:opacity-90 transition-all shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Adicionar Novo Horário</span>
        </button>
      </div>

      {/* GRADE DE HORÁRIOS POR MÉDICO */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {medicos.map((medico) => {
          const medHorarios = horarios.filter(h => h.medico_nome === medico.nome);

          return (
            <div key={medico.id} className="glass-card rounded-2xl p-5 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-3 pb-3 border-b border-slate-800">
                  <div className="h-9 w-9 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold">
                    <Stethoscope className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{medico.nome}</h3>
                    <p className="text-[11px] text-emerald-400 font-semibold">{medico.especialidade}</p>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  {diasNomes.map((diaNome, idx) => {
                    const diaNum = idx + 1;
                    const slotsDoDia = medHorarios.filter(h => h.dia_semana === diaNum);

                    if (slotsDoDia.length === 0) return null;

                    return (
                      <div key={diaNum} className="text-xs">
                        <span className="font-semibold text-slate-300 block mb-1">
                          {diaNome}:
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {slotsDoDia.map((slot) => (
                            <span
                              key={slot.id}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border flex items-center space-x-1 ${
                                slot.disponivel
                                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                                  : 'bg-slate-800 text-slate-500 border-slate-700 line-through'
                              }`}
                            >
                              <Clock className="h-3 w-3" />
                              <span>{slot.horario}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}

                  {medHorarios.length === 0 && (
                    <p className="text-xs text-slate-500 py-3 italic">
                      Nenhum horário cadastrado para este médico.
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL ADICIONAR HORÁRIO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="glass-card rounded-2xl w-full max-w-md p-6 border border-slate-700 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <Clock className="h-5 w-5 text-emerald-400" />
                <span>Adicionar Horário de Atendimento</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Médico *</label>
                <select
                  required
                  value={selectedMedicoId}
                  onChange={(e) => setSelectedMedicoId(e.target.value)}
                  className="w-full glass-input px-3 py-2 rounded-xl"
                >
                  {medicos.map(m => (
                    <option key={m.id} value={m.id}>{m.nome} ({m.especialidade})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Dia da Semana *</label>
                <select
                  value={diaSemana}
                  onChange={(e) => setDiaSemana(Number(e.target.value))}
                  className="w-full glass-input px-3 py-2 rounded-xl"
                >
                  {diasNomes.map((d, i) => (
                    <option key={i + 1} value={i + 1}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Horário *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: 08:30, 14:00"
                  value={horarioStr}
                  onChange={(e) => setHorarioStr(e.target.value)}
                  className="w-full glass-input px-3 py-2 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-slate-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl gradient-bg text-white font-semibold shadow-lg shadow-emerald-500/20 hover:opacity-90"
                >
                  Salvar Horário
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
