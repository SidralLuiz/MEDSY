'use client';

import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar as CalendarIcon, 
  FileText,
  X,
  Check
} from 'lucide-react';
import { Paciente } from '@/lib/db';

interface PacientesModuleProps {
  pacientes: Paciente[];
  onAddPaciente: (paciente: Omit<Paciente, 'id'>) => Promise<void>;
  onUpdatePaciente: (id: string, paciente: Partial<Paciente>) => Promise<void>;
  onDeletePaciente: (id: string) => Promise<void>;
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
}

export const PacientesModule: React.FC<PacientesModuleProps> = ({
  pacientes,
  onAddPaciente,
  onUpdatePaciente,
  onDeletePaciente,
  isModalOpen,
  setIsModalOpen
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingPaciente, setEditingPaciente] = useState<Paciente | null>(null);

  // Form states
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [telefone, setTelefone] = useState('');
  const [endereco, setEndereco] = useState('');

  const openAddModal = () => {
    setEditingPaciente(null);
    setNome('');
    setCpf('');
    setEmail('');
    setDataNascimento('');
    setTelefone('');
    setEndereco('');
    setIsModalOpen(true);
  };

  const openEditModal = (p: Paciente) => {
    setEditingPaciente(p);
    setNome(p.nome);
    setCpf(p.cpf);
    setEmail(p.email);
    setDataNascimento(p.data_nascimento);
    setTelefone(p.telefone);
    setEndereco(p.endereco);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !cpf) return;

    if (editingPaciente) {
      await onUpdatePaciente(editingPaciente.id, {
        nome,
        cpf,
        email,
        data_nascimento: dataNascimento,
        telefone,
        endereco
      });
    } else {
      await onAddPaciente({
        nome,
        cpf,
        email,
        data_nascimento: dataNascimento,
        telefone,
        endereco
      });
    }

    setIsModalOpen(false);
  };

  const filteredPacientes = pacientes.filter(p =>
    p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.cpf.includes(searchTerm) ||
    p.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* HEADER & CONTROLES DA SEÇÃO */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-card rounded-2xl p-6 border border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center space-x-2">
            <Users className="h-5 w-5 text-sky-400" />
            <span>Gestão de Pacientes</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Cadastro, atualização e consulta de prontuários dos pacientes da clínica.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center space-x-2 text-xs font-semibold px-4 py-2.5 rounded-xl gradient-bg text-white shadow-lg shadow-sky-500/20 hover:opacity-90 transition-all shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Cadastrar Novo Paciente</span>
        </button>
      </div>

      {/* SEARCH BAR */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar paciente por Nome, CPF ou E-mail..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full glass-input pl-10 pr-4 py-2.5 rounded-xl text-sm placeholder-slate-500"
        />
      </div>

      {/* TABELA DE PACIENTES */}
      <div className="glass-card rounded-2xl overflow-hidden border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-4">Nome do Paciente</th>
                <th className="py-3.5 px-4">CPF</th>
                <th className="py-3.5 px-4">Contato (E-mail / Fone)</th>
                <th className="py-3.5 px-4">Nascimento</th>
                <th className="py-3.5 px-4">Endereço</th>
                <th className="py-3.5 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredPacientes.map((p) => (
                <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-200 text-sm">{p.nome}</div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-300 font-mono">
                    {p.cpf}
                  </td>
                  <td className="py-3.5 px-4 text-slate-300">
                    <div className="flex items-center space-x-1 text-slate-300">
                      <Mail className="h-3 w-3 text-sky-400" />
                      <span>{p.email || 'Não informado'}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-slate-400 mt-0.5">
                      <Phone className="h-3 w-3 text-emerald-400" />
                      <span>{p.telefone || 'Não informado'}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-300">
                    <div className="flex items-center space-x-1">
                      <CalendarIcon className="h-3 w-3 text-slate-500" />
                      <span>{p.data_nascimento || 'N/A'}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 max-w-xs truncate">
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-3 w-3 text-slate-500 shrink-0" />
                      <span>{p.endereco || 'N/A'}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-2">
                    <button
                      onClick={() => openEditModal(p)}
                      title="Editar Paciente"
                      className="p-1.5 text-slate-400 hover:text-sky-400 hover:bg-sky-500/10 rounded-lg transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDeletePaciente(p.id)}
                      title="Excluir Paciente"
                      className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}

              {filteredPacientes.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    Nenhum paciente encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL CADASTRO / EDIÇÃO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="glass-card rounded-2xl w-full max-w-lg p-6 border border-slate-700 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <Users className="h-5 w-5 text-sky-400" />
                <span>{editingPaciente ? 'Editar Paciente' : 'Novo Paciente'}</span>
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
                  placeholder="Ex: Maria Silva"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full glass-input px-3 py-2 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">CPF *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 000.000.000-00"
                    value={cpf}
                    onChange={(e) => setCpf(e.target.value)}
                    className="w-full glass-input px-3 py-2 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Data de Nascimento</label>
                  <input
                    type="text"
                    placeholder="Ex: 12/05/1992"
                    value={dataNascimento}
                    onChange={(e) => setDataNascimento(e.target.value)}
                    className="w-full glass-input px-3 py-2 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">E-mail</label>
                  <input
                    type="email"
                    placeholder="paciente@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full glass-input px-3 py-2 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Telefone / Celular</label>
                  <input
                    type="text"
                    placeholder="(00) 90000-0000"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    className="w-full glass-input px-3 py-2 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Endereço Residencial</label>
                <input
                  type="text"
                  placeholder="Rua, Número, Bairro, Cidade"
                  value={endereco}
                  onChange={(e) => setEndereco(e.target.value)}
                  className="w-full glass-input px-3 py-2 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl gradient-bg text-white font-semibold shadow-lg shadow-sky-500/20 hover:opacity-90"
                >
                  {editingPaciente ? 'Salvar Alterações' : 'Cadastrar Paciente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
