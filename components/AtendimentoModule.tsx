'use client';

import React, { useState } from 'react';
import { 
  Stethoscope, 
  Bell, 
  User, 
  FileText, 
  Pill, 
  Activity, 
  Save, 
  History, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { Paciente, Medico, Consulta, ItemFila, Prontuario, dbService } from '@/lib/db';

interface AtendimentoModuleProps {
  pacientes: Paciente[];
  medicos: Medico[];
  consultas: Consulta[];
  fila: ItemFila[];
  prontuarios: Prontuario[];
  currentUserMedico?: Medico | null;
  onChamarProximo: (medicoNome: string, consultorio: string) => Promise<ItemFila | null>;
  onSaveProntuario: (p: Omit<Prontuario, 'id'>) => Promise<void>;
  onConcluirFila: (id: string) => Promise<void>;
}

export const AtendimentoModule: React.FC<AtendimentoModuleProps> = ({
  pacientes,
  medicos,
  consultas,
  fila,
  prontuarios,
  currentUserMedico,
  onChamarProximo,
  onSaveProntuario,
  onConcluirFila
}) => {
  const [selectedMedicoId, setSelectedMedicoId] = useState<string>(medicos[0]?.id || '');
  const [consultorio, setConsultorio] = useState<string>('Consultório 1');
  
  // Paciente sendo atendido no momento
  const [pacienteAtual, setPacienteAtual] = useState<ItemFila | null>(
    fila.find(i => i.status === 'EM_ATENDIMENTO') || null
  );

  // Form de Prontuario
  const [anamnese, setAnamnese] = useState<string>('');
  const [diagnostico, setDiagnostico] = useState<string>('');
  const [prescricao, setPrescricao] = useState<string>('');
  const [observacoes, setObservacoes] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const currentMedico = medicos.find(m => m.id === selectedMedicoId) || medicos[0];

  const handleChamar = async () => {
    const medicoNome = currentMedico ? currentMedico.nome : 'Dr. Médico';
    const chamado = await onChamarProximo(medicoNome, consultorio);
    if (chamado) {
      setPacienteAtual(chamado);
      setAnamnese('');
      setDiagnostico('');
      setPrescricao('');
      setObservacoes('');
    } else {
      alert('Nenhum paciente aguardando na fila no momento!');
    }
  };

  const handleFinalizarAtendimento = async () => {
    if (!pacienteAtual) return;

    setIsSaving(true);
    // Salvar prontuário se preenchido
    const pacienteObj = pacientes.find(p => p.nome === pacienteAtual.paciente_nome || p.id === pacienteAtual.paciente_id);
    const pacienteId = pacienteObj ? pacienteObj.id : (pacientes[0]?.id || 'a1000000-0000-0000-0000-000000000001');

    await onSaveProntuario({
      paciente_id: pacienteId,
      paciente_nome: pacienteAtual.paciente_nome,
      medico_id: currentMedico ? currentMedico.id : 'b1000000-0000-0000-0000-000000000001',
      medico_nome: currentMedico ? currentMedico.nome : 'Dr. Carlos Oliveira',
      data: new Date().toISOString().split('T')[0],
      anamnese: anamnese || 'Consulta sem queixas registradas.',
      diagnostico: diagnostico || 'Sem diagnóstico específico.',
      prescricao: prescricao || 'Sem medicação prescrita.',
      observacoes: observacoes
    });

    await onConcluirFila(pacienteAtual.id);
    setPacienteAtual(null);
    setAnamnese('');
    setDiagnostico('');
    setPrescricao('');
    setObservacoes('');
    setIsSaving(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 4000);
  };

  // Histórico prévio do paciente
  const historicoPaciente = prontuarios.filter(pr => 
    pacienteAtual && (pr.paciente_nome === pacienteAtual.paciente_nome || pr.paciente_id === pacienteAtual.paciente_id)
  );

  return (
    <div className="space-y-6">
      
      {/* HEADER DA SEÇÃO */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 glass-card rounded-2xl p-6 border border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center space-x-2">
            <Stethoscope className="h-5 w-5 text-sky-400" />
            <span>Consultório Clínico & Prontuário Eletrônico</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Atendimento médico presencial com chamado automático de senhas e prontuário integrado.
          </p>
        </div>

        {/* CONTROLES DE MÉDICO E CONSULTÓRIO */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-400 font-semibold">Médico:</span>
            <select
              value={selectedMedicoId}
              onChange={(e) => setSelectedMedicoId(e.target.value)}
              className="glass-input px-3 py-1.5 rounded-xl text-xs"
            >
              {medicos.map(m => (
                <option key={m.id} value={m.id}>{m.nome} ({m.especialidade})</option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-400 font-semibold">Consultório:</span>
            <select
              value={consultorio}
              onChange={(e) => setConsultorio(e.target.value)}
              className="glass-input px-3 py-1.5 rounded-xl text-xs"
            >
              <option value="Consultório 1">Consultório 1</option>
              <option value="Consultório 2">Consultório 2</option>
              <option value="Consultório 3">Consultório 3</option>
            </select>
          </div>

          {/* BOTÃO CHAVE: CHAMAR PRÓXIMO DA FILA */}
          <button
            onClick={handleChamar}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl gradient-bg text-white font-bold text-xs shadow-lg shadow-sky-500/30 hover:scale-105 active:scale-95 transition-all animate-pulse"
          >
            <Bell className="h-4 w-4" />
            <span>Chamar Próximo Paciente</span>
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="glass-card p-4 rounded-2xl border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>Atendimento concluído e prontuário salvo no histórico do paciente!</span>
        </div>
      )}

      {/* ÁREA DE ATENDIMENTO ATUAL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* COLUNA ESQUERDA: FORMULÁRIO DO PRONTUÁRIO (8 COLS) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* BANNER DO PACIENTE EM ATENDIMENTO */}
          <div className={`glass-card rounded-2xl p-6 border transition-all ${
            pacienteAtual
              ? 'border-sky-500/40 bg-slate-900/90'
              : 'border-slate-800'
          }`}>
            {pacienteAtual ? (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div className="h-14 w-14 rounded-2xl bg-sky-500/20 text-sky-400 flex flex-col items-center justify-center font-bold border border-sky-500/40">
                    <span className="text-xs text-sky-300 font-mono">SENHA</span>
                    <span className="text-lg text-white font-black">{pacienteAtual.senha}</span>
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <h2 className="text-lg font-black text-white">{pacienteAtual.paciente_nome}</h2>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        pacienteAtual.tipo === 'PREFERENCIAL'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                          : 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                      }`}>
                        {pacienteAtual.tipo}
                      </span>
                    </div>

                    <div className="flex items-center space-x-3 text-xs text-slate-400 mt-1">
                      <span className="flex items-center space-x-1">
                        <Clock className="h-3.5 w-3.5 text-slate-500" />
                        <span>Entrada: {pacienteAtual.horario_chegada}</span>
                      </span>
                      <span>•</span>
                      <span className="text-emerald-400 font-semibold">Em Atendimento</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleFinalizarAtendimento}
                  disabled={isSaving}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg flex items-center space-x-1.5 shrink-0"
                >
                  <Save className="h-4 w-4" />
                  <span>{isSaving ? 'Salvando...' : 'Concluir & Salvar Prontuário'}</span>
                </button>
              </div>
            ) : (
              <div className="py-8 text-center space-y-3">
                <AlertCircle className="h-10 w-10 text-slate-500 mx-auto" />
                <h3 className="text-sm font-bold text-slate-300">Nenhum paciente em atendimento nesta sala</h3>
                <p className="text-xs text-slate-400">
                  Clique no botão <strong>&quot;Chamar Próximo Paciente&quot;</strong> acima para chamar a próxima senha da fila da recepção.
                </p>
              </div>
            )}
          </div>

          {/* FORMULÁRIO DE PRONTUÁRIO CLÍNICO */}
          <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <FileText className="h-4 w-4 text-sky-400" />
              <span>Registro Clínico do Atendimento</span>
            </h3>

            {/* ANAMNESE E QUEIXAS */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Anamnese & Histórico de Sintomas Relatados *
              </label>
              <textarea
                rows={3}
                placeholder="Descreva as queixas principais do paciente, tempo dos sintomas e histórico..."
                value={anamnese}
                onChange={(e) => setAnamnese(e.target.value)}
                className="w-full glass-input p-3 rounded-xl text-xs resize-none"
              />
            </div>

            {/* DIAGNÓSTICO E CID-10 */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Diagnóstico Principal / Hipótese Diagnóstica (CID-10)
              </label>
              <input
                type="text"
                placeholder="Ex: I10 - Hipertensão Essencial / J00 - Nasofaringite Aguda"
                value={diagnostico}
                onChange={(e) => setDiagnostico(e.target.value)}
                className="w-full glass-input px-3 py-2 rounded-xl text-xs"
              />
            </div>

            {/* PRESCRIÇÃO MÉDICA DE MEDICAMENTOS */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center space-x-1">
                <Pill className="h-3.5 w-3.5 text-purple-400" />
                <span>Prescrição de Medicamentos & Exames Solicitados</span>
              </label>
              <textarea
                rows={4}
                placeholder="1. Nome do Medicamento 500mg — Tomar de 8 em 8 horas por 7 dias&#10;2. Exame de sangue / ECG..."
                value={prescricao}
                onChange={(e) => setPrescricao(e.target.value)}
                className="w-full glass-input p-3 rounded-xl text-xs font-mono resize-none"
              />
            </div>

            {/* OBSERVAÇÕES E RETORNO */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Observações de Retorno ou Orientações Gerais
              </label>
              <input
                type="text"
                placeholder="Ex: Retorno em 15 dias com resultados de exames..."
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                className="w-full glass-input px-3 py-2 rounded-xl text-xs"
              />
            </div>

          </div>

        </div>

        {/* COLUNA DIREITA: HISTÓRICO ANTERIOR & FILA ATUAL (4 COLS) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* HISTÓRICO DE ATENDIMENTOS DO PACIENTE */}
          <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <History className="h-4 w-4 text-purple-400" />
              <span>Histórico do Paciente ({historicoPaciente.length})</span>
            </h3>

            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
              {historicoPaciente.map((pr) => (
                <div key={pr.id} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-slate-400 text-[11px]">
                    <span className="font-semibold text-purple-300">{pr.medico_nome}</span>
                    <span>{pr.data}</span>
                  </div>
                  <p className="font-bold text-slate-200">{pr.diagnostico}</p>
                  <p className="text-[11px] text-slate-400 line-clamp-2">{pr.anamnese}</p>
                </div>
              ))}

              {historicoPaciente.length === 0 && (
                <p className="text-xs text-slate-500 py-4 text-center">
                  Nenhum registro clínico anterior cadastrado para este paciente.
                </p>
              )}
            </div>
          </div>

          {/* PAINEL DA FILA AGUARDANDO NA RECEPÇÃO */}
          <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center justify-between">
              <span>Pacientes Aguardando ({fila.filter(i => i.status === 'AGUARDANDO').length})</span>
              <Sparkles className="h-4 w-4 text-sky-400" />
            </h3>

            <div className="space-y-2">
              {fila.filter(i => i.status === 'AGUARDANDO').map((item) => (
                <div key={item.id} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-1 rounded-lg bg-sky-500/10 text-sky-400 font-mono font-bold">
                      {item.senha}
                    </span>
                    <span className="font-semibold text-slate-200">{item.paciente_nome}</span>
                  </div>
                  <span className="text-[10px] text-slate-500">{item.horario_chegada}</span>
                </div>
              ))}

              {fila.filter(i => i.status === 'AGUARDANDO').length === 0 && (
                <p className="text-xs text-slate-500 py-3 text-center">Fila vazia na recepção.</p>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
