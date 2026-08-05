'use client';

import React, { useState } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Link as LinkIcon, 
  Copy, 
  Send, 
  QrCode, 
  CreditCard, 
  Check, 
  Filter,
  Sparkles,
  Calendar,
  X
} from 'lucide-react';
import { TransacaoFinanceira, Consulta } from '@/lib/db';

interface FinanceiroModuleProps {
  transacoes: TransacaoFinanceira[];
  consultas: Consulta[];
  onUpdateStatus: (id: string, status: TransacaoFinanceira['status']) => Promise<void>;
  onAddTransacao: (t: Omit<TransacaoFinanceira, 'id'>) => Promise<void>;
}

export const FinanceiroModule: React.FC<FinanceiroModuleProps> = ({
  transacoes,
  consultas,
  onUpdateStatus,
  onAddTransacao
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('TODOS');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedTxForModal, setSelectedTxForModal] = useState<TransacaoFinanceira | null>(null);

  // Cálculos do DRE / Consolidação Mensal
  const totalFaturamento = transacoes.reduce((acc, curr) => acc + (curr.status !== 'CANCELADO' ? curr.valor : 0), 0);
  const totalRecebido = transacoes.reduce((acc, curr) => acc + (curr.status === 'PAGO' ? curr.valor : 0), 0);
  const totalPendente = transacoes.reduce((acc, curr) => acc + (curr.status === 'PENDENTE' ? curr.valor : 0), 0);
  const ticketMedio = transacoes.length > 0 ? totalFaturamento / transacoes.length : 0;

  const filteredTransacoes = transacoes.filter(t => {
    if (filterStatus === 'TODOS') return true;
    return t.status === filterStatus;
  });

  const handleCopyLink = (link: string, id: string) => {
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 3000);
  };

  const handleSendWhatsapp = (t: TransacaoFinanceira) => {
    const text = `Olá, ${t.paciente_nome}! Segue o link para pagamento da sua consulta com ${t.medico_nome}: ${t.link_pagamento || 'https://medsy.app/pay'}`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER DA SEÇÃO */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-card rounded-2xl p-6 border border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-emerald-400" />
            <span>Consolidação Financeira & Links de Pagamento</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Balanço mensal de faturamento, cobranças via PIX / Cartão e envio de links para pacientes.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center space-x-1.5">
            <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
            <span>Sincronização PIX Instantânea</span>
          </span>
        </div>
      </div>

      {/* METRIC CARDS FINANCEIROS (DRE) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* FATURAMENTO TOTAL */}
        <div className="glass-card glass-card-hover rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Faturamento Bruto</span>
            <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-white">
              R$ {totalFaturamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-sky-400 mt-1">Total de consultas geradas</div>
          </div>
        </div>

        {/* TOTAL RECEBIDO (PAGO) */}
        <div className="glass-card glass-card-hover rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Recebido (Pago)</span>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-emerald-400">
              R$ {totalRecebido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-emerald-300 mt-1">Confirmados no banco</div>
          </div>
        </div>

        {/* A RECEBER (PENDENTE) */}
        <div className="glass-card glass-card-hover rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">A Receber (Pendente)</span>
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-amber-400">
              R$ {totalPendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-amber-300 mt-1">Aguardando pagamento</div>
          </div>
        </div>

        {/* TICKET MÉDIO POR CONSULTA */}
        <div className="glass-card glass-card-hover rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Ticket Médio</span>
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-purple-300">
              R$ {ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-purple-400 mt-1">Média por atendimento</div>
          </div>
        </div>

      </div>

      {/* FILTROS E TABELA DE TRANSAÇÕES */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <CreditCard className="h-4 w-4 text-sky-400" />
              <span>Lançamentos Financeiros & Links de Cobrança</span>
            </h2>
            <p className="text-xs text-slate-400">Gerencie recebimentos e envie links diretamente para os pacientes.</p>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <Filter className="h-4 w-4 text-slate-400" />
            <span className="text-slate-400 font-semibold">Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="glass-input px-3 py-1.5 rounded-xl"
            >
              <option value="TODOS">Todas as Transações</option>
              <option value="PAGO">Somente Pagos</option>
              <option value="PENDENTE">Somente Pendentes</option>
              <option value="CANCELADO">Cancelados</option>
            </select>
          </div>
        </div>

        {/* TABELA DE TRANSAÇÕES */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                <th className="pb-3 px-3">Paciente</th>
                <th className="pb-3 px-3">Médico / Especialidade</th>
                <th className="pb-3 px-3">Valor</th>
                <th className="pb-3 px-3">Vencimento</th>
                <th className="pb-3 px-3">Status</th>
                <th className="pb-3 px-3 text-right">Ações & Link de Pagamento</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredTransacoes.map((t) => (
                <tr key={t.id} className="hover:bg-slate-800/40 transition-colors">
                  
                  <td className="py-3.5 px-3">
                    <div className="font-bold text-slate-100">{t.paciente_nome}</div>
                    <div className="text-[10px] text-slate-500 font-mono">ID: {t.id.substring(0, 13)}...</div>
                  </td>

                  <td className="py-3.5 px-3">
                    <div className="text-slate-300 font-medium">{t.medico_nome}</div>
                    <div className="text-[10px] text-purple-400 font-semibold">{t.especialidade}</div>
                  </td>

                  <td className="py-3.5 px-3 font-bold text-slate-100">
                    R$ {t.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>

                  <td className="py-3.5 px-3 text-slate-400">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3.5 w-3.5 text-slate-500" />
                      <span>{t.data_vencimento}</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-3">
                    <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      t.status === 'PAGO'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : t.status === 'PENDENTE'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        : 'bg-red-500/10 text-red-400 border border-red-500/30'
                    }`}>
                      {t.status === 'PAGO' && <CheckCircle2 className="h-3 w-3" />}
                      {t.status === 'PENDENTE' && <Clock className="h-3 w-3" />}
                      <span>{t.status}</span>
                    </span>
                  </td>

                  <td className="py-3.5 px-3 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      
                      {/* VER DETALHES / QR CODE PIX */}
                      <button
                        onClick={() => setSelectedTxForModal(t)}
                        className="px-2.5 py-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 text-[11px] font-semibold flex items-center space-x-1"
                        title="Ver QR Code PIX e Link"
                      >
                        <QrCode className="h-3.5 w-3.5 text-sky-400" />
                        <span>Link PIX</span>
                      </button>

                      {/* COPIAR LINK */}
                      <button
                        onClick={() => handleCopyLink(t.link_pagamento || `https://medsy.app/pay/${t.id}`, t.id)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                        title="Copiar Link de Pagamento"
                      >
                        {copiedId === t.id ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>

                      {/* ENVIAR WHATSAPP */}
                      <button
                        onClick={() => handleSendWhatsapp(t)}
                        className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-colors"
                        title="Enviar Cobrança no WhatsApp"
                      >
                        <Send className="h-3.5 w-3.5" />
                      </button>

                      {/* BAIR STATUS SE PENDENTE */}
                      {t.status === 'PENDENTE' && (
                        <button
                          onClick={() => onUpdateStatus(t.id, 'PAGO')}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px] shadow-sm transition-all"
                        >
                          Marcar Pago
                        </button>
                      )}

                    </div>
                  </td>

                </tr>
              ))}

              {filteredTransacoes.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    Nenhum lançamento financeiro encontrado para o filtro selecionado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DETALHES DO LINK DE PAGAMENTO PIX */}
      {selectedTxForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="glass-card rounded-3xl w-full max-w-md p-6 border border-slate-700 shadow-2xl relative space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <QrCode className="h-5 w-5 text-sky-400" />
                <span>Link & QR Code de Pagamento</span>
              </h3>
              <button onClick={() => setSelectedTxForModal(null)} className="p-1 text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="text-center space-y-2">
              <p className="text-xs text-slate-400">Paciente: <strong className="text-slate-200">{selectedTxForModal.paciente_nome}</strong></p>
              <div className="text-3xl font-black text-emerald-400">
                R$ {selectedTxForModal.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-[11px] text-purple-300 font-semibold">{selectedTxForModal.especialidade} — {selectedTxForModal.medico_nome}</p>
            </div>

            {/* QR CODE SIMULADO */}
            <div className="bg-white p-4 rounded-2xl max-w-[180px] mx-auto shadow-xl flex flex-col items-center justify-center space-y-2">
              <div className="w-36 h-36 bg-slate-900 rounded-xl flex items-center justify-center p-2 text-center text-white text-[10px] font-mono leading-tight">
                [ QR CODE PIX MEDSY ]
                <br />
                {selectedTxForModal.id.substring(0, 10)}
              </div>
            </div>

            <div>
              <label className="block text-slate-400 text-[11px] font-semibold mb-1">Código PIX Copia e Cola:</label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  readOnly
                  value={selectedTxForModal.pix_code || '00020126580014br.gov.bcb.pix0136medsy-pay'}
                  className="w-full glass-input px-3 py-2 rounded-xl text-[10px] font-mono text-slate-300 truncate"
                />
                <button
                  onClick={() => handleCopyLink(selectedTxForModal.pix_code || '', selectedTxForModal.id)}
                  className="px-3 py-2 rounded-xl gradient-bg text-white text-xs font-semibold shrink-0"
                >
                  Copiar
                </button>
              </div>
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                onClick={() => handleSendWhatsapp(selectedTxForModal)}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center space-x-2 shadow-lg"
              >
                <Send className="h-4 w-4" />
                <span>Enviar no WhatsApp do Paciente</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
