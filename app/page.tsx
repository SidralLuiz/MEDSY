'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Sidebar, ActiveTab } from '@/components/Sidebar';
import { Dashboard } from '@/components/Dashboard';
import { PacientesModule } from '@/components/PacientesModule';
import { EquipeModule } from '@/components/EquipeModule';
import { AgendamentoModule } from '@/components/AgendamentoModule';
import { HorariosModule } from '@/components/HorariosModule';
import { FinanceiroModule } from '@/components/FinanceiroModule';
import { AtendimentoModule } from '@/components/AtendimentoModule';
import { FilaAtendimentoModule } from '@/components/FilaAtendimentoModule';
import { PainelTvRecepcao } from '@/components/PainelTvRecepcao';
import { LoginModal } from '@/components/LoginModal';
import { LoginPage } from '@/components/LoginPage';
import { DatabaseStatusModal } from '@/components/DatabaseStatusModal';
import { CalendarIntegrationsModal } from '@/components/CalendarIntegrationsModal';
import { ConsentModal } from '@/components/ConsentModal';
import { DsrModal } from '@/components/DsrModal';
import { 
  dbService, 
  Paciente, 
  Medico, 
  Secretaria, 
  Consulta, 
  HorarioDisponivel, 
  TransacaoFinanceira,
  ItemFila,
  Prontuario,
  Usuario 
} from '@/lib/db';
import { CheckCircle2, ShieldCheck } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  // Sessão NUNCA é hardcoded: exige login real via Supabase Auth
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null);

  // Toast Notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Data states
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [secretarias, setSecretarias] = useState<Secretaria[]>([]);
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [horarios, setHorarios] = useState<HorarioDisponivel[]>([]);
  const [transacoes, setTransacoes] = useState<TransacaoFinanceira[]>([]);
  const [fila, setFila] = useState<ItemFila[]>([]);
  const [prontuarios, setProntuarios] = useState<Prontuario[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Modals
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [isPacienteModalOpen, setIsPacienteModalOpen] = useState(false);
  const [isAgendamentoModalOpen, setIsAgendamentoModalOpen] = useState(false);
  const [isConsentOpen, setIsConsentOpen] = useState(false);
  const [isDsrOpen, setIsDsrOpen] = useState(false);

  // LGPD: verifica se o usuário já consentiu com o tratamento de dados de saúde
  const verificarConsentimento = async (userId: string) => {
    const consentiu = await dbService.jaConsentiu(userId);
    if (!consentiu) setIsConsentOpen(true);
  };

  // Verificação de retorno OAuth na URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const connectedParam = urlParams.get('connected');
      
      if (connectedParam === 'google') {
        if (currentUser) {
          setCurrentUser(prev => prev ? { ...prev, google_connected: true } : null);
          dbService.toggleCalendarConnection(currentUser.id, 'google', true);
        }
        showToast('Agenda do Google Calendar conectada com sucesso! 🗓️');
        setIsCalendarModalOpen(true);
      }
    }
  }, []);

  // Load initial data
  const refreshData = async () => {
    try {
      setLoading(true);
      const [pData, mData, sData, cData, hData, tData, fData, prData] = await Promise.all([
        dbService.getPacientes(),
        dbService.getMedicos(),
        dbService.getSecretarias(),
        dbService.getConsultas(),
        dbService.getHorarios(),
        dbService.getTransacoes(),
        dbService.getFila(),
        dbService.getProntuarios()
      ]);

      setPacientes(pData);
      setMedicos(mData);
      setSecretarias(sData);
      setConsultas(cData);
      setHorarios(hData);
      setTransacoes(tData);
      setFila(fData);
      setProntuarios(prData);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
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
    showToast(`Paciente ${p.nome} cadastrado com sucesso!`);
    await refreshData();
  };

  const handleUpdatePaciente = async (id: string, p: Partial<Paciente>) => {
    await dbService.updatePaciente(id, p);
    showToast(`Dados do paciente atualizados com sucesso!`);
    await refreshData();
  };

  const handleDeletePaciente = async (id: string) => {
    if (confirm('Deseja realmente remover este paciente?')) {
      await dbService.deletePaciente(id);
      showToast(`Paciente removido.`);
      await refreshData();
    }
  };

  // Handlers para Médicos & Secretárias
  const handleAddMedico = async (m: Omit<Medico, 'id'>) => {
    await dbService.addMedico(m);
    showToast(`Médico ${m.nome} cadastrado com sucesso!`);
    await refreshData();
  };

  const handleUpdateMedico = async (id: string, m: Partial<Medico>) => {
    await dbService.updateMedico(id, m);
    showToast(`Cadastro médico atualizado!`);
    await refreshData();
  };

  const handleDeleteMedico = async (id: string) => {
    if (confirm('Deseja realmente remover este médico?')) {
      await dbService.deleteMedico(id);
      showToast(`Médico removido.`);
      await refreshData();
    }
  };

  const handleAddSecretaria = async (s: Omit<Secretaria, 'id'>) => {
    await dbService.addSecretaria(s);
    showToast(`Secretária ${s.nome} cadastrada com sucesso!`);
    await refreshData();
  };

  const handleDeleteSecretaria = async (id: string) => {
    if (confirm('Deseja realmente remover esta secretária?')) {
      await dbService.deleteSecretaria(id);
      showToast(`Secretária removida.`);
      await refreshData();
    }
  };

  // Handlers para Consultas & Horários
  const handleAddConsulta = async (c: Omit<Consulta, 'id'>) => {
    await dbService.addConsulta(c);
    showToast(`Consulta agendada e sincronizada no Google Calendar! 📅`);
    await refreshData();
  };

  const handleUpdateConsultaStatus = async (id: string, status: Consulta['status']) => {
    await dbService.updateConsultaStatus(id, status);
    showToast(`Status da consulta atualizado para: ${status}`);
    await refreshData();
  };

  const handleAddHorario = async (h: Omit<HorarioDisponivel, 'id'>) => {
    await dbService.addHorario(h);
    showToast(`Horário de atendimento adicionado!`);
    await refreshData();
  };

  // Handlers para Finanças & Cobranças
  const handleUpdateTransacaoStatus = async (id: string, status: TransacaoFinanceira['status']) => {
    await dbService.updateTransacaoStatus(id, status);
    showToast(`Status do pagamento atualizado para: ${status}`);
    await refreshData();
  };

  const handleAddTransacao = async (t: Omit<TransacaoFinanceira, 'id'>) => {
    await dbService.addTransacao(t);
    showToast(`Cobrança gerada com sucesso!`);
    await refreshData();
  };

  // Handlers para Fila de Senhas & Atendimento Médico
  const handleGerarSenha = async (nome: string, tipo: 'NORMAL' | 'PREFERENCIAL', pacienteId?: string) => {
    const item = await dbService.gerarSenha(nome, tipo, pacienteId);
    showToast(`Senha ${item.senha} gerada para ${nome}!`);
    await refreshData();
    return item;
  };

  const handleChamarProximo = async (medicoNome: string, consultorio: string) => {
    const chamado = await dbService.chamarProximoFila(medicoNome, consultorio);
    if (chamado) {
      showToast(`🔔 Chamando a senha ${chamado.senha}: ${chamado.paciente_nome}!`);
    } else {
      showToast(`Nenhum paciente aguardando na fila.`);
    }
    await refreshData();
    return chamado;
  };

  const handleConcluirFila = async (id: string) => {
    await dbService.concluirAtendimentoFila(id);
    await refreshData();
  };

  const handleSaveProntuario = async (p: Omit<Prontuario, 'id'>) => {
    await dbService.addProntuario(p);
    showToast(`Prontuário salvo no histórico do paciente!`);
    await refreshData();
  };

  const handleUserCalendarUpdate = () => {
    if (currentUser) {
      const newGoogle = !currentUser.google_connected;
      setCurrentUser({
        ...currentUser,
        google_connected: newGoogle
      });
      showToast('Status da integração com o Google Calendar atualizado!');
    }
  };

  // Se o usuário não estiver logado, exibe a página inteira de Login pré-definida
  if (!currentUser) {
    return (
      <LoginPage
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          verificarConsentimento(user.id);
          showToast(`Bem-vindo, ${user.nome}! Login efetuado com sucesso.`);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#040711] text-slate-100 flex flex-col relative">
      
      {/* TOAST NOTIFICATION FLOATING BANNER */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 glass-card px-4 py-3 rounded-2xl border border-sky-500/40 text-sky-200 text-xs font-semibold flex items-center space-x-2 shadow-2xl animate-in slide-in-from-bottom-5 duration-300">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* NAVBAR FIXA */}
      <Navbar
        currentUser={currentUser}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onLogout={() => {
          dbService.logout();
          setCurrentUser(null);
          showToast('Você saiu da sua conta.');
        }}
        onOpenDbModal={() => setIsDbModalOpen(true)}
        onOpenCalendarModal={() => setIsCalendarModalOpen(true)}
        onOpenDsr={() => setIsDsrOpen(true)}
      />

      {/* CONTAINER PRINCIPAL DAS PÁGINAS WIDESCREEN */}
      <div className="flex-1 max-w-[1700px] w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col lg:flex-row gap-8">
        
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
              Carregando dados do MEDSY...
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
                  onOpenAgendamentoModal={() => {
                    setActiveTab('agendamentos');
                    setIsAgendamentoModalOpen(true);
                  }}
                  onOpenPacienteModal={() => {
                    setActiveTab('pacientes');
                    setIsPacienteModalOpen(true);
                  }}
                />
              )}

              {activeTab === 'atendimento' && (
                <AtendimentoModule
                  pacientes={pacientes}
                  medicos={medicos}
                  consultas={consultas}
                  fila={fila}
                  prontuarios={prontuarios}
                  onChamarProximo={handleChamarProximo}
                  onSaveProntuario={handleSaveProntuario}
                  onConcluirFila={handleConcluirFila}
                />
              )}

              {activeTab === 'paineltv' && (
                <PainelTvRecepcao fila={fila} />
              )}

              {activeTab === 'fila' && (
                <FilaAtendimentoModule
                  fila={fila}
                  pacientes={pacientes}
                  onGerarSenha={handleGerarSenha}
                  onConcluirFila={handleConcluirFila}
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

              {activeTab === 'financeiro' && (
                <FinanceiroModule
                  transacoes={transacoes}
                  consultas={consultas}
                  onUpdateStatus={handleUpdateTransacaoStatus}
                  onAddTransacao={handleAddTransacao}
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

              {activeTab === 'horarios' && (
                <HorariosModule
                  horarios={horarios}
                  medicos={medicos}
                  onAddHorario={handleAddHorario}
                />
              )}

              {activeTab === 'database' && (
                <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
                  <h1 className="text-xl font-bold text-white flex items-center space-x-2">
                    <ShieldCheck className="h-5 w-5 text-sky-400" />
                    <span>Segurança & Configurações da Clínica</span>
                  </h1>
                  <p className="text-xs text-slate-400">
                    O MEDSY utiliza criptografia e conexões seguras para proteger os dados médicos dos seus pacientes.
                  </p>
                  <button
                    onClick={() => setIsDbModalOpen(true)}
                    className="px-4 py-2 rounded-xl gradient-bg text-white font-semibold text-xs shadow-lg"
                  >
                    Ver Status de Conectividade
                  </button>
                </div>
              )}
            </>
          )}
        </main>

      </div>

      {/* MODAL LOGIN SECUNDÁRIO */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          verificarConsentimento(user.id);
          showToast(`Bem-vindo, ${user.nome}! Login efetuado com sucesso.`);
        }}
      />

      {/* MODAL CONSENTIMENTO LGPD (primeiro acesso) */}
      {isConsentOpen && (
        <ConsentModal
          onDone={() => {
            setIsConsentOpen(false);
            showToast('Consentimento registrado. Obrigado!');
          }}
        />
      )}

      {/* MODAL DIREITOS DO TITULAR (LGPD) */}
      <DsrModal
        isOpen={isDsrOpen}
        onClose={() => setIsDsrOpen(false)}
      />

      {/* MODAL BANCO DE DADOS STATUS */}
      <DatabaseStatusModal
        isOpen={isDbModalOpen}
        onClose={() => setIsDbModalOpen(false)}
      />

      {/* MODAL INTEGRAÇÃO GOOGLE CALENDAR */}
      <CalendarIntegrationsModal
        isOpen={isCalendarModalOpen}
        onClose={() => setIsCalendarModalOpen(false)}
        currentUser={currentUser}
        onUpdateUserStatus={handleUserCalendarUpdate}
      />

    </div>
  );
}
