'use client';

import React, { useState } from 'react';
import { useApp, NavigationTab } from '@/context/AppContext';
import {
  LayoutDashboard,
  Target,
  KanbanSquare,
  CalendarCheck,
  Building2,
  FolderKanban,
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  LineChart,
  Receipt,
  Users,
  PackageCheck,
  FileBarChart,
  Settings,
  ChevronDown,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

export function Sidebar() {
  const {
    currentTab,
    setCurrentTab,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    leads,
    projects,
    transactions,
    settings,
  } = useApp();

  // Collapsible submenus
  const [isCommercialOpen, setIsCommercialOpen] = useState(true);
  const [isFinanceOpen, setIsFinanceOpen] = useState(true);

  // Overdue and open counts
  const openLeadsCount = leads.filter((l) => l.status === 'aberto').length;
  const activeProjectsCount = projects.filter((p) => p.status === 'em_andamento' || p.status === 'onboarding').length;
  const pendingReceivablesCount = transactions.filter((t) => t.type === 'receita' && (t.status === 'pendente' || t.status === 'vencido')).length;

  const handleNav = (tab: NavigationTab) => {
    setCurrentTab(tab);
  };

  const isCommercialActive = currentTab === 'leads' || currentTab === 'pipeline' || currentTab === 'activities';
  const isFinanceActive = currentTab.startsWith('finance_');

  return (
    <aside
      id="main-sidebar"
      className={`relative flex flex-col border-r border-neutral-200/80 bg-white transition-all duration-300 z-30 select-none ${
        isSidebarCollapsed ? 'w-18' : 'w-64'
      }`}
    >
      {/* Header / Brand */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-neutral-100">
        {!isSidebarCollapsed ? (
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-blue-950 text-white flex items-center justify-center font-black tracking-tight text-sm shadow-sm flex-shrink-0">
              {settings.logoText || 'FSM'}
            </div>
            <div className="flex flex-col truncate">
              <span className="font-bold text-neutral-900 text-sm tracking-tight truncate leading-tight">
                {settings.companyName}
              </span>
              <span className="text-[11px] text-neutral-500 font-medium tracking-wide">
                Sistema Operacional
              </span>
            </div>
          </div>
        ) : (
          <div className="w-full flex justify-center">
            <div className="w-8 h-8 rounded-lg bg-blue-950 text-white flex items-center justify-center font-black text-sm shadow-sm">
              {settings.logoText || 'FSM'}
            </div>
          </div>
        )}

        {!isSidebarCollapsed && (
          <button
            id="sidebar-collapse-btn"
            onClick={() => setIsSidebarCollapsed(true)}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-md transition-colors"
            title="Recolher menu lateral"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto py-3 px-3 space-y-1 text-sm font-medium scrollbar-thin">
        {/* Dashboard */}
        <button
          id="nav-dashboard"
          onClick={() => handleNav('dashboard')}
          className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-lg transition-colors text-left ${
            currentTab === 'dashboard'
              ? 'bg-blue-50 text-blue-900 font-semibold shadow-xs'
              : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
          }`}
          title="Dashboard"
        >
          <LayoutDashboard className={`w-4 h-4 flex-shrink-0 ${currentTab === 'dashboard' ? 'text-blue-700' : 'text-neutral-400'}`} />
          {!isSidebarCollapsed && <span>Dashboard</span>}
        </button>

        {/* COMERCIAL GROUP */}
        <div>
          {!isSidebarCollapsed ? (
            <button
              id="group-commercial-toggle"
              onClick={() => setIsCommercialOpen((prev) => !prev)}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 mt-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
                isCommercialActive ? 'text-blue-950' : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              <span>Comercial</span>
              {isCommercialOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          ) : (
            <div className="h-px bg-neutral-100 my-2" />
          )}

          {(!isSidebarCollapsed && isCommercialOpen) || isSidebarCollapsed ? (
            <div className="space-y-0.5 mt-0.5">
              <button
                id="nav-leads"
                onClick={() => handleNav('leads')}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg transition-colors text-left ${
                  currentTab === 'leads'
                    ? 'bg-blue-50 text-blue-900 font-semibold'
                    : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                }`}
                title="Leads"
              >
                <div className="flex items-center gap-3 truncate">
                  <Target className={`w-4 h-4 flex-shrink-0 ${currentTab === 'leads' ? 'text-blue-700' : 'text-neutral-400'}`} />
                  {!isSidebarCollapsed && <span>Leads</span>}
                </div>
                {!isSidebarCollapsed && openLeadsCount > 0 && (
                  <span className="text-[11px] font-semibold bg-neutral-100 text-neutral-600 px-1.5 py-0.5 rounded-full">
                    {openLeadsCount}
                  </span>
                )}
              </button>

              <button
                id="nav-pipeline"
                onClick={() => handleNav('pipeline')}
                className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-lg transition-colors text-left ${
                  currentTab === 'pipeline'
                    ? 'bg-blue-50 text-blue-900 font-semibold'
                    : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                }`}
                title="Pipeline de Vendas"
              >
                <KanbanSquare className={`w-4 h-4 flex-shrink-0 ${currentTab === 'pipeline' ? 'text-blue-700' : 'text-neutral-400'}`} />
                {!isSidebarCollapsed && <span>Pipeline Kanban</span>}
              </button>

              <button
                id="nav-activities"
                onClick={() => handleNav('activities')}
                className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-lg transition-colors text-left ${
                  currentTab === 'activities'
                    ? 'bg-blue-50 text-blue-900 font-semibold'
                    : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                }`}
                title="Atividades e Follow-ups"
              >
                <CalendarCheck className={`w-4 h-4 flex-shrink-0 ${currentTab === 'activities' ? 'text-blue-700' : 'text-neutral-400'}`} />
                {!isSidebarCollapsed && <span>Atividades</span>}
              </button>
            </div>
          ) : null}
        </div>

        {/* Clientes */}
        <button
          id="nav-clients"
          onClick={() => handleNav('clients')}
          className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg transition-colors text-left ${
            currentTab === 'clients'
              ? 'bg-blue-50 text-blue-900 font-semibold'
              : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
          }`}
          title="Clientes"
        >
          <div className="flex items-center gap-3 truncate">
            <Building2 className={`w-4 h-4 flex-shrink-0 ${currentTab === 'clients' ? 'text-blue-700' : 'text-neutral-400'}`} />
            {!isSidebarCollapsed && <span>Clientes</span>}
          </div>
        </button>

        {/* Projetos */}
        <button
          id="nav-projects"
          onClick={() => handleNav('projects')}
          className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg transition-colors text-left ${
            currentTab === 'projects'
              ? 'bg-blue-50 text-blue-900 font-semibold'
              : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
          }`}
          title="Projetos e Entregas"
        >
          <div className="flex items-center gap-3 truncate">
            <FolderKanban className={`w-4 h-4 flex-shrink-0 ${currentTab === 'projects' ? 'text-blue-700' : 'text-neutral-400'}`} />
            {!isSidebarCollapsed && <span>Projetos</span>}
          </div>
          {!isSidebarCollapsed && activeProjectsCount > 0 && (
            <span className="text-[11px] font-semibold bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-full">
              {activeProjectsCount}
            </span>
          )}
        </button>

        {/* FINANCEIRO GROUP */}
        <div>
          {!isSidebarCollapsed ? (
            <button
              id="group-finance-toggle"
              onClick={() => setIsFinanceOpen((prev) => !prev)}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 mt-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
                isFinanceActive ? 'text-blue-950' : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              <span>Financeiro</span>
              {isFinanceOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          ) : (
            <div className="h-px bg-neutral-100 my-2" />
          )}

          {(!isSidebarCollapsed && isFinanceOpen) || isSidebarCollapsed ? (
            <div className="space-y-0.5 mt-0.5">
              <button
                id="nav-finance-overview"
                onClick={() => handleNav('finance_overview')}
                className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-lg transition-colors text-left ${
                  currentTab === 'finance_overview'
                    ? 'bg-blue-50 text-blue-900 font-semibold'
                    : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                }`}
                title="Visão Geral Financeira"
              >
                <Wallet className={`w-4 h-4 flex-shrink-0 ${currentTab === 'finance_overview' ? 'text-blue-700' : 'text-neutral-400'}`} />
                {!isSidebarCollapsed && <span>Visão Geral</span>}
              </button>

              <button
                id="nav-finance-receivables"
                onClick={() => handleNav('finance_receivables')}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg transition-colors text-left ${
                  currentTab === 'finance_receivables'
                    ? 'bg-blue-50 text-blue-900 font-semibold'
                    : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                }`}
                title="Contas a Receber"
              >
                <div className="flex items-center gap-3 truncate">
                  <ArrowDownLeft className={`w-4 h-4 flex-shrink-0 ${currentTab === 'finance_receivables' ? 'text-emerald-600' : 'text-neutral-400'}`} />
                  {!isSidebarCollapsed && <span>Contas a Receber</span>}
                </div>
                {!isSidebarCollapsed && pendingReceivablesCount > 0 && (
                  <span className="text-[11px] font-semibold bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded-full">
                    {pendingReceivablesCount}
                  </span>
                )}
              </button>

              <button
                id="nav-finance-payables"
                onClick={() => handleNav('finance_payables')}
                className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-lg transition-colors text-left ${
                  currentTab === 'finance_payables'
                    ? 'bg-blue-50 text-blue-900 font-semibold'
                    : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                }`}
                title="Contas a Pagar"
              >
                <ArrowUpRight className={`w-4 h-4 flex-shrink-0 ${currentTab === 'finance_payables' ? 'text-rose-600' : 'text-neutral-400'}`} />
                {!isSidebarCollapsed && <span>Contas a Pagar</span>}
              </button>

              <button
                id="nav-finance-cashflow"
                onClick={() => handleNav('finance_cashflow')}
                className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-lg transition-colors text-left ${
                  currentTab === 'finance_cashflow'
                    ? 'bg-blue-50 text-blue-900 font-semibold'
                    : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                }`}
                title="Fluxo de Caixa"
              >
                <LineChart className={`w-4 h-4 flex-shrink-0 ${currentTab === 'finance_cashflow' ? 'text-blue-700' : 'text-neutral-400'}`} />
                {!isSidebarCollapsed && <span>Fluxo de Caixa</span>}
              </button>

              <button
                id="nav-finance-expenses"
                onClick={() => handleNav('finance_expenses')}
                className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-lg transition-colors text-left ${
                  currentTab === 'finance_expenses'
                    ? 'bg-blue-50 text-blue-900 font-semibold'
                    : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                }`}
                title="Despesas"
              >
                <Receipt className={`w-4 h-4 flex-shrink-0 ${currentTab === 'finance_expenses' ? 'text-blue-700' : 'text-neutral-400'}`} />
                {!isSidebarCollapsed && <span>Despesas</span>}
              </button>

              <button
                id="nav-finance-hr"
                onClick={() => handleNav('finance_hr')}
                className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-lg transition-colors text-left ${
                  currentTab === 'finance_hr'
                    ? 'bg-blue-50 text-blue-900 font-semibold'
                    : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                }`}
                title="RH e Equipe"
              >
                <Users className={`w-4 h-4 flex-shrink-0 ${currentTab === 'finance_hr' ? 'text-blue-700' : 'text-neutral-400'}`} />
                {!isSidebarCollapsed && <span>RH e Equipe</span>}
              </button>
            </div>
          ) : null}
        </div>

        {/* Produtos e Soluções */}
        <button
          id="nav-products"
          onClick={() => handleNav('products')}
          className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-lg transition-colors text-left ${
            currentTab === 'products'
              ? 'bg-blue-50 text-blue-900 font-semibold'
              : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
          }`}
          title="Produtos e Soluções"
        >
          <PackageCheck className={`w-4 h-4 flex-shrink-0 ${currentTab === 'products' ? 'text-blue-700' : 'text-neutral-400'}`} />
          {!isSidebarCollapsed && <span>Produtos & Soluções</span>}
        </button>

        {/* Relatórios */}
        <button
          id="nav-reports"
          onClick={() => handleNav('reports')}
          className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-lg transition-colors text-left ${
            currentTab === 'reports'
              ? 'bg-blue-50 text-blue-900 font-semibold'
              : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
          }`}
          title="Relatórios e Análises"
        >
          <FileBarChart className={`w-4 h-4 flex-shrink-0 ${currentTab === 'reports' ? 'text-blue-700' : 'text-neutral-400'}`} />
          {!isSidebarCollapsed && <span>Relatórios</span>}
        </button>

        {/* Configurações */}
        <button
          id="nav-settings"
          onClick={() => handleNav('settings')}
          className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-lg transition-colors text-left ${
            currentTab === 'settings'
              ? 'bg-blue-50 text-blue-900 font-semibold'
              : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
          }`}
          title="Configurações do Sistema"
        >
          <Settings className={`w-4 h-4 flex-shrink-0 ${currentTab === 'settings' ? 'text-blue-700' : 'text-neutral-400'}`} />
          {!isSidebarCollapsed && <span>Configurações</span>}
        </button>
      </div>

      {/* Footer / User & Expand button */}
      <div className="p-3 border-t border-neutral-100 bg-neutral-50/50">
        {isSidebarCollapsed ? (
          <button
            id="sidebar-expand-btn"
            onClick={() => setIsSidebarCollapsed(false)}
            className="w-full py-2 flex items-center justify-center text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
            title="Expandir menu lateral"
          >
            <PanelLeftOpen className="w-5 h-5" />
          </button>
        ) : (
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-900 flex items-center justify-center font-bold text-xs flex-shrink-0">
                FM
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-neutral-900 truncate leading-tight">
                  {settings.ownerName}
                </p>
                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Operação Ativa
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
