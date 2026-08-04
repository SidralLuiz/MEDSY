'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Sidebar, ActiveTab } from '@/components/Sidebar';
import { Dashboard } from '@/components/Dashboard';
import { PacientesModule } from '@/components/PacientesModule';
import { EquipeModule } from '@/components/EquipeModule';
import { AgendamentoModule } from '@/components/AgendamentoModule';
import { HorariosModule } from '@/components/HorariosModule';
import { LoginModal } from '@/components/LoginModal';
import { DatabaseStatusModal } from '@/components/DatabaseStatusModal';
import { 
  dbService, 
  Paciente, 
  Medico, 
  Secretaria, 
  Consulta, 
  HorarioDisponivel, 
  Usuario 
} from '@/lib/db';

export default function Home() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [currentUser, setCurrentUser] = useState<Usuario | null>({
    id: 'u1',
    cpf: '131',
    senha: 'paodequeijo123',
    nome: 'Luiz (Admin)',
    nivel_acesso: 4,
    cargo: 'ADMIN'
  });

  // Data states
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [secretarias, setSecretarias] = useState<Secretaria[]>([]);
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [horarios, setHorarios] = useState<HorarioDisponivel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Modals
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);
  const [isPacienteModalOpen, setIsPacienteModalOpen] = useState(false);
  const [isAgendamentoModalOpen, setIsAgendamentoModalOpen] = useState(false);

  // Load initial data
  const refreshData = async () => {
    try {
      setLoading(true);
      const [pData, mData, sData, cData, hData] = await Promise.all([
        dbService.getPacientes(),
        dbService.getMedicos(),
        dbService.getSecretarias(),
        dbService.getConsultas(),
        dbService.getHorarios()
      ]);

      setPacientes(pData);
      setMedicos(mData);
      setSecretarias(sData);
      setConsultas(cData);
      setHorarios(hData);
    } catch (err) {
      console.error('Erro ao carregar dados do banco:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Handlers para Pacientes
  const handleAddPaciente = async (p: Omit<Paciente, 'id'>) => {
    await dbService.addPaciente(p);
    await refreshData();
  };

  const handleUpdatePaciente = async (id: string, p: Partial<Paciente>) => {
    await dbService.updatePaciente(id, p);
    await refreshData();
  };

  const handleDeletePaciente = async (id: string) => {
    if (confirm('Deseja realmente remover este paciente?')) {
      await dbService.deletePaciente(id);
      await refreshData();
    }
  };

  // Handlers para Médicos & Secretárias
  const handleAddMedico = async (m: Omit<Medico, 'id'>) => {
    await dbService.addMedico(m);
    await refreshData();
  };

  const handleUpdateMedico = async (id: string, m: Partial<Medico>) => {
    await dbService.updateMedico(id, m);
    await refreshData();
  };

  const handleDeleteMedico = async (id: string) => {
    if (confirm('Deseja realmente remover este médico?')) {
      await dbService.deleteMedico(id);
      await refreshData();
    }
  };

  const handleAddSecretaria = async (s: Omit<Secretaria, 'id'>) => {
    await dbService.addSecretaria(s);
    await refreshData();
  };

  const handleDeleteSecretaria = async (id: string) => {
    if (confirm('Deseja realmente remover esta secretária?')) {
      await dbService.deleteSecretaria(id);
      await refreshData();
    }
  };

  // Handlers para Consultas & Horários
  const handleAddConsulta = async (c: Omit<Consulta, 'id'>) => {
    await dbService.addConsulta(c);
    await refreshData();
  };

  const handleUpdateConsultaStatus = async (id: string, status: Consulta['status']) => {
    await dbService.updateConsultaStatus(id, status);
    await refreshData();
  };

  const handleAddHorario = async (h: Omit<HorarioDisponivel, 'id'>) => {
    await dbService.addHorario(h);
    await refreshData();
  };

  return (
    <div className="min-h-screen bg-[#0b1329] text-slate-100 flex flex-col">
      
      {/* NAVBAR FIXA */}
      <Navbar
        currentUser={currentUser}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onLogout={() => setCurrentUser(null)}
        onOpenDbModal={() => setIsDbModalOpen(true)}
      />

      {/* CONTAINER PRINCIPAL DAS PÁGINAS */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col lg:flex-row gap-6">
        
        {/* SIDEBAR NAVEGAÇÃO */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          currentUser={currentUser}
        />

        {/* ÁREA DE CONTEÚDO */}
        <main className="flex-1 w-full min-w-0">
          {loading ? (
            <div className="glass-card rounded-2xl p-12 text-center text-slate-400 animate-pulse">
              Carregando dados do banco PostgreSQL...
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <Dashboard
                  pacientes={pacientes}
                  medicos={medicos}
                  consultas={consultas}
                  horarios={horarios}
                  currentUser={currentUser}
                  setActiveTab={setActiveTab}
                  onOpenAgendamentoModal={() => setIsAgendamentoModalOpen(true)}
                  onOpenPacienteModal={() => setIsPacienteModalOpen(true)}
                />
              )}

              {activeTab === 'pacientes' && (
                <PacientesModule
                  pacientes={pacientes}
                  onAddPaciente={handleAddPaciente}
                  onUpdatePaciente={handleUpdatePaciente}
                  onDeletePaciente={handleDeletePaciente}
                  isModalOpen={isPacienteModalOpen}
                  setIsModalOpen={setIsPacienteModalOpen}
                />
              )}

              {activeTab === 'equipe' && (
                <EquipeModule
                  medicos={medicos}
                  secretarias={secretarias}
                  onAddMedico={handleAddMedico}
                  onUpdateMedico={handleUpdateMedico}
                  onDeleteMedico={handleDeleteMedico}
                  onAddSecretaria={handleAddSecretaria}
                  onDeleteSecretaria={handleDeleteSecretaria}
                />
              )}

              {activeTab === 'agendamentos' && (
                <AgendamentoModule
                  consultas={consultas}
                  pacientes={pacientes}
                  medicos={medicos}
                  horarios={horarios}
                  onAddConsulta={handleAddConsulta}
                  onUpdateStatus={handleUpdateConsultaStatus}
                  isModalOpen={isAgendamentoModalOpen}
                  setIsModalOpen={setIsAgendamentoModalOpen}
                />
              )}

              {activeTab === 'horarios' && (
                <HorariosModule
                  horarios={horarios}
                  medicos={medicos}
                  onAddHorario={handleAddHorario}
                />
              )}

              {activeTab === 'database' && (
                <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
                  <h1 className="text-xl font-bold text-white">Configuração do Banco PostgreSQL (Supabase)</h1>
                  <p className="text-xs text-slate-400">
                    O projeto MEDSY foi totalmente convertido de MySQL legados para PostgreSQL/Supabase.
                  </p>
                  <button
                    onClick={() => setIsDbModalOpen(true)}
                    className="px-4 py-2 rounded-xl gradient-bg text-white font-semibold text-xs shadow-lg"
                  >
                    Ver Instruções de Conexão Supabase
                  </button>
                </div>
              )}
            </>
          )}
        </main>

      </div>

      {/* MODAL LOGIN */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={(user) => setCurrentUser(user)}
      />

      {/* MODAL BANCO DE DADOS STATUS */}
      <DatabaseStatusModal
        isOpen={isDbModalOpen}
        onClose={() => setIsDbModalOpen(false)}
      />

    </div>
  );
}
