'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { formatCurrency, formatDate, isDateOverdue, isDateUpcoming } from '@/lib/formatters';
import {
  TrendingUp,
  Target,
  Building2,
  FolderKanban,
  Wallet,
  Clock,
  AlertCircle,
  CheckCircle2,
  Calendar,
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign,
  Briefcase,
  AlertTriangle,
  Lightbulb,
  Sparkles,
  ChevronRight,
  Plus,
} from 'lucide-react';

interface DashboardViewProps {
  onOpenNewLead?: () => void;
  onOpenNewClient?: () => void;
  onOpenNewProject?: () => void;
  onOpenNewTransaction?: () => void;
}

export function DashboardView({
  onOpenNewLead,
  onOpenNewClient,
  onOpenNewProject,
  onOpenNewTransaction,
}: DashboardViewProps = {}) {
  const {
    leads,
    clients,
    projects,
    transactions,
    recurringContracts,
    currencyFilter,
    periodFilter,
    settings,
    setCurrentTab,
    setSelectedLeadId,
    setSelectedClientId,
    setSelectedProjectId,
  } = useApp();

  // Helper for period filtering
  const isWithinPeriod = React.useCallback((dateStr?: string) => {
    if (!dateStr || periodFilter === 'all' || periodFilter === 'tudo') return true;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return true;

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const currentDate = now.getDate();

    const startOfToday = new Date(currentYear, currentMonth, currentDate);

    switch (periodFilter as string) {
      case 'today':
      case 'hoje':
        return d >= startOfToday;
      case 'week':
      case 'semana': {
        const dayOfWeek = now.getDay();
        const startOfWeek = new Date(currentYear, currentMonth, currentDate - dayOfWeek);
        return d >= startOfWeek;
      }
      case 'month':
      case 'este_mes': {
        const startOfMonth = new Date(currentYear, currentMonth, 1);
        return d >= startOfMonth;
      }
      case 'mes_passado': {
        const startOfLastMonth = new Date(currentYear, currentMonth - 1, 1);
        const endOfLastMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);
        return d >= startOfLastMonth && d <= endOfLastMonth;
      }
      case 'quarter':
      case 'trimestre': {
        const currentQuarter = Math.floor(currentMonth / 3);
        const startOfQuarter = new Date(currentYear, currentQuarter * 3, 1);
        return d >= startOfQuarter;
      }
      case 'year':
      case 'este_ano': {
        const startOfYear = new Date(currentYear, 0, 1);
        return d >= startOfYear;
      }
      default:
        return true;
    }
  }, [periodFilter]);

  // Period filtered datasets
  const periodTransactions = React.useMemo(() => {
    return transactions.filter((t) => isWithinPeriod(t.paymentDate || t.dueDate || t.issueDate));
  }, [transactions, isWithinPeriod]);

  const periodLeads = React.useMemo(() => {
    return leads.filter((l) => isWithinPeriod(l.createdAt));
  }, [leads, isWithinPeriod]);

  // Commercial Metrics
  const totalLeads = periodLeads.length;
  const newLeads = periodLeads.filter((l) => l.stageId === 'novo_lead').length;
  const inNegotiationLeads = periodLeads.filter((l) => l.stageId === 'negociacao' || l.stageId === 'proposta_enviada').length;
  const wonLeads = periodLeads.filter((l) => l.status === 'ganho').length;
  const lostLeads = periodLeads.filter((l) => l.status === 'perdido').length;
  const conversionRate = wonLeads + lostLeads > 0
    ? Math.round((wonLeads / (wonLeads + lostLeads)) * 100)
    : (totalLeads > 0 ? Math.round((wonLeads / totalLeads) * 100) : 0);

  // Pipeline values separate by currency
  const openPipelineBRL = leads
    .filter((l) => l.status === 'aberto' && l.currency === 'BRL')
    .reduce((sum, l) => sum + l.estimatedValue, 0);

  const openPipelineUSD = leads
    .filter((l) => l.status === 'aberto' && l.currency === 'USD')
    .reduce((sum, l) => sum + l.estimatedValue, 0);

  // Clients Metrics
  const activeClients = clients.filter((c) => c.status === 'ativo' || c.status === 'execucao').length;
  const onboardingClients = clients.filter((c) => c.status === 'onboarding').length;

  // MRR separate by currency
  const mrrBRL = recurringContracts
    .filter((rc) => rc.status === 'ativo' && rc.currency === 'BRL')
    .reduce((sum, rc) => sum + rc.recurringAmount, 0);

  const mrrUSD = recurringContracts
    .filter((rc) => rc.status === 'ativo' && rc.currency === 'USD')
    .reduce((sum, rc) => sum + rc.recurringAmount, 0);

  // Projects Metrics
  const activeProjects = projects.filter((p) => p.status === 'em_andamento' || p.status === 'onboarding');
  const delayedProjects = projects.filter((p) => isDateOverdue(p.dueDate) && p.status !== 'concluido' && p.status !== 'cancelado');
  
  // Total Overdue Tasks across all projects
  const overdueTasksList: { projectId: string; projectName: string; clientName: string; taskTitle: string; dueDate: string }[] = [];
  projects.forEach((p) => {
    p.phases.forEach((ph) => {
      ph.tasks.forEach((t) => {
        if (t.status !== 'concluida' && t.status !== 'cancelada' && isDateOverdue(t.dueDate)) {
          overdueTasksList.push({
            projectId: p.id,
            projectName: p.name,
            clientName: p.clientName,
            taskTitle: t.title,
            dueDate: t.dueDate,
          });
        }
      });
    });
  });

  // Financial Metrics (Separated strictly by BRL and USD, filtered by active period)
  const receivedBRL = periodTransactions
    .filter((t) => t.type === 'receita' && t.status === 'pago' && t.currency === 'BRL')
    .reduce((sum, t) => sum + t.amount, 0);

  const receivedUSD = periodTransactions
    .filter((t) => t.type === 'receita' && t.status === 'pago' && t.currency === 'USD')
    .reduce((sum, t) => sum + t.amount, 0);

  const pendingReceivablesBRL = periodTransactions
    .filter((t) => t.type === 'receita' && (t.status === 'pendente' || t.status === 'vencido') && t.currency === 'BRL')
    .reduce((sum, t) => sum + t.amount, 0);

  const pendingReceivablesUSD = periodTransactions
    .filter((t) => t.type === 'receita' && (t.status === 'pendente' || t.status === 'vencido') && t.currency === 'USD')
    .reduce((sum, t) => sum + t.amount, 0);

  const expensesBRL = periodTransactions
    .filter((t) => t.type === 'despesa' && t.currency === 'BRL')
    .reduce((sum, t) => sum + t.amount, 0);

  const expensesUSD = periodTransactions
    .filter((t) => t.type === 'despesa' && t.currency === 'USD')
    .reduce((sum, t) => sum + t.amount, 0);

  // Operational Priorities
  const upcomingFollowUps = leads.filter(
    (l) => l.status === 'aberto' && (isDateUpcoming(l.nextFollowUpDate, 3) || isDateOverdue(l.nextFollowUpDate))
  );

  const pendingPayments = periodTransactions.filter(
    (t) => t.type === 'receita' && (t.status === 'pendente' || t.status === 'vencido')
  );

  // Intelligent operational feedback generator
  const operationalInsights: { type: 'alert' | 'success' | 'info'; message: string }[] = [];
  if (pendingReceivablesBRL > 0 || pendingReceivablesUSD > 0) {
    operationalInsights.push({
      type: 'info',
      message: `Você tem ${formatCurrency(pendingReceivablesBRL, 'BRL')}${pendingReceivablesUSD > 0 ? ` e ${formatCurrency(pendingReceivablesUSD, 'USD')}` : ''} previstos a receber neste período.`,
    });
  }
  if (inNegotiationLeads > 0) {
    operationalInsights.push({
      type: 'alert',
      message: `${inNegotiationLeads} oportunidades comerciais estão em estágio avançado de negociação ou com propostas enviadas aguardando retorno.`,
    });
  }
  if (overdueTasksList.length > 0) {
    operationalInsights.push({
      type: 'alert',
      message: `Existem ${overdueTasksList.length} tarefas com prazo vencido em projetos ativos que precisam de atenção.`,
    });
  } else {
    operationalInsights.push({
      type: 'success',
      message: 'Todas as tarefas de projetos em andamento estão dentro do cronograma previsto.',
    });
  }
  if (leads.filter((l) => l.country !== 'Brasil').length > 0) {
    operationalInsights.push({
      type: 'info',
      message: 'Operação internacional ativa gerando oportunidades em dólar americano (USD).',
    });
  }

  return (
    <div id="dashboard-view" className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-150">
      {/* Welcome Banner / Overview Header */}
      <div className="bg-white rounded-2xl p-6 border border-neutral-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-50 text-blue-900 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Centro de Comando Operacional</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-neutral-900 tracking-tight">
            Olá, {settings.ownerName}
          </h2>
          <p className="text-sm text-neutral-600 mt-1">
            Aqui está o panorama em tempo real das vendas, projetos e fluxo de caixa da{' '}
            <strong className="text-neutral-900 font-semibold">{settings.companyName}</strong>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-neutral-50 border border-neutral-200/80 rounded-xl px-3.5 py-2 text-xs">
            <span className="text-neutral-500 block text-[11px]">Taxa de Conversão</span>
            <span className="text-base font-bold text-neutral-900">{conversionRate}%</span>
          </div>
          <div className="bg-neutral-50 border border-neutral-200/80 rounded-xl px-3.5 py-2 text-xs">
            <span className="text-neutral-500 block text-[11px]">MRR Recorrente (BRL)</span>
            <span className="text-base font-bold text-emerald-700">{formatCurrency(mrrBRL, 'BRL')}</span>
          </div>
          {mrrUSD > 0 && (
            <div className="bg-neutral-50 border border-neutral-200/80 rounded-xl px-3.5 py-2 text-xs">
              <span className="text-neutral-500 block text-[11px]">MRR Recorrente (USD)</span>
              <span className="text-base font-bold text-emerald-700">{formatCurrency(mrrUSD, 'USD')}</span>
            </div>
          )}
        </div>
      </div>

      {/* INTELLIGENT OPERATIONAL FEEDBACK */}
      <div className="bg-neutral-900 text-white rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">
          <Lightbulb className="w-4 h-4 text-amber-400" />
          <span>Feedback Operacional & Insights em Tempo Real</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          {operationalInsights.map((insight, idx) => (
            <div
              key={idx}
              className="bg-neutral-800/80 border border-neutral-700/80 rounded-xl p-3.5 flex items-start gap-2.5"
            >
              {insight.type === 'alert' && <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />}
              {insight.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />}
              {insight.type === 'info' && <TrendingUp className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />}
              <p className="text-neutral-200 leading-relaxed">{insight.message}</p>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 1: KPIS COMERCIAIS */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-700" />
            <h3 className="text-base font-bold text-neutral-900">Operação Comercial & Vendas</h3>
          </div>
          <button
            onClick={() => setCurrentTab('pipeline')}
            className="text-xs font-semibold text-blue-700 hover:text-blue-800 flex items-center gap-1 hover:underline"
          >
            Ver Pipeline Kanban <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
          <div className="bg-white p-4 rounded-xl border border-neutral-200/80 shadow-2xs">
            <span className="text-xs text-neutral-500 font-medium">Total de Leads</span>
            <p className="text-2xl font-bold text-neutral-900 mt-1">{totalLeads}</p>
            <span className="text-[11px] text-neutral-500 mt-0.5 block">{newLeads} novos para qualificar</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-neutral-200/80 shadow-2xs">
            <span className="text-xs text-neutral-500 font-medium">Em Negociação</span>
            <p className="text-2xl font-bold text-blue-700 mt-1">{inNegotiationLeads}</p>
            <span className="text-[11px] text-neutral-500 mt-0.5 block">Propostas / fechamento</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-neutral-200/80 shadow-2xs">
            <span className="text-xs text-neutral-500 font-medium">Negócios Ganhos</span>
            <p className="text-2xl font-bold text-emerald-700 mt-1">{wonLeads}</p>
            <span className="text-[11px] text-emerald-600 font-medium mt-0.5 block">Convertidos com sucesso</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-neutral-200/80 shadow-2xs">
            <span className="text-xs text-neutral-500 font-medium">Negócios Perdidos</span>
            <p className="text-2xl font-bold text-rose-700 mt-1">{lostLeads}</p>
            <span className="text-[11px] text-neutral-500 mt-0.5 block">Para nutrição futura</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-neutral-200/80 shadow-2xs">
            <span className="text-xs text-neutral-500 font-medium">Oportunidades (BRL)</span>
            <p className="text-lg font-bold text-neutral-900 mt-1">{formatCurrency(openPipelineBRL, 'BRL')}</p>
            <span className="text-[11px] text-neutral-500 mt-0.5 block">Em negociação Brasil</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-neutral-200/80 shadow-2xs">
            <span className="text-xs text-neutral-500 font-medium">Oportunidades (USD)</span>
            <p className="text-lg font-bold text-neutral-900 mt-1">{formatCurrency(openPipelineUSD, 'USD')}</p>
            <span className="text-[11px] text-neutral-500 mt-0.5 block">Em negociação Exterior</span>
          </div>
        </div>
      </div>

      {/* SECTION 2: KPIS DE PROJETOS E CLIENTES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Clientes */}
        <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-700" />
              <h3 className="text-sm font-bold text-neutral-900">Carteira de Clientes</h3>
            </div>
            <button
              onClick={() => setCurrentTab('clients')}
              className="text-xs font-semibold text-blue-700 hover:underline"
            >
              Ver todos ({clients.length})
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-100">
              <span className="text-[11px] text-neutral-500 font-medium">Clientes Ativos</span>
              <p className="text-xl font-bold text-neutral-900 mt-0.5">{activeClients}</p>
            </div>
            <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-100">
              <span className="text-[11px] text-neutral-500 font-medium">Em Onboarding</span>
              <p className="text-xl font-bold text-blue-700 mt-0.5">{onboardingClients}</p>
            </div>
            <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-100">
              <span className="text-[11px] text-neutral-500 font-medium">Recorrências Ativas</span>
              <p className="text-xl font-bold text-emerald-700 mt-0.5">{recurringContracts.length}</p>
            </div>
          </div>

          {/* Quick client list preview */}
          <div className="mt-4 divide-y divide-neutral-100">
            {clients.slice(0, 3).map((client) => (
              <div
                key={client.id}
                onClick={() => {
                  setCurrentTab('clients');
                  setSelectedClientId(client.id);
                }}
                className="py-2.5 flex items-center justify-between text-xs hover:bg-neutral-50 px-2 rounded-lg cursor-pointer transition-colors"
              >
                <div>
                  <p className="font-semibold text-neutral-900">{client.companyName}</p>
                  <p className="text-neutral-500 text-[11px]">{client.category} • {client.city}</p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-neutral-800">
                    {formatCurrency(client.contractedValue, client.currency)}
                  </span>
                  <span className="block text-[10px] text-emerald-700 capitalize font-medium">{client.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Projetos */}
        <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FolderKanban className="w-4 h-4 text-amber-700" />
              <h3 className="text-sm font-bold text-neutral-900">Entregas & Projetos</h3>
            </div>
            <button
              onClick={() => setCurrentTab('projects')}
              className="text-xs font-semibold text-blue-700 hover:underline"
            >
              Ver projetos ({projects.length})
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-100">
              <span className="text-[11px] text-neutral-500 font-medium">Em Andamento</span>
              <p className="text-xl font-bold text-neutral-900 mt-0.5">{activeProjects.length}</p>
            </div>
            <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-100">
              <span className="text-[11px] text-neutral-500 font-medium">Tarefas Atrasadas</span>
              <p className={`text-xl font-bold mt-0.5 ${overdueTasksList.length > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                {overdueTasksList.length}
              </p>
            </div>
            <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-100">
              <span className="text-[11px] text-neutral-500 font-medium">Projetos Atrasados</span>
              <p className={`text-xl font-bold mt-0.5 ${delayedProjects.length > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                {delayedProjects.length}
              </p>
            </div>
          </div>

          {/* Quick projects preview */}
          <div className="mt-4 divide-y divide-neutral-100">
            {projects.slice(0, 3).map((proj) => (
              <div
                key={proj.id}
                onClick={() => {
                  setCurrentTab('projects');
                  setSelectedProjectId(proj.id);
                }}
                className="py-2.5 flex items-center justify-between text-xs hover:bg-neutral-50 px-2 rounded-lg cursor-pointer transition-colors"
              >
                <div className="truncate max-w-[70%]">
                  <p className="font-semibold text-neutral-900 truncate">{proj.name}</p>
                  <p className="text-neutral-500 text-[11px] truncate">Prazo: {formatDate(proj.dueDate)} • {proj.responsibleName}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="w-20 bg-neutral-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${proj.progressPercentage}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-neutral-600 mt-0.5 block">{proj.progressPercentage}% concluído</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 3: KPIS FINANCEIROS (BRL e USD RIGOROSAMENTE SEPARADOS) */}
      <div className="bg-white rounded-2xl p-6 border border-neutral-200/80 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
              <Wallet className="w-5 h-5 text-emerald-700" />
              Saúde Financeira da Empresa
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Faturamento recebido, previsões de entrada e custos operacionais (valores separados por moeda).
            </p>
          </div>
          <button
            onClick={() => setCurrentTab('finance_overview')}
            className="text-xs font-semibold text-blue-700 hover:underline self-start sm:self-auto"
          >
            Abrir Módulo Financeiro &rarr;
          </button>
        </div>

        {/* Currency Split Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Real Brasileiro (BRL) */}
          <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                <span className="text-xs font-bold text-blue-950 uppercase tracking-wider">
                  Operação Brasil (BRL R$)
                </span>
              </div>
              <span className="text-[11px] font-medium text-blue-800 bg-blue-100/70 px-2 py-0.5 rounded">
                Moeda Base
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-white p-3 rounded-lg border border-neutral-200/70">
                <span className="text-neutral-500 text-[11px] block">Receita Recebida</span>
                <span className="text-base font-bold text-emerald-700 block mt-0.5">
                  {formatCurrency(receivedBRL, 'BRL')}
                </span>
              </div>
              <div className="bg-white p-3 rounded-lg border border-neutral-200/70">
                <span className="text-neutral-500 text-[11px] block">A Receber (Previsto)</span>
                <span className="text-base font-bold text-blue-900 block mt-0.5">
                  {formatCurrency(pendingReceivablesBRL, 'BRL')}
                </span>
              </div>
              <div className="bg-white p-3 rounded-lg border border-neutral-200/70">
                <span className="text-neutral-500 text-[11px] block">Despesas / Custos</span>
                <span className="text-base font-bold text-rose-700 block mt-0.5">
                  {formatCurrency(expensesBRL, 'BRL')}
                </span>
              </div>
              <div className="bg-white p-3 rounded-lg border border-neutral-200/70">
                <span className="text-neutral-500 text-[11px] block">MRR Ativo</span>
                <span className="text-base font-bold text-neutral-900 block mt-0.5">
                  {formatCurrency(mrrBRL, 'BRL')}/mês
                </span>
              </div>
            </div>
          </div>

          {/* Dólar Americano (USD) */}
          <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                  Operação Exterior (USD $)
                </span>
              </div>
              <span className="text-[11px] font-medium text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded">
                Ref. Câmbio ~ R$ {settings.exchangeRateBRLtoUSD.toFixed(2)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-white p-3 rounded-lg border border-neutral-200/70">
                <span className="text-neutral-500 text-[11px] block">Receita Recebida</span>
                <span className="text-base font-bold text-emerald-700 block mt-0.5">
                  {formatCurrency(receivedUSD, 'USD')}
                </span>
              </div>
              <div className="bg-white p-3 rounded-lg border border-neutral-200/70">
                <span className="text-neutral-500 text-[11px] block">A Receber (Previsto)</span>
                <span className="text-base font-bold text-emerald-900 block mt-0.5">
                  {formatCurrency(pendingReceivablesUSD, 'USD')}
                </span>
              </div>
              <div className="bg-white p-3 rounded-lg border border-neutral-200/70">
                <span className="text-neutral-500 text-[11px] block">Despesas / Ferramentas</span>
                <span className="text-base font-bold text-rose-700 block mt-0.5">
                  {formatCurrency(expensesUSD, 'USD')}
                </span>
              </div>
              <div className="bg-white p-3 rounded-lg border border-neutral-200/70">
                <span className="text-neutral-500 text-[11px] block">MRR Ativo</span>
                <span className="text-base font-bold text-neutral-900 block mt-0.5">
                  {formatCurrency(mrrUSD, 'USD')}/mês
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 4: CENTRAL DE PRIORIDADES DA OPERAÇÃO */}
      <div className="bg-white rounded-2xl p-6 border border-neutral-200/80 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-600" />
            <h3 className="text-base font-bold text-neutral-900">Prioridades da Operação</h3>
          </div>
          <span className="text-xs text-neutral-500">Ações imediatas para acelerar o caixa</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Column 1: Follow-ups do Comercial */}
          <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between font-semibold text-neutral-900 mb-2">
                <span>Follow-ups & Negociações</span>
                <span className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded text-[10px]">
                  {upcomingFollowUps.length}
                </span>
              </div>
              <p className="text-neutral-500 text-[11px] mb-3">
                Leads quentes com retorno previsto ou com propostas na mesa.
              </p>
              <div className="space-y-2">
                {upcomingFollowUps.slice(0, 3).map((l) => (
                  <div
                    key={l.id}
                    onClick={() => {
                      setCurrentTab('leads');
                      setSelectedLeadId(l.id);
                    }}
                    className="p-2.5 bg-white rounded-lg border border-neutral-200 hover:border-blue-400 cursor-pointer transition-colors"
                  >
                    <p className="font-semibold text-neutral-900">{l.companyName}</p>
                    <p className="text-[11px] text-neutral-500">{l.serviceOfInterest}</p>
                    <div className="flex items-center justify-between mt-1 text-[10px]">
                      <span className="text-blue-700 font-medium">{formatCurrency(l.estimatedValue, l.currency)}</span>
                      <span className="text-neutral-400">Retorno: {formatDate(l.nextFollowUpDate)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={() => setCurrentTab('activities')}
              className="mt-3 text-blue-700 font-semibold text-left hover:underline block text-[11px]"
            >
              Ver todas as atividades &rarr;
            </button>
          </div>

          {/* Column 2: Tarefas Críticas / Atrasadas */}
          <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between font-semibold text-neutral-900 mb-2">
                <span>Tarefas e Entregas em Risco</span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] ${overdueTasksList.length > 0 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'}`}>
                  {overdueTasksList.length}
                </span>
              </div>
              <p className="text-neutral-500 text-[11px] mb-3">
                Tarefas com prazo de conclusão expirado ou próximo.
              </p>
              <div className="space-y-2">
                {overdueTasksList.length === 0 ? (
                  <div className="p-4 text-center text-neutral-500 bg-white rounded-lg border border-neutral-200">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                    <p className="text-[11px]">Nenhuma entrega atrasada no momento!</p>
                  </div>
                ) : (
                  overdueTasksList.slice(0, 3).map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        setCurrentTab('projects');
                        setSelectedProjectId(item.projectId);
                      }}
                      className="p-2.5 bg-white rounded-lg border border-rose-200 hover:border-rose-400 cursor-pointer transition-colors"
                    >
                      <p className="font-semibold text-neutral-900 truncate">{item.taskTitle}</p>
                      <p className="text-[11px] text-neutral-500 truncate">{item.projectName}</p>
                      <span className="text-[10px] text-rose-600 font-bold block mt-1">
                        Prazo era: {formatDate(item.dueDate)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
            <button
              onClick={() => setCurrentTab('projects')}
              className="mt-3 text-blue-700 font-semibold text-left hover:underline block text-[11px]"
            >
              Gerenciar projetos &rarr;
            </button>
          </div>

          {/* Column 3: Cobranças & Pagamentos Pendentes */}
          <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between font-semibold text-neutral-900 mb-2">
                <span>Recebimentos & Cobranças</span>
                <span className="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded text-[10px]">
                  {pendingPayments.length}
                </span>
              </div>
              <p className="text-neutral-500 text-[11px] mb-3">
                Contas a receber aguardando confirmação ou vencendo.
              </p>
              <div className="space-y-2">
                {pendingPayments.slice(0, 3).map((tx) => (
                  <div
                    key={tx.id}
                    onClick={() => setCurrentTab('finance_receivables')}
                    className="p-2.5 bg-white rounded-lg border border-neutral-200 hover:border-emerald-400 cursor-pointer transition-colors"
                  >
                    <p className="font-semibold text-neutral-900 truncate">{tx.title}</p>
                    <div className="flex items-center justify-between mt-1 text-[11px]">
                      <span className="font-bold text-emerald-700">{formatCurrency(tx.amount, tx.currency)}</span>
                      <span className="text-neutral-500">Vence: {formatDate(tx.dueDate)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={() => setCurrentTab('finance_receivables')}
              className="mt-3 text-blue-700 font-semibold text-left hover:underline block text-[11px]"
            >
              Ver contas a receber &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
