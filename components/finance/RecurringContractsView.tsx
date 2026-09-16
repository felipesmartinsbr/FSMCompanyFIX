'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { RecurringContract, Currency } from '@/types';
import { formatCurrency, formatDate } from '@/lib/formatters';
import {
  RotateCcw,
  Building2,
  Plus,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Wallet,
  X,
} from 'lucide-react';

export function RecurringContractsView() {
  const {
    recurringContracts,
    clients,
    products,
    addRecurringContract,
    currencyFilter,
  } = useApp();

  const [showNewModal, setShowNewModal] = useState(false);
  const [clientId, setClientId] = useState(clients[0]?.id || '');
  const [serviceName, setServiceName] = useState('Manutenção de Website & Otimização Local');
  const [recurringAmount, setRecurringAmount] = useState<number>(1450);
  const [currency, setCurrency] = useState<Currency>('BRL');
  const [dueDay, setDueDay] = useState<number>(10);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);

  // Calculations
  const mrrBRL = recurringContracts
    .filter((rc) => rc.status === 'ativo' && rc.currency === 'BRL')
    .reduce((s, rc) => s + rc.recurringAmount, 0);

  const mrrUSD = recurringContracts
    .filter((rc) => rc.status === 'ativo' && rc.currency === 'USD')
    .reduce((s, rc) => s + rc.recurringAmount, 0);

  const filteredContracts = recurringContracts.filter((rc) => {
    if (currencyFilter !== 'ALL' && rc.currency !== currencyFilter) return false;
    return true;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const cl = clients.find((c) => c.id === clientId);
    if (!cl) return;

    addRecurringContract({
      clientId: cl.id,
      clientName: cl.companyName,
      serviceName,
      recurringAmount: Number(recurringAmount) || 0,
      currency,
      interval: 'mensal',
      dueDay: Number(dueDay) || 10,
      startDate,
      status: 'ativo',
    });

    setShowNewModal(false);
  };

  return (
    <div id="recurring-contracts-view" className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-neutral-900 tracking-tight">
              Contratos Recorrentes & Retainers (MRR)
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-900">
              {filteredContracts.length} contratos
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">
            Gestão de mensalidades, suporte continuado, gestão de presença local e receita previsível.
          </p>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          className="px-4 py-1.5 bg-blue-950 hover:bg-blue-900 text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Contrato Recorrente</span>
        </button>
      </div>

      {/* MRR Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs text-neutral-500 font-semibold block">MRR Mensal Ativo (BRL)</span>
            <p className="text-2xl font-bold text-emerald-700 mt-1">
              {formatCurrency(mrrBRL, 'BRL')}
            </p>
            <span className="text-[11px] text-neutral-400 mt-0.5 block">Receita Recorrente Brasil</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <RotateCcw className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs text-neutral-500 font-semibold block">MRR Mensal Ativo (USD)</span>
            <p className="text-2xl font-bold text-emerald-700 mt-1">
              {formatCurrency(mrrUSD, 'USD')}
            </p>
            <span className="text-[11px] text-neutral-400 mt-0.5 block">Receita Recorrente Exterior</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <RotateCcw className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Contracts Table */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 font-semibold uppercase text-[11px] tracking-wider">
              <tr>
                <th className="p-3.5">Cliente</th>
                <th className="p-3.5">Serviço / Plano</th>
                <th className="p-3.5">Valor Mensal</th>
                <th className="p-3.5">Dia de Vencimento</th>
                <th className="p-3.5">Início</th>
                <th className="p-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredContracts.map((rc) => (
                <tr key={rc.id} className="hover:bg-neutral-50/80 transition-colors">
                  <td className="p-3.5 font-bold text-neutral-900">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-indigo-600" />
                      <span>{rc.clientName}</span>
                    </div>
                  </td>

                  <td className="p-3.5 text-neutral-700 font-medium">
                    {rc.serviceName}
                  </td>

                  <td className="p-3.5 font-bold text-emerald-700 text-sm">
                    {formatCurrency(rc.recurringAmount, rc.currency)}/mês
                  </td>

                  <td className="p-3.5 font-semibold text-neutral-800">
                    Todo dia {rc.dueDay}
                  </td>

                  <td className="p-3.5 text-neutral-500">
                    {formatDate(rc.startDate)}
                  </td>

                  <td className="p-3.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize ${
                        rc.status === 'ativo' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {rc.status}
                    </span>
                  </td>
                </tr>
              ))}

              {filteredContracts.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-neutral-400">
                    Nenhum contrato recorrente cadastrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Recurring Contract Modal */}
      {showNewModal && (
        <div
          className="fixed inset-0 z-50 bg-neutral-950/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setShowNewModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl border border-neutral-200 w-full max-w-md p-6 space-y-4 text-neutral-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-neutral-900">Novo Contrato Recorrente</h3>
              <button onClick={() => setShowNewModal(false)} className="p-1 text-neutral-400 hover:text-neutral-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Cliente Vinculado *</label>
                <select
                  required
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg bg-white"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.companyName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Serviço Recorrente *</label>
                <input
                  required
                  type="text"
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Moeda</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setCurrency('BRL')}
                      className={`flex-1 py-1.5 rounded-lg border font-bold text-center ${
                        currency === 'BRL'
                          ? 'bg-blue-900 text-white border-blue-900'
                          : 'bg-neutral-50 text-neutral-700 border-neutral-200'
                      }`}
                    >
                      BRL R$
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrency('USD')}
                      className={`flex-1 py-1.5 rounded-lg border font-bold text-center ${
                        currency === 'USD'
                          ? 'bg-emerald-900 text-white border-emerald-900'
                          : 'bg-neutral-50 text-neutral-700 border-neutral-200'
                      }`}
                    >
                      USD $
                    </button>
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Valor Mensal *</label>
                  <input
                    required
                    type="number"
                    value={recurringAmount}
                    onChange={(e) => setRecurringAmount(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg font-bold text-emerald-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Dia do Vencimento (1 a 31)</label>
                  <input
                    required
                    type="number"
                    min="1"
                    max="31"
                    value={dueDay}
                    onChange={(e) => setDueDay(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Data de Início</label>
                  <input
                    required
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 border border-neutral-200 rounded-lg hover:bg-neutral-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-950 text-white font-bold rounded-lg hover:bg-blue-900"
                >
                  Criar Contrato
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
