'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { Lead, LeadStage, LeadTemperature, Currency } from '@/types';
import { formatCurrency, formatDate, isDateOverdue } from '@/lib/formatters';
import { exportLeadsToExcel } from '@/lib/excelExport';
import {
  Search,
  Plus,
  List,
  KanbanSquare,
  Download,
  UploadCloud,
  Filter,
  ArrowUpDown,
  Building2,
  Phone,
  Mail,
  MapPin,
  Clock,
  Sparkles,
  ChevronRight,
  Star,
  ExternalLink,
  XCircle,
} from 'lucide-react';
import { LossReasonModal } from './LossReasonModal';

interface LeadsViewProps {
  onOpenNewLead: () => void;
  onOpenImportModal?: () => void;
  onOpenImportLeads?: () => void;
  onOpenConvertModal?: (lead: Lead) => void;
  onOpenConvertLead?: (lead: Lead) => void;
  initialViewMode?: 'kanban' | 'list';
}

export function LeadsView({
  onOpenNewLead,
  onOpenImportModal,
  onOpenImportLeads,
  onOpenConvertModal,
  onOpenConvertLead,
  initialViewMode = 'kanban',
}: LeadsViewProps) {
  const triggerImport = onOpenImportLeads || onOpenImportModal || (() => {});
  const triggerConvert = onOpenConvertLead || onOpenConvertModal || (() => {});

  const {
    leads,
    stages,
    moveLeadStage,
    currencyFilter,
    selectedLeadId,
    setSelectedLeadId,
  } = useApp();

  const [viewMode, setViewMode] = useState<'kanban' | 'list'>(initialViewMode);
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('ALL');
  const [tempFilter, setTempFilter] = useState<string>('ALL');
  const [countryFilter, setCountryFilter] = useState<string>('ALL');
  const [sourceFilter, setSourceFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'date_desc' | 'value_desc' | 'name_asc'>('date_desc');
  const [lossModalLead, setLossModalLead] = useState<Lead | null>(null);

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    return leads
      .filter((l) => {
        if (currencyFilter !== 'ALL' && l.currency !== currencyFilter) return false;
        if (stageFilter !== 'ALL' && l.stageId !== stageFilter) return false;
        if (tempFilter !== 'ALL' && l.temperature !== tempFilter) return false;
        if (countryFilter !== 'ALL' && l.country !== countryFilter) return false;
        if (sourceFilter !== 'ALL' && l.source !== sourceFilter) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchCompany = l.companyName.toLowerCase().includes(q);
          const matchCategory = l.category.toLowerCase().includes(q);
          const matchCity = l.city.toLowerCase().includes(q);
          const matchContact = l.contacts.some((c) => c.name.toLowerCase().includes(q));
          if (!matchCompany && !matchCategory && !matchCity && !matchContact) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'value_desc') return b.estimatedValue - a.estimatedValue;
        if (sortBy === 'name_asc') return a.companyName.localeCompare(b.companyName);
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [leads, currencyFilter, stageFilter, tempFilter, countryFilter, sourceFilter, searchQuery, sortBy]);

  const handleExportExcel = () => {
    exportLeadsToExcel(filteredLeads, `FSM_Leads_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Drag and drop handler for Kanban
  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    e.dataTransfer.setData('text/plain', leadId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData('text/plain');
    if (!leadId) return;

    const targetLead = leads.find((l) => l.id === leadId);
    if (!targetLead) return;

    if (stageId === 'perdido') {
      setLossModalLead(targetLead);
    } else if (stageId === 'ganho') {
      triggerConvert(targetLead);
    } else {
      moveLeadStage(leadId, stageId);
    }
  };

  // Unique countries and sources for filters
  const countries = Array.from(new Set(leads.map((l) => l.country))).filter(Boolean);
  const sources = Array.from(new Set(leads.map((l) => l.source))).filter(Boolean);

  return (
    <div id="leads-view" className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-150">
      {/* Top Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-neutral-900 tracking-tight">
              Prospecção Comercial & Leads
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-900">
              {filteredLeads.length} leads
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">
            Gerencie oportunidades prospectadas no Google Maps, redes e canais ativos.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-neutral-100 p-0.5 rounded-lg border border-neutral-200/60 text-xs">
            <button
              id="view-kanban-btn"
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 rounded-md font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === 'kanban'
                  ? 'bg-white text-blue-950 shadow-2xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <KanbanSquare className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
            <button
              id="view-list-btn"
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-md font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-blue-950 shadow-2xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Lista</span>
            </button>
          </div>

          {/* Import / Export */}
          <button
            id="import-leads-btn"
            onClick={triggerImport}
            className="px-3 py-1.5 bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-700 rounded-lg text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5"
            title="Importar planilha de leads (.xlsx ou .csv)"
          >
            <UploadCloud className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">Importar</span>
          </button>

          <button
            id="export-leads-btn"
            onClick={handleExportExcel}
            className="px-3 py-1.5 bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-700 rounded-lg text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5"
            title="Exportar dados para Excel (.xlsx)"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Exportar</span>
          </button>

          {/* New Lead */}
          <button
            id="create-lead-btn"
            onClick={onOpenNewLead}
            className="px-4 py-1.5 bg-blue-950 hover:bg-blue-900 text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Lead</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-neutral-200/80 shadow-2xs flex flex-wrap items-center gap-3 text-xs">
        {/* Search Bar */}
        <div className="flex-1 min-w-[220px] relative">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
          <input
            id="leads-search-input"
            type="text"
            placeholder="Buscar por empresa, nicho, cidade ou contato..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-neutral-200 rounded-lg text-neutral-900 placeholder-neutral-400 focus:outline-hidden focus:ring-1 focus:ring-blue-600"
          />
        </div>

        {/* Stage Filter */}
        <select
          id="leads-filter-stage"
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value)}
          className="px-2.5 py-1.5 border border-neutral-200 rounded-lg bg-white text-neutral-700 font-medium"
        >
          <option value="ALL">Todas as Etapas</option>
          {stages.map((stg) => (
            <option key={stg.id} value={stg.id}>
              {stg.name}
            </option>
          ))}
        </select>

        {/* Temperature Filter */}
        <select
          id="leads-filter-temp"
          value={tempFilter}
          onChange={(e) => setTempFilter(e.target.value)}
          className="px-2.5 py-1.5 border border-neutral-200 rounded-lg bg-white text-neutral-700 font-medium"
        >
          <option value="ALL">Temperatura: Todas</option>
          <option value="quente">🔥 Quente</option>
          <option value="morno">🌤️ Morno</option>
          <option value="frio">❄️ Frio</option>
        </select>

        {/* Country Filter */}
        <select
          id="leads-filter-country"
          value={countryFilter}
          onChange={(e) => setCountryFilter(e.target.value)}
          className="px-2.5 py-1.5 border border-neutral-200 rounded-lg bg-white text-neutral-700 font-medium"
        >
          <option value="ALL">País: Todos</option>
          {countries.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        {/* Source Filter */}
        <select
          id="leads-filter-source"
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          className="px-2.5 py-1.5 border border-neutral-200 rounded-lg bg-white text-neutral-700 font-medium"
        >
          <option value="ALL">Origem: Todas</option>
          {sources.map((src) => (
            <option key={src} value={src}>
              {src}
            </option>
          ))}
        </select>

        {/* Sort */}
        <select
          id="leads-sort-select"
          value={sortBy}
          onChange={(e: any) => setSortBy(e.target.value)}
          className="px-2.5 py-1.5 border border-neutral-200 rounded-lg bg-white text-neutral-700 font-medium ml-auto"
        >
          <option value="date_desc">Mais recentes primeiro</option>
          <option value="value_desc">Maior valor estimado</option>
          <option value="name_asc">Nome da empresa (A-Z)</option>
        </select>
      </div>

      {/* KANBAN VIEW */}
      {viewMode === 'kanban' && (
        <div
          id="leads-kanban-board"
          className="flex gap-4 overflow-x-auto pb-6 pt-1 select-none scrollbar-thin"
          style={{ minHeight: '600px' }}
        >
          {stages.map((stage) => {
            const stageLeads = filteredLeads.filter((l) => l.stageId === stage.id);
            const totalStageValueBRL = stageLeads
              .filter((l) => l.currency === 'BRL')
              .reduce((s, l) => s + l.estimatedValue, 0);
            const totalStageValueUSD = stageLeads
              .filter((l) => l.currency === 'USD')
              .reduce((s, l) => s + l.estimatedValue, 0);

            return (
              <div
                key={stage.id}
                id={`kanban-col-${stage.id}`}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, stage.id)}
                className="w-72 flex-shrink-0 flex flex-col bg-neutral-100/70 rounded-2xl border border-neutral-200/80 p-3 max-h-[750px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-neutral-200">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: stage.color }}
                    />
                    <h3 className="font-bold text-xs text-neutral-900 truncate">{stage.name}</h3>
                  </div>
                  <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-full bg-white text-neutral-600 border border-neutral-200">
                    {stageLeads.length}
                  </span>
                </div>

                {/* Values total in column */}
                {(totalStageValueBRL > 0 || totalStageValueUSD > 0) && (
                  <div className="text-[10px] text-neutral-500 font-semibold mb-2 flex items-center justify-between px-1">
                    <span>Oportunidades:</span>
                    <span className="text-neutral-800">
                      {totalStageValueBRL > 0 && formatCurrency(totalStageValueBRL, 'BRL')}
                      {totalStageValueBRL > 0 && totalStageValueUSD > 0 && ' + '}
                      {totalStageValueUSD > 0 && formatCurrency(totalStageValueUSD, 'USD')}
                    </span>
                  </div>
                )}

                {/* Cards Container */}
                <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 scrollbar-thin">
                  {stageLeads.map((lead) => {
                    const isFollowUpOverdue = isDateOverdue(lead.nextFollowUpDate);

                    return (
                      <div
                        key={lead.id}
                        id={`kanban-card-${lead.id}`}
                        draggable
                        onDragStart={(e) => handleDragStart(e, lead.id)}
                        onClick={() => setSelectedLeadId(lead.id)}
                        className="bg-white rounded-xl p-3.5 border border-neutral-200 hover:border-blue-400 shadow-2xs hover:shadow-xs transition-all cursor-grab active:cursor-grabbing space-y-2.5 group"
                      >
                        {/* Company & Category */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h4 className="font-bold text-xs text-neutral-900 leading-snug group-hover:text-blue-700 transition-colors truncate">
                              {lead.companyName}
                            </h4>
                            <p className="text-[11px] text-neutral-500 truncate mt-0.5">
                              {lead.category}
                            </p>
                          </div>
                          {/* Temp Badge */}
                          <span
                            className="text-[10px] px-1.5 py-0.5 rounded font-bold uppercase flex-shrink-0"
                            title={`Temperatura: ${lead.temperature}`}
                          >
                            {lead.temperature === 'quente' && '🔥 Quente'}
                            {lead.temperature === 'morno' && '🌤️ Morno'}
                            {lead.temperature === 'frio' && '❄️ Frio'}
                          </span>
                        </div>

                        {/* Location and Google Maps */}
                        <div className="flex items-center justify-between text-[11px] text-neutral-500">
                          <span className="flex items-center gap-1 truncate">
                            <MapPin className="w-3 h-3 text-neutral-400 flex-shrink-0" />
                            {lead.city}, {lead.country}
                          </span>
                          {lead.googleRating && (
                            <span className="flex items-center gap-0.5 text-amber-600 font-semibold text-[10px]">
                              <Star className="w-3 h-3 fill-amber-500" />
                              {lead.googleRating}
                            </span>
                          )}
                        </div>

                        {/* Service of Interest */}
                        <div className="bg-neutral-50 rounded-lg p-1.5 text-[10px] text-neutral-700 font-medium truncate">
                          {lead.serviceOfInterest}
                        </div>

                        {/* Value & Next action footer */}
                        <div className="flex items-center justify-between pt-1 border-t border-neutral-100 text-[11px]">
                          <span className="font-bold text-neutral-900">
                            {formatCurrency(lead.estimatedValue, lead.currency)}
                          </span>

                          <div className="flex items-center gap-1.5">
                            {lead.status === 'perdido' ? (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 font-semibold border border-rose-200">
                                Perdido: {lead.lossReason || 'Sem motivo'}
                              </span>
                            ) : lead.status === 'ganho' ? (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                                Ganho / Cliente
                              </span>
                            ) : (
                              <>
                                <button
                                  id={`loss-btn-card-${lead.id}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setLossModalLead(lead);
                                  }}
                                  className="text-[10px] font-medium text-neutral-400 hover:text-rose-600 transition-colors"
                                  title="Marcar oportunidade como perdida"
                                >
                                  Perdido
                                </button>
                                <button
                                  id={`convert-btn-card-${lead.id}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    triggerConvert(lead);
                                  }}
                                  className="text-[10px] font-semibold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-0.5"
                                >
                                  <Sparkles className="w-3 h-3" />
                                  <span>Converter</span>
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Follow up alert if exists */}
                        {lead.nextFollowUpDate && (
                          <div
                            className={`text-[10px] px-2 py-0.5 rounded font-medium flex items-center justify-between ${
                              isFollowUpOverdue
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-neutral-100 text-neutral-600'
                            }`}
                          >
                            <span>Retorno: {formatDate(lead.nextFollowUpDate)}</span>
                            {isFollowUpOverdue && <span className="font-bold">Atrasado!</span>}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {stageLeads.length === 0 && (
                    <div className="py-8 text-center text-neutral-400 text-xs border border-dashed border-neutral-200 rounded-xl">
                      Nenhum lead nesta etapa
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* LIST VIEW */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50/80 border-b border-neutral-200 text-neutral-600 font-semibold uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="p-3.5">Empresa / Contato</th>
                  <th className="p-3.5">Nicho & Localização</th>
                  <th className="p-3.5">Etapa / Status</th>
                  <th className="p-3.5">Temperatura</th>
                  <th className="p-3.5">Valor Estimado</th>
                  <th className="p-3.5">Próximo Follow-up</th>
                  <th className="p-3.5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredLeads.map((lead) => {
                  const stage = stages.find((s) => s.id === lead.stageId);
                  const isFollowUpOverdue = isDateOverdue(lead.nextFollowUpDate);

                  return (
                    <tr
                      key={lead.id}
                      onClick={() => setSelectedLeadId(lead.id)}
                      className="hover:bg-neutral-50/80 cursor-pointer transition-colors"
                    >
                      <td className="p-3.5 font-medium text-neutral-900">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-blue-700 flex-shrink-0" />
                          <div>
                            <span className="font-bold block leading-tight">{lead.companyName}</span>
                            <span className="text-[11px] text-neutral-500">
                              {lead.contacts[0]?.name || lead.phone || '-'}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5 text-neutral-600">
                        <span className="font-medium text-neutral-800 block">{lead.category}</span>
                        <span className="text-[11px] text-neutral-500">
                          {lead.city}, {lead.country}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <span
                          className="px-2 py-0.5 rounded-md text-[11px] font-bold inline-block"
                          style={{
                            backgroundColor: `${stage?.color || '#3b82f6'}20`,
                            color: stage?.color || '#3b82f6',
                          }}
                        >
                          {stage?.name || lead.stageId}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <span className="font-semibold capitalize">
                          {lead.temperature === 'quente' && '🔥 Quente'}
                          {lead.temperature === 'morno' && '🌤️ Morno'}
                          {lead.temperature === 'frio' && '❄️ Frio'}
                        </span>
                      </td>

                      <td className="p-3.5 font-bold text-neutral-900">
                        {formatCurrency(lead.estimatedValue, lead.currency)}
                      </td>

                      <td className="p-3.5">
                        {lead.nextFollowUpDate ? (
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                              isFollowUpOverdue ? 'bg-rose-100 text-rose-800 font-bold' : 'text-neutral-600'
                            }`}
                          >
                            {formatDate(lead.nextFollowUpDate)}
                          </span>
                        ) : (
                          <span className="text-neutral-400">-</span>
                        )}
                      </td>

                      <td className="p-3.5 text-right space-x-2" onClick={(e) => e.stopPropagation()}>
                        {lead.status === 'perdido' ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            Perdido ({lead.lossReason || 'Sem motivo'})
                          </span>
                        ) : lead.status === 'ganho' ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Cliente Ganho
                          </span>
                        ) : (
                          <>
                            <button
                              onClick={() => setLossModalLead(lead)}
                              className="px-2 py-1 text-neutral-500 hover:text-rose-600 hover:bg-rose-50 rounded-md font-medium text-xs transition-colors"
                            >
                              Perdido
                            </button>
                            <button
                              onClick={() => triggerConvert(lead)}
                              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-md font-semibold text-xs transition-colors"
                            >
                              Converter
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => setSelectedLeadId(lead.id)}
                          className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-md font-semibold text-xs transition-colors"
                        >
                          Ver
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {filteredLeads.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-neutral-400">
                      Nenhum lead corresponde aos filtros selecionados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de Registro de Perda com Motivo */}
      <LossReasonModal
        lead={lossModalLead}
        isOpen={!!lossModalLead}
        onClose={() => setLossModalLead(null)}
      />
    </div>
  );
}
