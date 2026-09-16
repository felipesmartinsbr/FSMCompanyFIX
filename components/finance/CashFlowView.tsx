'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { formatCurrency, formatDate } from '@/lib/formatters';
import {
  TrendingUp,
  ArrowDownLeft,
  ArrowUpRight,
  Wallet,
  Calendar,
  Layers,
  ArrowRight,
} from 'lucide-react';

export function CashFlowView() {
  const { transactions, currencyFilter } = useApp();

  const [period, setPeriod] = useState<'30d' | '90d' | 'year' | 'all'>('all');

  // Calculate cash flow separated by currency
  const inflowsBRL = transactions
    .filter((t) => t.type === 'receita' && t.status === 'pago' && t.currency === 'BRL')
    .reduce((s, t) => s + t.amount, 0);

  const outflowsBRL = transactions
    .filter((t) => t.type === 'despesa' && t.status === 'pago' && t.currency === 'BRL')
    .reduce((s, t) => s + t.amount, 0);

  const netBalanceBRL = inflowsBRL - outflowsBRL;

  const inflowsUSD = transactions
    .filter((t) => t.type === 'receita' && t.status === 'pago' && t.currency === 'USD')
    .reduce((s, t) => s + t.amount, 0);

  const outflowsUSD = transactions
    .filter((t) => t.type === 'despesa' && t.status === 'pago' && t.currency === 'USD')
    .reduce((s, t) => s + t.amount, 0);

  const netBalanceUSD = inflowsUSD - outflowsUSD;

  // Pending cash flow (projeção)
  const pendingInflowsBRL = transactions
    .filter((t) => t.type === 'receita' && (t.status === 'pendente' || t.status === 'vencido') && t.currency === 'BRL')
    .reduce((s, t) => s + t.amount, 0);

  const pendingOutflowsBRL = transactions
    .filter((t) => t.type === 'despesa' && t.status === 'pendente' && t.currency === 'BRL')
    .reduce((s, t) => s + t.amount, 0);

  const pendingInflowsUSD = transactions
    .filter((t) => t.type === 'receita' && (t.status === 'pendente' || t.status === 'vencido') && t.currency === 'USD')
    .reduce((s, t) => s + t.amount, 0);

  const pendingOutflowsUSD = transactions
    .filter((t) => t.type === 'despesa' && t.status === 'pendente' && t.currency === 'USD')
    .reduce((s, t) => s + t.amount, 0);

  return (
    <div id="cash-flow-view" className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-neutral-900 tracking-tight">
          Fluxo de Caixa Realizado & Projetado
        </h2>
        <p className="text-xs text-neutral-500 mt-0.5">
          Demonstrativo de receitas liquidadas, custos operacionais e saldo por moeda.
        </p>
      </div>

      {/* 2-Column Split: BRL vs USD */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Real Brasileiro (BRL) */}
        <div className="bg-white rounded-2xl p-6 border border-neutral-200/80 shadow-2xs space-y-5">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-600" />
              <h3 className="font-bold text-sm text-neutral-900">
                Fluxo de Caixa em Real (BRL R$)
              </h3>
            </div>
            <span className="text-[11px] font-semibold text-blue-900 bg-blue-50 px-2 py-0.5 rounded">
              Operação Brasil
            </span>
          </div>

          {/* Liquidated Realized */}
          <div className="space-y-3">
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
              1. Realizado (Liquidados em Conta)
            </span>
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
                <span className="text-[10px] text-emerald-800 font-semibold block">Total Entradas</span>
                <span className="text-base font-bold text-emerald-700 block mt-1">
                  {formatCurrency(inflowsBRL, 'BRL')}
                </span>
              </div>

              <div className="p-3 bg-rose-50/50 rounded-xl border border-rose-100">
                <span className="text-[10px] text-rose-800 font-semibold block">Total Saídas</span>
                <span className="text-base font-bold text-rose-700 block mt-1">
                  {formatCurrency(outflowsBRL, 'BRL')}
                </span>
              </div>

              <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                <span className="text-[10px] text-blue-800 font-semibold block">Resultado Líquido</span>
                <span className="text-base font-bold text-blue-900 block mt-1">
                  {formatCurrency(netBalanceBRL, 'BRL')}
                </span>
              </div>
            </div>
          </div>

          {/* Projected / Pending */}
          <div className="space-y-3 pt-2">
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
              2. Previsão a Realizar (Pendentes)
            </span>
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/70">
                <span className="text-[10px] text-neutral-500 font-medium block">Entradas Previstas</span>
                <span className="text-sm font-bold text-neutral-800 block mt-1">
                  {formatCurrency(pendingInflowsBRL, 'BRL')}
                </span>
              </div>

              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/70">
                <span className="text-[10px] text-neutral-500 font-medium block">Contas a Pagar</span>
                <span className="text-sm font-bold text-neutral-800 block mt-1">
                  {formatCurrency(pendingOutflowsBRL, 'BRL')}
                </span>
              </div>

              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/70">
                <span className="text-[10px] text-neutral-500 font-medium block">Saldo Futuro Estimado</span>
                <span className="text-sm font-bold text-neutral-800 block mt-1">
                  {formatCurrency(netBalanceBRL + pendingInflowsBRL - pendingOutflowsBRL, 'BRL')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Dólar Americano (USD) */}
        <div className="bg-white rounded-2xl p-6 border border-neutral-200/80 shadow-2xs space-y-5">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-600" />
              <h3 className="font-bold text-sm text-neutral-900">
                Fluxo de Caixa em Dólar (USD $)
              </h3>
            </div>
            <span className="text-[11px] font-semibold text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded">
              Operação Exterior / SaaS
            </span>
          </div>

          {/* Liquidated Realized */}
          <div className="space-y-3">
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
              1. Realizado (Liquidados em Conta)
            </span>
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
                <span className="text-[10px] text-emerald-800 font-semibold block">Total Entradas</span>
                <span className="text-base font-bold text-emerald-700 block mt-1">
                  {formatCurrency(inflowsUSD, 'USD')}
                </span>
              </div>

              <div className="p-3 bg-rose-50/50 rounded-xl border border-rose-100">
                <span className="text-[10px] text-rose-800 font-semibold block">Total Saídas</span>
                <span className="text-base font-bold text-rose-700 block mt-1">
                  {formatCurrency(outflowsUSD, 'USD')}
                </span>
              </div>

              <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
                <span className="text-[10px] text-emerald-800 font-semibold block">Resultado Líquido</span>
                <span className="text-base font-bold text-emerald-900 block mt-1">
                  {formatCurrency(netBalanceUSD, 'USD')}
                </span>
              </div>
            </div>
          </div>

          {/* Projected / Pending */}
          <div className="space-y-3 pt-2">
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
              2. Previsão a Realizar (Pendentes)
            </span>
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/70">
                <span className="text-[10px] text-neutral-500 font-medium block">Entradas Previstas</span>
                <span className="text-sm font-bold text-neutral-800 block mt-1">
                  {formatCurrency(pendingInflowsUSD, 'USD')}
                </span>
              </div>

              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/70">
                <span className="text-[10px] text-neutral-500 font-medium block">Contas a Pagar</span>
                <span className="text-sm font-bold text-neutral-800 block mt-1">
                  {formatCurrency(pendingOutflowsUSD, 'USD')}
                </span>
              </div>

              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/70">
                <span className="text-[10px] text-neutral-500 font-medium block">Saldo Futuro Estimado</span>
                <span className="text-sm font-bold text-neutral-800 block mt-1">
                  {formatCurrency(netBalanceUSD + pendingInflowsUSD - pendingOutflowsUSD, 'USD')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
