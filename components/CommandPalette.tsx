'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Search,
  X,
  Target,
  Building2,
  FolderKanban,
  PackageCheck,
  ArrowDownLeft,
  Plus,
  ArrowRight,
} from 'lucide-react';

interface CommandPaletteProps {
  onOpenNewLead: () => void;
  onOpenNewClient: () => void;
  onOpenNewProject: () => void;
  onOpenNewTransaction: () => void;
  onOpenNewProduct: () => void;
}

export function CommandPalette({
  onOpenNewLead,
  onOpenNewClient,
  onOpenNewProject,
  onOpenNewTransaction,
  onOpenNewProduct,
}: CommandPaletteProps) {
  const {
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    leads,
    clients,
    projects,
    products,
    transactions,
    setCurrentTab,
    setSelectedLeadId,
    setSelectedClientId,
    setSelectedProjectId,
  } = useApp();

  const [query, setQuery] = useState('');

  const handleClose = () => {
    setQuery('');
    setIsCommandPaletteOpen(false);
  };

  // Filter entities based on query
  const filteredResults = useMemo(() => {
    if (!query.trim()) return null;
    const q = query.toLowerCase();

    const matchedLeads = leads
      .filter((l) => l.companyName.toLowerCase().includes(q) || l.category.toLowerCase().includes(q) || l.city.toLowerCase().includes(q))
      .slice(0, 4);

    const matchedClients = clients
      .filter((c) => c.companyName.toLowerCase().includes(q) || c.primaryContactName.toLowerCase().includes(q) || c.city.toLowerCase().includes(q))
      .slice(0, 4);

    const matchedProjects = projects
      .filter((p) => p.name.toLowerCase().includes(q) || p.clientName.toLowerCase().includes(q))
      .slice(0, 4);

    const matchedProducts = products
      .filter((p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q))
      .slice(0, 3);

    const matchedTransactions = transactions
      .filter((t) => t.title.toLowerCase().includes(q) || (t.clientName && t.clientName.toLowerCase().includes(q)))
      .slice(0, 3);

    return {
      leads: matchedLeads,
      clients: matchedClients,
      projects: matchedProjects,
      products: matchedProducts,
      transactions: matchedTransactions,
    };
  }, [query, leads, clients, projects, products, transactions]);

  if (!isCommandPaletteOpen) return null;

  return (
    <div
      id="command-palette-backdrop"
      className="fixed inset-0 z-50 bg-neutral-950/40 backdrop-blur-xs flex items-start justify-center pt-20 px-4 animate-in fade-in duration-150"
      onClick={() => setIsCommandPaletteOpen(false)}
    >
      <div
        id="command-palette-modal"
        className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden text-neutral-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-neutral-100">
          <Search className="w-5 h-5 text-neutral-400" />
          <input
            id="command-palette-input"
            autoFocus
            type="text"
            placeholder="Buscar lead, cliente, projeto, produto ou ação rápida..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 text-sm bg-transparent border-none outline-hidden text-neutral-900 placeholder-neutral-400"
          />
          <button
            id="command-palette-close"
            onClick={() => setIsCommandPaletteOpen(false)}
            className="p-1 text-neutral-400 hover:text-neutral-600 rounded-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results / Navigation Body */}
        <div className="max-h-96 overflow-y-auto p-2 text-xs divide-y divide-neutral-100">
          {/* Default Quick Actions when query is empty */}
          {!query.trim() && (
            <div className="py-2">
              <p className="px-3 py-1 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                Ações Rápidas da Operação
              </p>
              <div className="mt-1 space-y-0.5">
                <button
                  id="cp-action-lead"
                  onClick={() => {
                    setIsCommandPaletteOpen(false);
                    onOpenNewLead();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-neutral-100 text-left transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Target className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-neutral-800">Cadastrar Novo Lead</span>
                  </div>
                  <span className="text-[10px] text-neutral-400">Novo</span>
                </button>

                <button
                  id="cp-action-client"
                  onClick={() => {
                    setIsCommandPaletteOpen(false);
                    onOpenNewClient();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-neutral-100 text-left transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Building2 className="w-4 h-4 text-indigo-600" />
                    <span className="font-medium text-neutral-800">Cadastrar Novo Cliente</span>
                  </div>
                  <span className="text-[10px] text-neutral-400">Novo</span>
                </button>

                <button
                  id="cp-action-project"
                  onClick={() => {
                    setIsCommandPaletteOpen(false);
                    onOpenNewProject();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-neutral-100 text-left transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <FolderKanban className="w-4 h-4 text-amber-600" />
                    <span className="font-medium text-neutral-800">Criar Novo Projeto</span>
                  </div>
                  <span className="text-[10px] text-neutral-400">Novo</span>
                </button>

                <button
                  id="cp-action-tx"
                  onClick={() => {
                    setIsCommandPaletteOpen(false);
                    onOpenNewTransaction();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-neutral-100 text-left transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
                    <span className="font-medium text-neutral-800">Registrar Receita ou Despesa</span>
                  </div>
                  <span className="text-[10px] text-neutral-400">Finanças</span>
                </button>

                <button
                  id="cp-action-prod"
                  onClick={() => {
                    setIsCommandPaletteOpen(false);
                    onOpenNewProduct();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-neutral-100 text-left transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <PackageCheck className="w-4 h-4 text-purple-600" />
                    <span className="font-medium text-neutral-800">Adicionar Nova Solução / Produto</span>
                  </div>
                  <span className="text-[10px] text-neutral-400">Catálogo</span>
                </button>
              </div>
            </div>
          )}

          {/* Searched Results */}
          {filteredResults && (
            <div className="space-y-3 py-1">
              {/* Leads */}
              {filteredResults.leads.length > 0 && (
                <div>
                  <p className="px-3 py-1 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                    Leads Encontrados ({filteredResults.leads.length})
                  </p>
                  {filteredResults.leads.map((l) => (
                    <button
                      key={l.id}
                      onClick={() => {
                        setIsCommandPaletteOpen(false);
                        setCurrentTab('leads');
                        setSelectedLeadId(l.id);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-blue-50 text-left transition-colors"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Target className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        <div className="truncate">
                          <p className="font-medium text-neutral-900 truncate">{l.companyName}</p>
                          <p className="text-[11px] text-neutral-500 truncate">{l.category} • {l.city}, {l.country}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-medium bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded">
                        {l.currency} {l.estimatedValue.toLocaleString()}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Clients */}
              {filteredResults.clients.length > 0 && (
                <div>
                  <p className="px-3 py-1 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                    Clientes ({filteredResults.clients.length})
                  </p>
                  {filteredResults.clients.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        setIsCommandPaletteOpen(false);
                        setCurrentTab('clients');
                        setSelectedClientId(c.id);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-blue-50 text-left transition-colors"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Building2 className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                        <div className="truncate">
                          <p className="font-medium text-neutral-900 truncate">{c.companyName}</p>
                          <p className="text-[11px] text-neutral-500 truncate">{c.primaryContactName} • {c.servicesSubscribed.join(', ')}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-medium bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded">
                        {c.status}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Projects */}
              {filteredResults.projects.length > 0 && (
                <div>
                  <p className="px-3 py-1 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                    Projetos ({filteredResults.projects.length})
                  </p>
                  {filteredResults.projects.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setIsCommandPaletteOpen(false);
                        setCurrentTab('projects');
                        setSelectedProjectId(p.id);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-blue-50 text-left transition-colors"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <FolderKanban className="w-4 h-4 text-amber-600 flex-shrink-0" />
                        <div className="truncate">
                          <p className="font-medium text-neutral-900 truncate">{p.name}</p>
                          <p className="text-[11px] text-neutral-500 truncate">{p.clientName} • Progresso {p.progressPercentage}%</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-medium bg-blue-50 text-blue-800 px-2 py-0.5 rounded">
                        {p.status}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* No results */}
              {filteredResults.leads.length === 0 &&
                filteredResults.clients.length === 0 &&
                filteredResults.projects.length === 0 &&
                filteredResults.products.length === 0 &&
                filteredResults.transactions.length === 0 && (
                  <div className="py-8 text-center text-neutral-400">
                    <p className="text-sm font-medium">Nenhum registro encontrado para &quot;{query}&quot;</p>
                    <p className="text-xs mt-1">Verifique a ortografia ou experimente outro termo.</p>
                  </div>
                )}
            </div>
          )}
        </div>

        {/* Command Palette Footer */}
        <div className="px-4 py-2 bg-neutral-50 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-400">
          <span>Pressione <kbd className="px-1 py-0.5 bg-white border border-neutral-200 rounded font-mono">ESC</kbd> para fechar</span>
          <span>FSM Company — Sistema Operacional</span>
        </div>
      </div>
    </div>
  );
}
