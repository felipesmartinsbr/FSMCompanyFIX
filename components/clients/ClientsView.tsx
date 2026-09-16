'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { Client, ClientStatus, Currency } from '@/types';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { exportClientsToExcel } from '@/lib/excelExport';
import {
  Building2,
  Search,
  Plus,
  Download,
  Phone,
  Mail,
  FolderKanban,
  ExternalLink,
  Wallet,
  CheckCircle2,
  Clock,
  AlertCircle,
  Filter,
} from 'lucide-react';

interface ClientsViewProps {
  onOpenNewClient: () => void;
}

export function ClientsView({ onOpenNewClient }: ClientsViewProps) {
  const {
    clients,
    projects,
    recurringContracts,
    currencyFilter,
    selectedClientId,
    setSelectedClientId,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [billingFilter, setBillingFilter] = useState<string>('ALL');

  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
      if (currencyFilter !== 'ALL' && c.currency !== currencyFilter) return false;
      if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;
      if (billingFilter !== 'ALL' && c.billingType !== billingFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchCompany = c.companyName.toLowerCase().includes(q);
        const matchContact = c.primaryContactName.toLowerCase().includes(q);
        const matchCity = c.city.toLowerCase().includes(q);
        const matchCat = c.category.toLowerCase().includes(q);
        if (!matchCompany && !matchContact && !matchCity && !matchCat) return false;
      }
      return true;
    });
  }, [clients, currencyFilter, statusFilter, billingFilter, searchQuery]);

  const handleExportExcel = () => {
    exportClientsToExcel(filteredClients, `FSM_Clientes_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div id="clients-view" className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-neutral-900 tracking-tight">
              Gestão da Carteira de Clientes
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-900">
              {filteredClients.length} clientes
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">
            Relacionamento, contratos ativos, entregas em andamento e faturamento recorrente.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="export-clients-btn"
            onClick={handleExportExcel}
            className="px-3.5 py-1.5 bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-700 rounded-lg text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Exportar Excel</span>
          </button>
          <button
            id="open-new-client-btn"
            onClick={onOpenNewClient}
            className="px-4 py-1.5 bg-indigo-950 hover:bg-indigo-900 text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Cliente</span>
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-neutral-200/80 shadow-2xs flex flex-wrap items-center gap-3 text-xs">
        <div className="flex-1 min-w-[220px] relative">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
          <input
            id="clients-search-input"
            type="text"
            placeholder="Buscar por empresa, contato, cidade ou nicho..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-neutral-200 rounded-lg text-neutral-900 placeholder-neutral-400 focus:outline-hidden"
          />
        </div>

        <select
          id="clients-filter-status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-1.5 border border-neutral-200 rounded-lg bg-white text-neutral-700 font-medium"
        >
          <option value="ALL">Status: Todos</option>
          <option value="ativo">Ativo</option>
          <option value="onboarding">Onboarding</option>
          <option value="pausado">Pausado</option>
          <option value="churn">Churn / Encerrado</option>
        </select>

        <select
          id="clients-filter-billing"
          value={billingFilter}
          onChange={(e) => setBillingFilter(e.target.value)}
          className="px-3 py-1.5 border border-neutral-200 rounded-lg bg-white text-neutral-700 font-medium"
        >
          <option value="ALL">Faturamento: Todos</option>
          <option value="fixo">Fixo</option>
          <option value="recorrente">Recorrente (MRR)</option>
          <option value="hibrido">Híbrido</option>
        </select>
      </div>

      {/* Clients Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClients.map((client) => {
          const clientProjs = projects.filter((p) => p.clientId === client.id);
          const activeProj = clientProjs.find((p) => p.status === 'em_andamento');

          return (
            <div
              key={client.id}
              onClick={() => setSelectedClientId(client.id)}
              className="bg-white rounded-2xl p-5 border border-neutral-200/80 hover:border-indigo-400 shadow-2xs hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between space-y-4"
            >
              {/* Header */}
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-sm text-neutral-900 leading-snug">
                      {client.companyName}
                    </h3>
                    <p className="text-[11px] text-neutral-500 mt-0.5">
                      {client.category} • {client.city}, {client.country}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                      client.status === 'ativo'
                        ? 'bg-emerald-100 text-emerald-800'
                        : client.status === 'onboarding'
                        ? 'bg-blue-100 text-blue-800'
                        : client.status === 'pausado'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {client.status}
                  </span>
                </div>

                {/* Primary contact */}
                <div className="mt-3 pt-3 border-t border-neutral-100 space-y-1 text-xs">
                  <p className="font-semibold text-neutral-800">{client.primaryContactName}</p>
                  <p className="text-[11px] text-neutral-500">{client.primaryContactPhone || client.primaryContactEmail}</p>
                </div>

                {/* Subscribed Services */}
                <div className="mt-2.5 flex flex-wrap gap-1">
                  {client.servicesSubscribed.slice(0, 2).map((srv, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-md font-medium truncate max-w-[200px]"
                    >
                      {srv}
                    </span>
                  ))}
                  {client.servicesSubscribed.length > 2 && (
                    <span className="text-[10px] text-neutral-400 self-center">
                      +{client.servicesSubscribed.length - 2}
                    </span>
                  )}
                </div>
              </div>

              {/* Active Project or Financial details */}
              <div className="pt-3 border-t border-neutral-100 space-y-2 text-xs">
                {activeProj && (
                  <div className="bg-neutral-50 p-2.5 rounded-xl border border-neutral-200/70">
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-semibold text-neutral-800 truncate">{activeProj.name}</span>
                      <span className="text-blue-700 font-bold">{activeProj.progressPercentage}%</span>
                    </div>
                    <div className="w-full bg-neutral-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-blue-600 h-1.5 rounded-full"
                        style={{ width: `${activeProj.progressPercentage}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs pt-1">
                  <div>
                    <span className="text-[10px] text-neutral-400 block">Total Contratado</span>
                    <span className="font-bold text-neutral-900">
                      {formatCurrency(client.contractedValue, client.currency)}
                    </span>
                  </div>

                  {((client.recurringAmount ?? client.recurringValue ?? client.monthlyRecurringValue ?? 0) > 0) && (
                    <div className="text-right">
                      <span className="text-[10px] text-neutral-400 block">Recorrência</span>
                      <span className="font-bold text-emerald-700">
                        {formatCurrency(client.recurringAmount ?? client.recurringValue ?? client.monthlyRecurringValue ?? 0, client.currency)}/mês
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filteredClients.length === 0 && (
          <div className="col-span-full py-16 text-center text-neutral-400 bg-white rounded-2xl border border-dashed border-neutral-200">
            Nenhum cliente cadastrado ou encontrado com os filtros selecionados.
          </div>
        )}
      </div>
    </div>
  );
}
