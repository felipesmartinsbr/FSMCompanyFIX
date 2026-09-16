'use client';

import React, { useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { formatCurrency } from '@/lib/formatters';
import {
  TrendingUp,
  BarChart3,
  PieChart,
  Target,
  DollarSign,
  Building2,
  Calendar,
  Layers,
  ArrowUpRight,
  ShieldAlert,
} from 'lucide-react';

export function ReportsView() {
  const { leads, clients, projects, transactions, recurringContracts, settings } = useApp();

  // Funnel calculations
  const totalLeads = leads.length;
  const contactedLeads = leads.filter(
    (l) => l.stageId !== 'novo_lead' && l.stageId !== 'pesquisa_qualificacao'
  ).length;
  const meetingLeads = leads.filter(
    (l) => l.stageId === 'reuniao_agendada' || l.stageId === 'reuniao_realizada' || l.stageId === 'proposta_enviada' || l.stageId === 'negociacao' || l.stageId === 'aguardando_decisao' || l.status === 'ganho'
  ).length;
  const proposalLeads = leads.filter(
    (l) => l.stageId === 'proposta_enviada' || l.stageId === 'negociacao' || l.stageId === 'aguardando_decisao' || l.status === 'ganho'
  ).length;
  const wonLeads = leads.filter((l) => l.status === 'ganho').length;

  const convRateToMeeting = totalLeads > 0 ? Math.round((meetingLeads / totalLeads) * 100) : 0;
  const convRateToWon = totalLeads > 0 ? Math.round((wonLeads / totalLeads) * 100) : 0;

  // Average Ticket
  const wonLeadsBRL = leads.filter((l) => l.status === 'ganho' && l.currency === 'BRL');
  const avgTicketBRL =
    wonLeadsBRL.length > 0
      ? Math.round(wonLeadsBRL.reduce((s, l) => s + (l.dealValue ?? l.estimatedValue ?? 0), 0) / wonLeadsBRL.length)
      : 0;

  const wonLeadsUSD = leads.filter((l) => l.status === 'ganho' && l.currency === 'USD');
  const avgTicketUSD =
    wonLeadsUSD.length > 0
      ? Math.round(wonLeadsUSD.reduce((s, l) => s + (l.dealValue ?? l.estimatedValue ?? 0), 0) / wonLeadsUSD.length)
      : 0;

  // Acquisition Channel Performance
  const channelStats = useMemo(() => {
    const map: Record<string, { total: number; won: number; totalValueBRL: number }> = {};
    leads.forEach((l) => {
      const src = l.source || 'Outro';
      if (!map[src]) map[src] = { total: 0, won: 0, totalValueBRL: 0 };
      map[src].total++;
      if (l.status === 'ganho') {
        map[src].won++;
        const val = l.dealValue ?? l.estimatedValue ?? 0;
        const rate = settings.usdToBrlRate || settings.exchangeRateBRLtoUSD || 5.6;
        map[src].totalValueBRL += l.currency === 'BRL' ? val : val * rate;
      }
    });
    return Object.entries(map).map(([channel, data]) => ({
      channel,
      ...data,
      conversionRate: data.total > 0 ? Math.round((data.won / data.total) * 100) : 0,
    }));
  }, [leads, settings.usdToBrlRate, settings.exchangeRateBRLtoUSD]);

  // Client Revenue Concentration
  const clientConcentration = useMemo(() => {
    const totalContractedBRL = clients.reduce((s, c) => {
      return s + (c.currency === 'BRL' ? c.contractedValue : c.contractedValue * settings.usdToBrlRate);
    }, 0);

    return clients
      .map((c) => {
        const valBRL = c.currency === 'BRL' ? c.contractedValue : c.contractedValue * settings.usdToBrlRate;
        const share = totalContractedBRL > 0 ? Math.round((valBRL / totalContractedBRL) * 100) : 0;
        return {
          id: c.id,
          name: c.companyName,
          valueBRL: valBRL,
          share,
          currency: c.currency,
          originalValue: c.contractedValue,
        };
      })
      .sort((a, b) => b.valueBRL - a.valueBRL)
      .slice(0, 5);
  }, [clients, settings.usdToBrlRate]);

  return (
    <div id="reports-view" className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-neutral-900 tracking-tight">
          Relatórios & Inteligência Operacional
        </h2>
        <p className="text-xs text-neutral-500 mt-0.5">
          Estatísticas de conversão de funil, canais de prospecção, lucratividade e análise de risco da carteira.
        </p>
      </div>

      {/* Funnel Metrics Bar */}
      <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-2xs space-y-4">
        <h3 className="font-bold text-sm text-neutral-900 flex items-center gap-2">
          <Target className="w-4 h-4 text-blue-900" />
          Funil de Vendas & Taxas de Conversão
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/70">
            <span className="text-[11px] text-neutral-500 block">1. Total de Leads</span>
            <span className="text-xl font-bold text-neutral-900 block mt-1">{totalLeads}</span>
            <span className="text-[10px] text-neutral-400">Prospectados</span>
          </div>

          <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/70">
            <span className="text-[11px] text-neutral-500 block">2. Contactados</span>
            <span className="text-xl font-bold text-blue-900 block mt-1">{contactedLeads}</span>
            <span className="text-[10px] text-blue-700">
              {totalLeads > 0 ? Math.round((contactedLeads / totalLeads) * 100) : 0}% taxa de contato
            </span>
          </div>

          <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/70">
            <span className="text-[11px] text-neutral-500 block">3. Reuniões Agendadas</span>
            <span className="text-xl font-bold text-indigo-900 block mt-1">{meetingLeads}</span>
            <span className="text-[10px] text-indigo-700">{convRateToMeeting}% avanço</span>
          </div>

          <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/70">
            <span className="text-[11px] text-neutral-500 block">4. Propostas Enviadas</span>
            <span className="text-xl font-bold text-purple-900 block mt-1">{proposalLeads}</span>
            <span className="text-[10px] text-purple-700">Aguardando decisão</span>
          </div>

          <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200/80">
            <span className="text-[11px] text-emerald-800 font-bold block">5. Vendas Concluídas</span>
            <span className="text-xl font-bold text-emerald-700 block mt-1">{wonLeads}</span>
            <span className="text-[10px] text-emerald-700 font-bold">{convRateToWon}% conversão global</span>
          </div>
        </div>
      </div>

      {/* Two columns: Channels & Client Risk */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance by Channel */}
        <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-2xs space-y-4">
          <h3 className="font-bold text-sm text-neutral-900 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-700" />
            Desempenho por Canal de Prospecção
          </h3>

          <div className="space-y-3 text-xs">
            {channelStats.map((ch) => (
              <div key={ch.channel} className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/70 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-neutral-900">{ch.channel}</span>
                  <span className="text-[11px] font-semibold text-emerald-700">
                    {ch.won} convertidos de {ch.total} ({ch.conversionRate}%)
                  </span>
                </div>

                <div className="w-full bg-neutral-200 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-emerald-600 h-1.5 rounded-full"
                    style={{ width: `${Math.min(ch.conversionRate, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Client Concentration / Dependency Risk */}
        <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-neutral-900 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              Concentração de Receita por Cliente (Risco)
            </h3>
            <span className="text-[10px] bg-amber-50 text-amber-800 font-bold px-2 py-0.5 rounded">
              Top 5 Contratos
            </span>
          </div>

          <div className="space-y-3 text-xs">
            {clientConcentration.map((c, i) => (
              <div key={c.id} className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/70 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-neutral-900">
                    #{i + 1} {c.name}
                  </span>
                  <span className="font-bold text-neutral-800">
                    {c.share}% da receita total
                  </span>
                </div>

                <div className="w-full bg-neutral-200 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-1.5 rounded-full ${c.share > 35 ? 'bg-rose-500' : 'bg-blue-600'}`}
                    style={{ width: `${Math.min(c.share, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-neutral-500">
                  <span>Valor: {formatCurrency(c.originalValue, c.currency)}</span>
                  {c.share > 35 && <span className="text-rose-600 font-bold">Alta dependência</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
