'use client';

import React, { useState } from 'react';
import { 
  UserCheck, 
  Stethoscope, 
  UserCog, 
  Plus, 
  Edit, 
  Trash2, 
  Shield, 
  Phone, 
  Mail, 
  Award,
  X 
} from 'lucide-react';
import { Medico, Secretaria } from '@/lib/db';

interface EquipeModuleProps {
  medicos: Medico[];
  secretarias: Secretaria[];
  onAddMedico: (m: Omit<Medico, 'id'>) => Promise<void>;
  onUpdateMedico: (id: string, m: Partial<Medico>) => Promise<void>;
  onDeleteMedico: (id: string) => Promise<void>;
  onAddSecretaria: (s: Omit<Secretaria, 'id'>) => Promise<void>;
  onDeleteSecretaria: (id: string) => Promise<void>;
}

export const EquipeModule: React.FC<EquipeModuleProps> = ({
  medicos,
  secretarias,
  onAddMedico,
  onUpdateMedico,
  onDeleteMedico,
  onAddSecretaria,
  onDeleteSecretaria
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'medicos' | 'secretarias'>('medicos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMedico, setEditingMedico] = useState<Medico | null>(null);

  // Form states
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [dataNasc, setDataNasc] = useState('');
  const [telefone, setTelefone] = useState('');
  const [endereco, setEndereco] = useState('');
  const [crm, setCrm] = useState('');
  const [especialidade, setEspecialidade] = useState('');
  const [senha, setSenha] = useState('');

  const openAddModal = () => {
    setEditingMedico(null);
    setNome('');
    setCpf('');
    setEmail('');
    setDataNasc('');
    setTelefone('');
    setEndereco('');
    setCrm('');
    setEspecialidade('');
    setSenha('123456');
    setIsModalOpen(true);
  };

  const openEditMedicoModal = (m: Medico) => {
    setEditingMedico(m);
    setNome(m.nome);
    setCpf(m.cpf);
    setEmail(m.email);
    setDataNasc(m.data_nascimento);
    setTelefone(m.telefone);
    setEndereco(m.endereco);
    setCrm(m.crm);
    setEspecialidade(m.especialidade);
    setSenha(m.senha || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !cpf) return;

    if (activeSubTab === 'medicos') {
      if (editingMedico) {
        await onUpdateMedico(editingMedico.id, {
          nome,
          cpf,
          email,
          data_nascimento: dataNasc,
          telefone,
          endereco,
          crm,
          especialidade,
          senha
        });
      } else {
        await onAddMedico({
          nome,
          cpf,
          email,
          data_nascimento: dataNasc,
          telefone,
          endereco,
          crm,
          especialidade,
          senha
        });
      }
    } else {
      await onAddSecretaria({
        nome,
        cpf,
        email,
        data_nascimento: dataNasc,
        telefone,
        endereco,
        senha
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER DA SEÇÃO */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-card rounded-2xl p-6 border border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center space-x-2">
            <UserCheck className="h-5 w-5 text-purple-400" />
            <span>Gestão da Equipe Médica e Staff</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Gerenciamento de Médicos, CRM, Especialidades e Secretárias do consultório.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center space-x-2 text-xs font-semibold px-4 py-2.5 rounded-xl gradient-bg text-white shadow-lg shadow-purple-500/20 hover:opacity-90 transition-all shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Cadastrar {activeSubTab === 'medicos' ? 'Novo Médico' : 'Nova Secretária'}</span>
        </button>
      </div>

      {/* TABS NAVEGAÇÃO MÉDICOS / SECRETÁRIAS */}
      <div className="flex space-x-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveSubTab('medicos')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeSubTab === 'medicos'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-lg shadow-purple-500/10'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Stethoscope className="h-4 w-4" />
          <span>Corpo Médico ({medicos.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('secretarias')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeSubTab === 'secretarias'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-lg shadow-purple-500/10'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <UserCog className="h-4 w-4" />
          <span>Secretárias & Recepção ({secretarias.length})</span>
        </button>
      </div>

      {/* CONTEÚDO MÉDICOS */}
      {activeSubTab === 'medicos' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {medicos.map((m) => (
            <div key={m.id} className="glass-card glass-card-hover rounded-2xl p-5 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold">
                      <Stethoscope className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">{m.nome}</h3>
                      <span className="inline-flex items-center space-x-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/30 mt-1">
                        <Award className="h-3 w-3" />
                        <span>CRM: {m.crm}</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => openEditMedicoModal(m)}
                      className="p-1.5 text-slate-400 hover:text-sky-400 hover:bg-sky-500/10 rounded-lg"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDeleteMedico(m.id)}
                      className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-4 space-y-1.5 text-xs text-slate-300">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Especialidade:</span>
                    <span className="font-semibold text-sky-400">{m.especialidade}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>CPF:</span>
                    <span className="font-mono text-slate-200">{m.cpf}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Telefone:</span>
                    <span>{m.telefone || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>E-mail:</span>
                    <span>{m.email || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CONTEÚDO SECRETÁRIAS */}
      {activeSubTab === 'secretarias' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {secretarias.map((s) => (
            <div key={s.id} className="glass-card glass-card-hover rounded-2xl p-5 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-xl bg-sky-500/20 text-sky-300 flex items-center justify-center font-bold">
                      <UserCog className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">{s.nome}</h3>
                      <span className="inline-flex items-center space-x-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-300 border border-sky-500/30 mt-1">
                        <Shield className="h-3 w-3" />
                        <span>Recepção / Secretária</span>
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => onDeleteSecretaria(s.id)}
                    className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-4 space-y-1.5 text-xs text-slate-300">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>CPF (Login):</span>
                    <span className="font-mono text-slate-200">{s.cpf}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Telefone:</span>
                    <span>{s.telefone || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>E-mail:</span>
                    <span>{s.email || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL CADASTRO / EDIÇÃO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="glass-card rounded-2xl w-full max-w-lg p-6 border border-slate-700 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <UserCheck className="h-5 w-5 text-purple-400" />
                <span>
                  {activeSubTab === 'medicos'
                    ? (editingMedico ? 'Editar Médico' : 'Novo Médico')
                    : 'Nova Secretária'}
                </span>
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
                <label className="block text-slate-300 font-semibold mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Dr. Carlos Santos"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full glass-input px-3 py-2 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">CPF (Login) *</label>
                  <input
                    type="text"
                    required
                    placeholder="Somente números ou com pontos"
                    value={cpf}
                    onChange={(e) => setCpf(e.target.value)}
                    className="w-full glass-input px-3 py-2 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Senha de Acesso *</label>
                  <input
                    type="password"
                    required
                    placeholder="Senha para login no MEDSY"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    className="w-full glass-input px-3 py-2 rounded-xl"
                  />
                </div>
              </div>

              {activeSubTab === 'medicos' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">CRM *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: 123456/SP"
                      value={crm}
                      onChange={(e) => setCrm(e.target.value)}
                      className="w-full glass-input px-3 py-2 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Especialidade Médica *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Cardiologia, Pediatria"
                      value={especialidade}
                      onChange={(e) => setEspecialidade(e.target.value)}
                      className="w-full glass-input px-3 py-2 rounded-xl"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">E-mail</label>
                  <input
                    type="email"
                    placeholder="contato@medsy.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full glass-input px-3 py-2 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Telefone</label>
                  <input
                    type="text"
                    placeholder="(00) 90000-0000"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    className="w-full glass-input px-3 py-2 rounded-xl"
                  />
                </div>
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
                  className="px-5 py-2 rounded-xl gradient-bg text-white font-semibold shadow-lg shadow-purple-500/20 hover:opacity-90"
                >
                  Salvar Cadastro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
