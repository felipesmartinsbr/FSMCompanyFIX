'use client';

import React, { useState } from 'react';
import { useApp, NavigationTab, PeriodFilter } from '@/context/AppContext';
import { Currency } from '@/types';
import {
  Search,
  Plus,
  Filter,
  DollarSign,
  Calendar,
  Layers,
  ChevronDown,
  Target,
  Building2,
  FolderKanban,
  ArrowDownLeft,
  PackageCheck,
  Menu,
} from 'lucide-react';

interface NavbarProps {
  onOpenNewLeadModal: () => void;
  onOpenNewClientModal: () => void;
  onOpenNewProjectModal: () => void;
  onOpenNewTransactionModal: () => void;
  onOpenNewProductModal: () => void;
}

export function Navbar({
  onOpenNewLeadModal,
  onOpenNewClientModal,
  onOpenNewProjectModal,
  onOpenNewTransactionModal,
  onOpenNewProductModal,
}: NavbarProps) {
  const {
    currentTab,
    setCurrentTab,
    setIsCommandPaletteOpen,
    currencyFilter,
    setCurrencyFilter,
    periodFilter,
    setPeriodFilter,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
  } = useApp();

  const [isNewMenuOpen, setIsNewMenuOpen] = useState(false);

  // Tab Titles and Descriptions
  const getTabInfo = (tab: NavigationTab) => {
    switch (tab) {
      case 'dashboard':
        return {
          title: 'Central de Comando',
          description: 'Visão executiva integrada de vendas, clientes, projetos e fluxo de caixa.',
        };
      case 'leads':
        return {
          title: 'Gestão de Leads',
          description: 'Prospecção ativa no Google Maps, redes e outbound comercial.',
        };
      case 'pipeline':
        return {
          title: 'Pipeline de Vendas',
          description: 'Funil Kanban visual com acompanhamento de oportunidades e negociações.',
        };
      case 'activities':
        return {
          title: 'Atividades & Follow-ups',
          description: 'Ligações, mensagens de WhatsApp, reuniões e histórico de interações.',
        };
      case 'clients':
        return {
          title: 'Carteira de Clientes',
          description: 'Gestão de relacionamento, contratos ativos, saúde da conta e renovações.',
        };
      case 'projects':
        return {
          title: 'Projetos & Entregas',
          description: 'Acompanhamento de fases, tarefas, checklists e prazos de cada cliente.',
        };
      case 'finance_overview':
        return {
          title: 'Visão Geral Financeira',
          description: 'Balanço da empresa, receitas, despesas e saúde financeira operacional.',
        };
      case 'finance_receivables':
        return {
          title: 'Contas a Receber',
          description: 'Faturamento, pagamentos pendentes, cobranças e previsões de entrada.',
        };
      case 'finance_payables':
        return {
          title: 'Contas a Pagar',
          description: 'Obrigações, custos de ferramentas, servidores e prestadores de serviço.',
        };
      case 'finance_cashflow':
        return {
          title: 'Fluxo de Caixa',
          description: 'Entradas e saídas diárias, semanais e projeção de liquidez.',
        };
      case 'finance_expenses':
        return {
          title: 'Controle de Despesas',
          description: 'Detalhamento por categoria de custos operacionais e fornecedores.',
        };
      case 'finance_hr':
        return {
          title: 'RH e Equipe',
          description: 'Estrutura do time interno, prestadores, papéis e custos operacionais.',
        };
      case 'products':
        return {
          title: 'Produtos & Soluções',
          description: 'Catálogo institucional de serviços, componentes técnicos e precificação.',
        };
      case 'reports':
        return {
          title: 'Relatórios & Inteligência',
          description: 'Análises aprofundadas de conversão, métricas por localização e produto.',
        };
      case 'settings':
        return {
          title: 'Configurações do Sistema',
          description: 'Parâmetros da FSM Company, moeda de referência, backup e restauração.',
        };
      default:
        return { title: 'FSM Company', description: 'Sistema Operacional' };
    }
  };

  const info = getTabInfo(currentTab);

  return (
    <header className="h-16 border-b border-neutral-200/80 bg-white px-4 md:px-6 flex items-center justify-between gap-4 sticky top-0 z-20">
      {/* Left: Mobile Toggle & Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          id="mobile-sidebar-toggle"
          onClick={() => setIsSidebarCollapsed((prev) => !prev)}
          className="p-2 text-neutral-600 hover:text-neutral-900 md:hidden rounded-lg hover:bg-neutral-100"
          aria-label="Abrir menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex flex-col truncate">
          <h1 className="text-base md:text-lg font-bold text-neutral-900 tracking-tight truncate leading-tight">
            {info.title}
          </h1>
          <p className="text-xs text-neutral-500 hidden sm:block truncate">
            {info.description}
          </p>
        </div>
      </div>

      {/* Center/Right: Actions and Filters */}
      <div className="flex items-center gap-2.5">
        {/* Search / Command Palette Trigger */}
        <button
          id="command-palette-trigger"
          onClick={() => setIsCommandPaletteOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-neutral-500 bg-neutral-100 hover:bg-neutral-200/70 text-neutral-700 rounded-lg transition-colors border border-neutral-200/60 shadow-2xs"
          title="Buscar ou executar comando (Ctrl+K)"
        >
          <Search className="w-3.5 h-3.5 text-neutral-500" />
          <span className="hidden lg:inline">Buscar no sistema...</span>
          <kbd className="hidden sm:inline-flex text-[10px] font-mono bg-white text-neutral-500 px-1.5 py-0.5 rounded border border-neutral-200">
            Ctrl K
          </kbd>
        </button>

        {/* Currency Switcher */}
        <div className="flex items-center bg-neutral-100 p-0.5 rounded-lg border border-neutral-200/60 text-xs font-medium">
          <button
            id="currency-filter-all"
            onClick={() => setCurrencyFilter('ALL')}
            className={`px-2 py-1 rounded-md transition-colors ${
              currencyFilter === 'ALL'
                ? 'bg-white text-neutral-900 font-semibold shadow-2xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
            title="Exibir todas as moedas"
          >
            Todas
          </button>
          <button
            id="currency-filter-brl"
            onClick={() => setCurrencyFilter('BRL')}
            className={`px-2 py-1 rounded-md transition-colors ${
              currencyFilter === 'BRL'
                ? 'bg-white text-blue-900 font-bold shadow-2xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
            title="Filtrar por BRL (Brasil)"
          >
            BRL R$
          </button>
          <button
            id="currency-filter-usd"
            onClick={() => setCurrencyFilter('USD')}
            className={`px-2 py-1 rounded-md transition-colors ${
              currencyFilter === 'USD'
                ? 'bg-white text-emerald-900 font-bold shadow-2xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
            title="Filtrar por USD (Exterior)"
          >
            USD $
          </button>
        </div>

        {/* Period Selector (Relevant for Dashboard, Reports, Finance) */}
        {(currentTab === 'dashboard' || currentTab.startsWith('finance_') || currentTab === 'reports') && (
          <select
            id="period-filter-select"
            value={periodFilter}
            onChange={(e) => setPeriodFilter(e.target.value as PeriodFilter)}
            className="text-xs bg-white border border-neutral-200 text-neutral-700 rounded-lg px-2.5 py-1.5 font-medium hover:border-neutral-300 focus:outline-hidden focus:ring-1 focus:ring-blue-500 cursor-pointer hidden md:block"
          >
            <option value="today">Hoje</option>
            <option value="week">Esta Semana</option>
            <option value="month">Este Mês</option>
            <option value="quarter">Este Trimestre</option>
            <option value="all">Todo o Período</option>
          </select>
        )}

        {/* New Action Dropdown */}
        <div className="relative">
          <button
            id="quick-add-btn"
            onClick={() => setIsNewMenuOpen((prev) => !prev)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-950 hover:bg-blue-900 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Novo</span>
            <ChevronDown className="w-3 h-3 text-blue-200" />
          </button>

          {isNewMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsNewMenuOpen(false)}
              />
              <div
                id="quick-add-menu"
                className="absolute right-0 mt-1.5 w-52 bg-white rounded-xl shadow-xl border border-neutral-200/90 py-1 z-50 text-xs text-neutral-700 animate-in fade-in zoom-in-95 duration-100"
              >
                <button
                  id="action-new-lead"
                  onClick={() => {
                    setIsNewMenuOpen(false);
                    onOpenNewLeadModal();
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-blue-50 hover:text-blue-950 transition-colors text-left"
                >
                  <Target className="w-4 h-4 text-blue-600" />
                  <span className="font-medium">Novo Lead</span>
                </button>

                <button
                  id="action-new-client"
                  onClick={() => {
                    setIsNewMenuOpen(false);
                    onOpenNewClientModal();
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-blue-50 hover:text-blue-950 transition-colors text-left"
                >
                  <Building2 className="w-4 h-4 text-indigo-600" />
                  <span className="font-medium">Novo Cliente</span>
                </button>

                <button
                  id="action-new-project"
                  onClick={() => {
                    setIsNewMenuOpen(false);
                    onOpenNewProjectModal();
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-blue-50 hover:text-blue-950 transition-colors text-left"
                >
                  <FolderKanban className="w-4 h-4 text-amber-600" />
                  <span className="font-medium">Novo Projeto</span>
                </button>

                <button
                  id="action-new-transaction"
                  onClick={() => {
                    setIsNewMenuOpen(false);
                    onOpenNewTransactionModal();
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-blue-50 hover:text-blue-950 transition-colors text-left"
                >
                  <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
                  <span className="font-medium">Novo Lançamento Financeiro</span>
                </button>

                <div className="h-px bg-neutral-100 my-1" />

                <button
                  id="action-new-product"
                  onClick={() => {
                    setIsNewMenuOpen(false);
                    onOpenNewProductModal();
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-blue-50 hover:text-blue-950 transition-colors text-left"
                >
                  <PackageCheck className="w-4 h-4 text-purple-600" />
                  <span className="font-medium">Nova Solução / Produto</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
