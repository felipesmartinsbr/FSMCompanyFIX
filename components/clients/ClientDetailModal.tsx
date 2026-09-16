'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Client, ClientStatus, Currency } from '@/types';
import { formatCurrency, formatDate } from '@/lib/formatters';
import {
  X,
  Building2,
  Phone,
  Mail,
  Globe,
  ExternalLink,
  FolderKanban,
  Wallet,
  Clock,
  FileText,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Link2,
} from 'lucide-react';

interface ClientDetailModalProps {
  clientId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenNewProjectForClient?: (client: Client) => void;
}

export function ClientDetailModal({
  clientId,
  isOpen,
  onClose,
  onOpenNewProjectForClient,
}: ClientDetailModalProps) {
  const {
    clients,
    updateClient,
    deleteClient,
    projects,
    transactions,
    recurringContracts,
    addTransaction,
    setSelectedProjectId,
    setCurrentTab,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'finance' | 'history' | 'docs'>('overview');
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [showAddLinkForm, setShowAddLinkForm] = useState(false);

  // Quick Charge Form state
  const [showAddCharge, setShowAddCharge] = useState(false);
  const [chargeTitle, setChargeTitle] = useState('');
  const [chargeAmount, setChargeAmount] = useState<number>(1500);
  const [chargeDueDate, setChargeDueDate] = useState(new Date().toISOString().split('T')[0]);

  const client = clients.find((c) => c.id === clientId);
  if (!isOpen || !client) return null;

  const clientProjects = projects.filter((p) => p.clientId === client.id);
  const clientTransactions = transactions.filter((t) => t.clientId === client.id);
  const clientRecurring = recurringContracts.filter((rc) => rc.clientId === client.id);

  const handleStatusChange = (newStatus: ClientStatus) => {
    updateClient(client.id, { status: newStatus });
  };

  const handleAddLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLinkTitle || !newLinkUrl) return;

    const newLink = {
      id: `link_${Date.now()}`,
      title: newLinkTitle,
      url: newLinkUrl,
      type: 'other' as const,
    };

    updateClient(client.id, {
      sharedLinks: [...(client.sharedLinks || []), newLink],
    });

    setNewLinkTitle('');
    setNewLinkUrl('');
    setShowAddLinkForm(false);
  };

  const handleAddCharge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chargeTitle.trim() || !chargeAmount) return;

    addTransaction({
      type: 'receita',
      category: 'Serviço Prestado',
      title: chargeTitle,
      amount: Number(chargeAmount) || 0,
      currency: client.currency,
      dueDate: chargeDueDate,
      issueDate: new Date().toISOString().split('T')[0],
      isRecurring: client.billingType === 'recorrente',
      status: 'pendente',
      clientId: client.id,
      clientName: client.companyName,
      billingType: client.billingType,
      paymentMethod: 'Pix',
    });

    setChargeTitle('');
    setShowAddCharge(false);
  };

  const handleDeleteClient = () => {
    if (confirm(`Deseja realmente excluir o cliente ${client.companyName}?`)) {
      deleteClient(client.id);
      onClose();
    }
  };

  return (
    <div
      id="client-detail-backdrop"
      className="fixed inset-0 z-50 bg-neutral-950/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in"
      onClick={onClose}
    >
      <div
        id="client-detail-modal"
        className="bg-white rounded-2xl shadow-2xl border border-neutral-200 w-full max-w-4xl max-h-[90vh] flex flex-col text-neutral-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-neutral-100 bg-neutral-50/50">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-900 flex items-center justify-center font-bold flex-shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold text-neutral-900">{client.companyName}</h2>
                <select
                  value={client.status}
                  onChange={(e: any) => handleStatusChange(e.target.value)}
                  className="px-2.5 py-0.5 rounded-full text-xs font-bold capitalize bg-white border border-neutral-200 focus:outline-hidden"
                >
                  <option value="onboarding">Onboarding</option>
                  <option value="ativo">Ativo</option>
                  <option value="pausado">Pausado</option>
                  <option value="churn">Encerrado / Churn</option>
                </select>
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">
                {client.tradeName && `${client.tradeName} • `}
                {client.category} • {client.city}, {client.country}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[11px] text-neutral-500 block">Valor Contratado</span>
              <span className="text-base font-bold text-neutral-900">
                {formatCurrency(client.contractedValue, client.currency)}
              </span>
            </div>
            <button onClick={onClose} className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center px-6 border-b border-neutral-200 text-xs font-semibold space-x-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'overview'
                ? 'border-blue-900 text-blue-950 font-bold'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Visão Geral</span>
          </button>

          <button
            onClick={() => setActiveTab('projects')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'projects'
                ? 'border-blue-900 text-blue-950 font-bold'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <FolderKanban className="w-4 h-4" />
            <span>Projetos ({clientProjects.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('finance')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'finance'
                ? 'border-blue-900 text-blue-950 font-bold'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <Wallet className="w-4 h-4" />
            <span>Financeiro ({clientTransactions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('docs')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'docs'
                ? 'border-blue-900 text-blue-950 font-bold'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <Link2 className="w-4 h-4" />
            <span>Links & Documentos ({client.sharedLinks?.length || 0})</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-6 text-xs">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Contatos */}
                <div className="p-4 rounded-xl border border-neutral-200 space-y-3">
                  <h4 className="font-bold text-neutral-900 border-b border-neutral-100 pb-1">
                    Contato Decisor
                  </h4>
                  <div className="space-y-2 text-xs">
                    <p className="font-bold text-neutral-900 text-sm">{client.primaryContactName}</p>
                    <p className="text-neutral-500">{client.primaryContactRole}</p>
                    <div className="flex items-center gap-2 text-neutral-700">
                      <Phone className="w-4 h-4 text-emerald-600" />
                      <span>{client.primaryContactPhone || 'Telefone não cadastrado'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-neutral-700">
                      <Mail className="w-4 h-4 text-blue-600" />
                      <span>{client.primaryContactEmail || 'E-mail não cadastrado'}</span>
                    </div>
                  </div>
                </div>

                {/* Dados da Conta */}
                <div className="p-4 rounded-xl border border-neutral-200 space-y-3">
                  <h4 className="font-bold text-neutral-900 border-b border-neutral-100 pb-1">
                    Dados da Conta
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-neutral-500 block text-[11px]">Tipo de Faturamento</span>
                      <span className="font-bold capitalize text-neutral-900">{client.billingType}</span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block text-[11px]">Início do Contrato</span>
                      <span className="font-bold text-neutral-900">{formatDate(client.startDate)}</span>
                    </div>
                    {((client.recurringAmount ?? client.recurringValue ?? client.monthlyRecurringValue ?? 0) > 0) && (
                      <div>
                        <span className="text-neutral-500 block text-[11px]">Recorrência Mensal</span>
                        <span className="font-bold text-emerald-700">
                          {formatCurrency(client.recurringAmount ?? client.recurringValue ?? client.monthlyRecurringValue ?? 0, client.currency)}/mês
                        </span>
                      </div>
                    )}
                    {client.taxId && (
                      <div>
                        <span className="text-neutral-500 block text-[11px]">CNPJ / Tax ID</span>
                        <span className="font-semibold text-neutral-800">{client.taxId}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Soluções Subscritas */}
              <div className="p-4 rounded-xl border border-neutral-200 space-y-2">
                <h4 className="font-bold text-neutral-900">Soluções & Serviços Ativos</h4>
                <div className="flex flex-wrap gap-2">
                  {client.servicesSubscribed.map((srv, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-blue-50 text-blue-900 border border-blue-100 rounded-lg font-medium"
                    >
                      ✓ {srv}
                    </span>
                  ))}
                </div>
              </div>

              {/* Delete Client */}
              <div className="pt-4 border-t border-neutral-100 flex justify-end">
                <button
                  onClick={handleDeleteClient}
                  className="text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 text-xs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Excluir Cliente</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: PROJETOS */}
          {activeTab === 'projects' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-neutral-900">Projetos deste Cliente</span>
                {onOpenNewProjectForClient && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenNewProjectForClient(client);
                    }}
                    className="px-3 py-1.5 bg-blue-950 text-white rounded-lg font-semibold hover:bg-blue-900 transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Criar Projeto de Entrega</span>
                  </button>
                )}
              </div>

              {clientProjects.length === 0 ? (
                <div className="p-8 text-center text-neutral-400 border border-dashed border-neutral-200 rounded-xl">
                  Nenhum projeto registrado para este cliente ainda.
                </div>
              ) : (
                <div className="space-y-3">
                  {clientProjects.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => {
                        onClose();
                        setCurrentTab('projects');
                        setSelectedProjectId(p.id);
                      }}
                      className="p-4 rounded-xl border border-neutral-200 hover:border-blue-400 bg-white cursor-pointer transition-colors space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-neutral-900">{p.name}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-800 uppercase">
                          {p.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-neutral-500">
                        <span>Prazo: {formatDate(p.dueDate)} • Resp: {p.responsibleName}</span>
                        <span className="font-bold text-neutral-800">{p.progressPercentage}% concluído</span>
                      </div>
                      <div className="w-full bg-neutral-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${p.progressPercentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: FINANCE */}
          {activeTab === 'finance' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-neutral-900">Histórico Financeiro & Lançamentos</span>
                <button
                  onClick={() => setShowAddCharge((prev) => !prev)}
                  className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Nova Fatura / Cobrança</span>
                </button>
              </div>

              {showAddCharge && (
                <form
                  onSubmit={handleAddCharge}
                  className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200 space-y-3"
                >
                  <h4 className="font-bold text-emerald-950">Lançar Nova Fatura ou Parcela</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-neutral-700 block mb-1">Título da Fatura</label>
                      <input
                        required
                        type="text"
                        placeholder="Ex: Parcela 2/3 - Entrega Landing Page"
                        value={chargeTitle}
                        onChange={(e) => setChargeTitle(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-neutral-200 bg-white rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="text-neutral-700 block mb-1">Valor ({client.currency})</label>
                      <input
                        required
                        type="number"
                        value={chargeAmount}
                        onChange={(e) => setChargeAmount(parseFloat(e.target.value) || 0)}
                        className="w-full px-2.5 py-1.5 border border-neutral-200 bg-white rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="text-neutral-700 block mb-1">Data de Vencimento</label>
                      <input
                        required
                        type="date"
                        value={chargeDueDate}
                        onChange={(e) => setChargeDueDate(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-neutral-200 bg-white rounded-lg"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddCharge(false)}
                      className="px-3 py-1 border border-neutral-200 rounded-lg hover:bg-white"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700"
                    >
                      Confirmar Lançamento
                    </button>
                  </div>
                </form>
              )}

              {/* Transaction list */}
              {clientTransactions.length === 0 ? (
                <div className="p-8 text-center text-neutral-400 border border-dashed border-neutral-200 rounded-xl">
                  Nenhuma fatura registrada para este cliente.
                </div>
              ) : (
                <div className="border border-neutral-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-neutral-50 font-semibold text-neutral-600">
                      <tr>
                        <th className="p-2.5">Título / Descrição</th>
                        <th className="p-2.5">Vencimento</th>
                        <th className="p-2.5">Valor</th>
                        <th className="p-2.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {clientTransactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-neutral-50">
                          <td className="p-2.5 font-medium text-neutral-900">{tx.title}</td>
                          <td className="p-2.5 text-neutral-600">{formatDate(tx.dueDate)}</td>
                          <td className="p-2.5 font-bold text-neutral-900">
                            {formatCurrency(tx.amount, tx.currency)}
                          </td>
                          <td className="p-2.5">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize ${
                                tx.status === 'pago'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : tx.status === 'vencido'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {tx.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: DOCS & LINKS */}
          {activeTab === 'docs' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-neutral-900">Pastas no Google Drive, Briefings e Contratos</span>
                <button
                  onClick={() => setShowAddLinkForm((prev) => !prev)}
                  className="px-3 py-1.5 bg-blue-950 text-white rounded-lg font-semibold hover:bg-blue-900 transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Adicionar Link</span>
                </button>
              </div>

              {showAddLinkForm && (
                <form
                  onSubmit={handleAddLink}
                  className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-3"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-neutral-700 block mb-1">Título do Documento / Link</label>
                      <input
                        required
                        type="text"
                        placeholder="Ex: Pasta Compartilhada Google Drive"
                        value={newLinkTitle}
                        onChange={(e) => setNewLinkTitle(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-neutral-200 bg-white rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="text-neutral-700 block mb-1">URL / Endereço</label>
                      <input
                        required
                        type="url"
                        placeholder="https://drive.google.com/..."
                        value={newLinkUrl}
                        onChange={(e) => setNewLinkUrl(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-neutral-200 bg-white rounded-lg"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddLinkForm(false)}
                      className="px-3 py-1 border border-neutral-200 rounded-lg hover:bg-white"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1 bg-blue-950 text-white rounded-lg font-semibold"
                    >
                      Salvar Link
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-2">
                {(client.sharedLinks || []).map((link) => (
                  <div
                    key={link.id}
                    className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Link2 className="w-4 h-4 text-blue-700" />
                      <div>
                        <span className="font-semibold text-neutral-900 block">{link.title}</span>
                        <span className="text-[11px] text-neutral-500 truncate max-w-sm block">
                          {link.url}
                        </span>
                      </div>
                    </div>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-white border border-neutral-200 rounded-lg font-semibold text-neutral-700 hover:text-blue-700 hover:border-blue-300 flex items-center gap-1 transition-colors"
                    >
                      <span>Abrir</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
