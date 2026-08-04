'use client';

import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Stethoscope, 
  Plus, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Filter,
  Check,
  X,
  FileText,
  Sparkles
} from 'lucide-react';
import { Consulta, Paciente, Medico, HorarioDisponivel } from '@/lib/db';

interface AgendamentoModuleProps {
  consultas: Consulta[];
  pacientes: Paciente[];
  medicos: Medico[];
  horarios: HorarioDisponivel[];
  onAddConsulta: (c: Omit<Consulta, 'id'>) => Promise<void>;
  onUpdateStatus: (id: string, status: Consulta['status']) => Promise<void>;
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
}

export const AgendamentoModule: React.FC<AgendamentoModuleProps> = ({
  consultas,
  pacientes,
  medicos,
  horarios,
  onAddConsulta,
  onUpdateStatus,
  isModalOpen,
  setIsModalOpen
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [filterMedico, setFilterMedico] = useState<string>('TODOS');
  const [filterStatus, setFilterStatus] = useState<string>('TODOS');

  // Form para nova consulta
  const [selectedPacienteId, setSelectedPacienteId] = useState<string>('');
  const [selectedMedicoId, setSelectedMedicoId] = useState<string>('');
  const [dataConsulta, setDataConsulta] = useState<string>(selectedDate);
  const [horario, setHorario] = useState<string>('09:00');
  const [observacoes, setObservacoes] = useState<string>('');

  const openModal = () => {
    if (pacientes.length > 0) setSelectedPacienteId(pacientes[0].id);
    if (medicos.length > 0) setSelectedMedicoId(medicos[0].id);
    setDataConsulta(selectedDate);
    setHorario('09:00');
    setObservacoes('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const paciente = pacientes.find(p => p.id === selectedPacienteId);
    const medico = medicos.find(m => m.id === selectedMedicoId);

    if (!paciente || !medico) return;

    await onAddConsulta({
      paciente_id: paciente.id,
      paciente_nome: paciente.nome,
      medico_id: medico.id,
      medico_nome: medico.nome,
      especialidade: medico.especialidade,
      data_consulta: dataConsulta,
      horario: horario,
      status: 'AGENDADA',
      observacoes: observacoes
    });

    setIsModalOpen(false);
  };

  const filteredConsultas = consultas.filter(c => {
    const matchDate = !selectedDate || c.data_consulta === selectedDate;
    const matchMedico = filterMedico === 'TODOS' || c.medico_nome === filterMedico;
    const matchStatus = filterStatus === 'TODOS' || c.status === filterStatus;
    return matchDate && matchMedico && matchStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* HEADER DA SEÇÃO */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-card rounded-2xl p-6 border border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center space-x-2">
            <CalendarIcon className="h-5 w-5 text-sky-400" />
            <span>Agendamento de Consultas & Calendários</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Sincronização automática com agendas **Google Calendar** e **Microsoft Outlook**.
          </p>
        </div>

        <button
          onClick={openModal}
          className="flex items-center space-x-2 text-xs font-semibold px-4 py-2.5 rounded-xl gradient-bg text-white shadow-lg shadow-sky-500/20 hover:opacity-90 transition-all shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Agendar Nova Consulta</span>
        </button>
      </div>

      {/* FILTROS E BARRA DE DATA */}
      <div className="glass-card rounded-2xl p-4 border border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
        
        <div className="flex items-center space-x-3">
          <label className="font-semibold text-slate-300 flex items-center space-x-1">
            <CalendarIcon className="h-4 w-4 text-sky-400" />
            <span>Data Selecionada:</span>
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="glass-input px-3 py-1.5 rounded-xl font-semibold text-sky-300"
          />
          <button
            onClick={() => setSelectedDate('')}
            className="text-slate-400 hover:text-white underline text-[11px]"
          >
            Limpar Data (Ver Todas)
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-slate-400">Médico:</span>
            <select
              value={filterMedico}
              onChange={(e) => setFilterMedico(e.target.value)}
              className="glass-input px-3 py-1.5 rounded-xl"
            >
              <option value="TODOS">Todos os Médicos</option>
              {medicos.map(m => (
                <option key={m.id} value={m.nome}>{m.nome} ({m.especialidade})</option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-slate-400">Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="glass-input px-3 py-1.5 rounded-xl"
            >
              <option value="TODOS">Todos os Status</option>
              <option value="AGENDADA">AGENDADA</option>
              <option value="CONFIRMADA">CONFIRMADA</option>
              <option value="REALIZADA">REALIZADA</option>
              <option value="CANCELADA">CANCELADA</option>
            </select>
          </div>
        </div>

      </div>

      {/* LISTA DE CONSULTAS EM CARDS/TABELA */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800">
        <h2 className="text-sm font-bold text-white mb-4 flex items-center justify-between">
          <span>Consultas Agendadas ({filteredConsultas.length})</span>
          {selectedDate && <span className="text-xs text-sky-400 font-medium">Data: {selectedDate}</span>}
        </h2>

        <div className="space-y-3">
          {filteredConsultas.map((c) => (
            <div
              key={c.id}
              className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-sky-500/30 transition-all gap-4"
            >
              <div className="flex items-start space-x-4">
                <div className="h-12 w-12 rounded-2xl bg-sky-500/10 text-sky-400 flex flex-col items-center justify-center font-bold shrink-0 border border-sky-500/20">
                  <Clock className="h-4 w-4 text-sky-400" />
                  <span className="text-[11px] font-semibold text-white">{c.horario}</span>
                </div>

                <div>
                  <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                    <h3 className="text-sm font-bold text-slate-100">{c.paciente_nome}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      c.status === 'CONFIRMADA'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : c.status === 'AGENDADA'
                        ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30'
                        : c.status === 'REALIZADA'
                        ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                        : 'bg-red-500/10 text-red-400 border border-red-500/30'
                    }`}>
                      {c.status}
                    </span>

                    {/* BADGES DE SINCRONIZAÇÃO GOOGLE & OUTLOOK */}
                    {c.google_event_id && (
                      <span className="inline-flex items-center space-x-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/30">
                        <span>🗓️ Google Calendar</span>
                      </span>
                    )}

                    {c.outlook_event_id && (
                      <span className="inline-flex items-center space-x-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/30">
                        <span>📧 Outlook</span>
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                    <span className="flex items-center space-x-1 text-slate-300">
                      <Stethoscope className="h-3.5 w-3.5 text-purple-400" />
                      <span>{c.medico_nome} ({c.especialidade})</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <CalendarIcon className="h-3.5 w-3.5 text-slate-500" />
                      <span>{c.data_consulta}</span>
                    </span>
                  </div>

                  {c.observacoes && (
                    <p className="text-[11px] text-slate-400 mt-1 italic">
                      Obs: "{c.observacoes}"
                    </p>
                  )}
                </div>
              </div>

              {/* CONTROLES DE STATUS */}
              <div className="flex items-center space-x-2 self-end md:self-center">
                {c.status !== 'CONFIRMADA' && c.status !== 'REALIZADA' && (
                  <button
                    onClick={() => onUpdateStatus(c.id, 'CONFIRMADA')}
                    className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center space-x-1"
                  >
                    <CheckCircle className="h-3.5 w-3.5" />
                    <span>Confirmar</span>
                  </button>
                )}

                {c.status !== 'REALIZADA' && (
                  <button
                    onClick={() => onUpdateStatus(c.id, 'REALIZADA')}
                    className="px-2.5 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30 text-xs font-semibold flex items-center space-x-1"
                  >
                    <Check className="h-3.5 w-3.5" />
                    <span>Concluir</span>
                  </button>
                )}

                {c.status !== 'CANCELADA' && (
                  <button
                    onClick={() => onUpdateStatus(c.id, 'CANCELADA')}
                    className="px-2.5 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-semibold flex items-center space-x-1"
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    <span>Cancelar</span>
                  </button>
                )}
              </div>
            </div>
          ))}

          {filteredConsultas.length === 0 && (
            <div className="py-12 text-center text-slate-500">
              Nenhuma consulta agendada encontrada para o filtro selecionado.
            </div>
          )}
        </div>
      </div>

      {/* MODAL DE AGENDAMENTO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="glass-card rounded-2xl w-full max-w-lg p-6 border border-slate-700 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <CalendarIcon className="h-5 w-5 text-sky-400" />
                <span>Agendar Consulta & Sincronizar Calendários</span>
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
                <label className="block text-slate-300 font-semibold mb-1">Selecione o Paciente *</label>
                <select
                  required
                  value={selectedPacienteId}
                  onChange={(e) => setSelectedPacienteId(e.target.value)}
                  className="w-full glass-input px-3 py-2 rounded-xl"
                >
                  {pacientes.map(p => (
                    <option key={p.id} value={p.id}>{p.nome} (CPF: {p.cpf})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Selecione o Médico / Especialidade *</label>
                <select
                  required
                  value={selectedMedicoId}
                  onChange={(e) => setSelectedMedicoId(e.target.value)}
                  className="w-full glass-input px-3 py-2 rounded-xl"
                >
                  {medicos.map(m => (
                    <option key={m.id} value={m.id}>{m.nome} — {m.especialidade} (CRM: {m.crm})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Data da Consulta *</label>
                  <input
                    type="date"
                    required
                    value={dataConsulta}
                    onChange={(e) => setDataConsulta(e.target.value)}
                    className="w-full glass-input px-3 py-2 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Horário *</label>
                  <select
                    value={horario}
                    onChange={(e) => setHorario(e.target.value)}
                    className="w-full glass-input px-3 py-2 rounded-xl"
                  >
                    <option value="08:00">08:00</option>
                    <option value="08:30">08:30</option>
                    <option value="09:00">09:00</option>
                    <option value="09:30">09:30</option>
                    <option value="10:00">10:00</option>
                    <option value="10:30">10:30</option>
                    <option value="11:00">11:00</option>
                    <option value="14:00">14:00</option>
                    <option value="14:30">14:30</option>
                    <option value="15:00">15:00</option>
                    <option value="15:30">15:30</option>
                    <option value="16:00">16:00</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Observações / Procedimento</label>
                <textarea
                  rows={2}
                  placeholder="Ex: Consulta de rotina, sintomas relatados..."
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  className="w-full glass-input px-3 py-2 rounded-xl resize-none"
                />
              </div>

              <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/30 text-[11px] text-sky-300 flex items-center space-x-2">
                <Sparkles className="h-4 w-4 text-sky-400 shrink-0" />
                <span>O evento será sincronizado automaticamente no Google Calendar e Outlook das contas conectadas.</span>
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
                  className="px-5 py-2 rounded-xl gradient-bg text-white font-semibold shadow-lg shadow-sky-500/20 hover:opacity-90"
                >
                  Confirmar Agendamento & Sincronizar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
