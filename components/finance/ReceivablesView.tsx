'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { Transaction } from '@/types';
import { formatCurrency, formatDate, isDateOverdue } from '@/lib/formatters';
import { exportFinancialToExcel } from '@/lib/excelExport';
import {
  ArrowDownLeft,
  Search,
  Plus,
  Download,
  CheckCircle2,
  Clock,
  AlertCircle,
  Building2,
  Filter,
} from 'lucide-react';

interface ReceivablesViewProps {
  onOpenNewTransaction: () => void;
}

export function ReceivablesView({ onOpenNewTransaction }: ReceivablesViewProps) {
  const {
    transactions,
    markTransactionAsPaid,
    currencyFilter,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Only receitas
  const receivables = useMemo(() => {
    return transactions.filter((t) => t.type === 'receita');
  }, [transactions]);

  const filteredReceivables = useMemo(() => {
    return receivables.filter((t) => {
      if (currencyFilter !== 'ALL' && t.currency !== currencyFilter) return false;
      if (statusFilter !== 'ALL' && t.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = t.title.toLowerCase().includes(q);
        const matchClient = t.clientName?.toLowerCase().includes(q);
        const matchCat = t.category.toLowerCase().includes(q);
        if (!matchTitle && !matchClient && !matchCat) return false;
      }
      return true;
    });
  }, [receivables, currencyFilter, statusFilter, searchQuery]);

  // Totals
  const totalReceivedBRL = filteredReceivables
    .filter((t) => t.status === 'pago' && t.currency === 'BRL')
    .reduce((s, t) => s + t.amount, 0);

  const totalReceivedUSD = filteredReceivables
    .filter((t) => t.status === 'pago' && t.currency === 'USD')
    .reduce((s, t) => s + t.amount, 0);

  const totalPendingBRL = filteredReceivables
    .filter((t) => (t.status === 'pendente' || t.status === 'vencido') && t.currency === 'BRL')
    .reduce((s, t) => s + t.amount, 0);

  const totalPendingUSD = filteredReceivables
    .filter((t) => (t.status === 'pendente' || t.status === 'vencido') && t.currency === 'USD')
    .reduce((s, t) => s + t.amount, 0);

  const handleExportExcel = () => {
    exportFinancialToExcel(
      filteredReceivables,
      `FSM_Contas_Receber_${new Date().toISOString().split('T')[0]}.xlsx`
    );
  };

  return (
    <div id="receivables-view" className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-neutral-900 tracking-tight">
              Contas a Receber
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900">
              {filteredReceivables.length} títulos
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">
            Acompanhamento de faturas emitidas, parcelas e liquidações financeiras da empresa.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="px-3.5 py-1.5 bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-700 rounded-lg text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Exportar Excel</span>
          </button>
          <button
            onClick={onOpenNewTransaction}
            className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Receita</span>
          </button>
        </div>
      </div>

      {/* KPI Cards: BRL & USD rigorously separated */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-neutral-200/80 shadow-2xs">
          <span className="text-[11px] text-neutral-500 font-medium block">Total Recebido (BRL)</span>
          <p className="text-lg md:text-xl font-bold text-emerald-700 mt-1">
            {formatCurrency(totalReceivedBRL, 'BRL')}
          </p>
          <span className="text-[10px] text-neutral-400 mt-0.5 block">Liquidado em conta</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200/80 shadow-2xs">
          <span className="text-[11px] text-neutral-500 font-medium block">A Receber / Pendente (BRL)</span>
          <p className="text-lg md:text-xl font-bold text-blue-900 mt-1">
            {formatCurrency(totalPendingBRL, 'BRL')}
          </p>
          <span className="text-[10px] text-neutral-400 mt-0.5 block">Previsão em Real</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200/80 shadow-2xs">
          <span className="text-[11px] text-neutral-500 font-medium block">Total Recebido (USD)</span>
          <p className="text-lg md:text-xl font-bold text-emerald-700 mt-1">
            {formatCurrency(totalReceivedUSD, 'USD')}
          </p>
          <span className="text-[10px] text-neutral-400 mt-0.5 block">Liquidado exterior</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200/80 shadow-2xs">
          <span className="text-[11px] text-neutral-500 font-medium block">A Receber / Pendente (USD)</span>
          <p className="text-lg md:text-xl font-bold text-blue-900 mt-1">
            {formatCurrency(totalPendingUSD, 'USD')}
          </p>
          <span className="text-[10px] text-neutral-400 mt-0.5 block">Previsão em Dólar</span>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-neutral-200/80 shadow-2xs flex flex-wrap items-center gap-3 text-xs">
        <div className="flex-1 min-w-[220px] relative">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar por descrição, cliente ou categoria..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-neutral-200 rounded-lg text-neutral-900 placeholder-neutral-400 focus:outline-hidden"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-1.5 border border-neutral-200 rounded-lg bg-white text-neutral-700 font-medium"
        >
          <option value="ALL">Status: Todos</option>
          <option value="pendente">Pendente</option>
          <option value="pago">Pago</option>
          <option value="vencido">Vencido</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 font-semibold uppercase text-[11px] tracking-wider">
              <tr>
                <th className="p-3.5">Título / Descrição</th>
                <th className="p-3.5">Cliente Vinculado</th>
                <th className="p-3.5">Valor & Moeda</th>
                <th className="p-3.5">Vencimento</th>
                <th className="p-3.5">Forma</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredReceivables.map((tx) => {
                const isOverdue = isDateOverdue(tx.dueDate) && tx.status !== 'pago';

                return (
                  <tr key={tx.id} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="p-3.5">
                      <span className="font-bold text-neutral-900 block">{tx.title}</span>
                      <span className="text-[11px] text-neutral-500">{tx.category}</span>
                    </td>

                    <td className="p-3.5 font-medium text-neutral-800">
                      {tx.clientName || '-'}
                    </td>

                    <td className="p-3.5 font-bold text-neutral-900">
                      {formatCurrency(tx.amount, tx.currency)}
                    </td>

                    <td className="p-3.5">
                      <span className={`font-medium ${isOverdue ? 'text-rose-600 font-bold' : 'text-neutral-700'}`}>
                        {formatDate(tx.dueDate)} {isOverdue && '(Vencido)'}
                      </span>
                    </td>

                    <td className="p-3.5 text-neutral-600">
                      {tx.paymentMethod}
                    </td>

                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize ${
                          tx.status === 'pago'
                            ? 'bg-emerald-100 text-emerald-800'
                            : isOverdue
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {tx.status === 'pago' ? 'Pago' : isOverdue ? 'Vencido' : 'Pendente'}
                      </span>
                    </td>

                    <td className="p-3.5 text-right">
                      {tx.status !== 'pago' ? (
                        <button
                          onClick={() => markTransactionAsPaid(tx.id)}
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded font-semibold text-xs transition-colors"
                        >
                          Marcar Pago
                        </button>
                      ) : (
                        <span className="text-[11px] text-neutral-400 font-medium flex items-center justify-end gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Pago em {formatDate(tx.paymentDate)}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}

              {filteredReceivables.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-400">
                    Nenhum título a receber encontrado com os filtros selecionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
