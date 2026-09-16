'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { LeadActivity } from '@/types';
import { formatDate, formatDateTime } from '@/lib/formatters';
import {
  MessageSquare,
  Phone,
  Mail,
  Calendar,
  FileText,
  Clock,
  Plus,
  Search,
  CheckCircle2,
  Building2,
  Filter,
} from 'lucide-react';

interface ActivitiesViewProps {
  onOpenNewLead?: () => void;
}

export function ActivitiesView({ onOpenNewLead }: ActivitiesViewProps = {}) {
  const { leads, addLeadActivity, settings, setSelectedLeadId, setCurrentTab } = useApp();

  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);

  // Form State
  const [selectedLeadForNew, setSelectedLeadForNew] = useState(leads[0]?.id || '');
  const [actType, setActType] = useState<LeadActivity['type']>('whatsapp');
  const [actTitle, setActTitle] = useState('');
  const [actDescription, setActDescription] = useState('');
  const [actResult, setActResult] = useState('');
  const [actNextAction, setActNextAction] = useState('');

  // Flatten all activities with their lead info
  const allActivities = useMemo(() => {
    const list: {
      activity: LeadActivity;
      leadId: string;
      companyName: string;
      category: string;
    }[] = [];

    leads.forEach((l) => {
      l.activities.forEach((a) => {
        list.push({
          activity: a,
          leadId: l.id,
          companyName: l.companyName,
          category: l.category,
        });
      });
    });

    return list.sort(
      (a, b) => new Date(b.activity.date).getTime() - new Date(a.activity.date).getTime()
    );
  }, [leads]);

  const filteredActivities = useMemo(() => {
    return allActivities.filter((item) => {
      if (typeFilter !== 'ALL' && item.activity.type !== typeFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.activity.title.toLowerCase().includes(q);
        const matchCompany = item.companyName.toLowerCase().includes(q);
        const matchDesc = item.activity.description?.toLowerCase().includes(q);
        if (!matchTitle && !matchCompany && !matchDesc) return false;
      }
      return true;
    });
  }, [allActivities, typeFilter, searchQuery]);

  const handleCreateActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeadForNew || !actTitle.trim()) return;

    addLeadActivity(selectedLeadForNew, {
      type: actType,
      title: actTitle,
      description: actDescription,
      date: new Date().toISOString(),
      result: actResult || undefined,
      nextAction: actNextAction || undefined,
      responsibleName: settings.ownerName,
    });

    setActTitle('');
    setActDescription('');
    setActResult('');
    setActNextAction('');
    setShowNewModal(false);
  };

  const getActivityIcon = (type: LeadActivity['type']) => {
    switch (type) {
      case 'whatsapp':
        return <MessageSquare className="w-4 h-4 text-emerald-600" />;
      case 'ligacao':
        return <Phone className="w-4 h-4 text-blue-600" />;
      case 'email':
        return <Mail className="w-4 h-4 text-indigo-600" />;
      case 'reuniao':
        return <Calendar className="w-4 h-4 text-amber-600" />;
      case 'proposta':
        return <FileText className="w-4 h-4 text-purple-600" />;
      default:
        return <Clock className="w-4 h-4 text-neutral-500" />;
    }
  };

  return (
    <div id="activities-view" className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 tracking-tight">
            Atividades & Histórico de Contatos
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Registro cronológico de mensagens, ligações, reuniões e propostas comerciais da operação.
          </p>
        </div>

        <button
          id="open-new-activity-btn"
          onClick={() => setShowNewModal(true)}
          className="px-4 py-2 bg-blue-950 hover:bg-blue-900 text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Atividade</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-3.5 rounded-2xl border border-neutral-200/80 shadow-2xs flex flex-wrap items-center gap-3 text-xs">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
          <input
            id="activities-search-input"
            type="text"
            placeholder="Buscar por assunto, empresa ou resultado..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-neutral-200 rounded-lg text-neutral-900 placeholder-neutral-400 focus:outline-hidden"
          />
        </div>

        <select
          id="activities-filter-type"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-1.5 border border-neutral-200 rounded-lg bg-white font-medium text-neutral-700"
        >
          <option value="ALL">Todos os Tipos</option>
          <option value="whatsapp">WhatsApp</option>
          <option value="ligacao">Ligação Telefônica</option>
          <option value="email">E-mail</option>
          <option value="reuniao">Reunião Online</option>
          <option value="proposta">Proposta Comercial</option>
          <option value="nota">Anotação Interna</option>
        </select>
      </div>

      {/* Activities Timeline List */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-2xs p-6">
        {filteredActivities.length === 0 ? (
          <div className="py-12 text-center text-neutral-400 text-xs">
            Nenhuma atividade comercial registrada ou encontrada com os filtros atuais.
          </div>
        ) : (
          <div className="relative pl-6 border-l-2 border-neutral-200 space-y-6">
            {filteredActivities.map((item) => (
              <div key={item.activity.id} className="relative group">
                {/* Timeline Node */}
                <div className="absolute -left-[33px] top-1.5 w-5 h-5 rounded-full bg-white border-2 border-blue-600 flex items-center justify-center shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-blue-600" />
                </div>

                <div className="p-4 rounded-xl bg-neutral-50/70 border border-neutral-200/80 hover:border-blue-300 transition-colors space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="p-1 rounded-md bg-white border border-neutral-200">
                        {getActivityIcon(item.activity.type)}
                      </span>
                      <h4 className="font-bold text-sm text-neutral-900">{item.activity.title}</h4>
                      <span className="text-[11px] px-2 py-0.5 rounded-md font-semibold bg-neutral-200/60 text-neutral-700 capitalize">
                        {item.activity.type}
                      </span>
                    </div>

                    <span className="text-[11px] text-neutral-500 font-medium">
                      {formatDateTime(item.activity.date)}
                    </span>
                  </div>

                  {/* Lead reference */}
                  <div
                    onClick={() => {
                      setSelectedLeadId(item.leadId);
                      setCurrentTab('leads');
                    }}
                    className="inline-flex items-center gap-1.5 px-2 py-1 bg-white rounded-md border border-neutral-200 text-xs font-semibold text-blue-900 cursor-pointer hover:border-blue-400 transition-colors"
                  >
                    <Building2 className="w-3.5 h-3.5 text-blue-700" />
                    <span>{item.companyName}</span>
                    <span className="text-neutral-400 font-normal">({item.category})</span>
                  </div>

                  <p className="text-xs text-neutral-700 leading-relaxed pt-1">
                    {item.activity.description}
                  </p>

                  {(item.activity.result || item.activity.nextAction) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-neutral-200/60 text-xs">
                      {item.activity.result && (
                        <div className="text-emerald-800 font-medium">
                          <span className="text-neutral-500 font-normal">Resultado: </span>
                          {item.activity.result}
                        </div>
                      )}
                      {item.activity.nextAction && (
                        <div className="text-blue-900 font-medium">
                          <span className="text-neutral-500 font-normal">Próxima Ação: </span>
                          {item.activity.nextAction}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="text-[10px] text-neutral-400 pt-1">
                    Registrado por: {item.activity.responsibleName}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Activity Modal */}
      {showNewModal && (
        <div
          className="fixed inset-0 z-50 bg-neutral-950/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setShowNewModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl border border-neutral-200 w-full max-w-lg p-6 space-y-4 text-neutral-900"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-bold text-neutral-900">Registrar Atividade Comercial</h3>

            <form onSubmit={handleCreateActivity} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Lead Correspondente *</label>
                <select
                  required
                  value={selectedLeadForNew}
                  onChange={(e) => setSelectedLeadForNew(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg bg-white text-neutral-900"
                >
                  {leads.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.companyName} ({l.city})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Tipo de Contato</label>
                  <select
                    value={actType}
                    onChange={(e: any) => setActType(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg bg-white"
                  >
                    <option value="whatsapp">WhatsApp</option>
                    <option value="ligacao">Ligação Telefônica</option>
                    <option value="email">E-mail</option>
                    <option value="reuniao">Reunião Online</option>
                    <option value="proposta">Envio de Proposta</option>
                    <option value="nota">Anotação Interna</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Título do Contato *</label>
                  <input
                    required
                    type="text"
                    placeholder="Ex: Alinhamento de Proposta"
                    value={actTitle}
                    onChange={(e) => setActTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Descrição / Resumo</label>
                <textarea
                  rows={3}
                  placeholder="Detalhes da conversa..."
                  value={actDescription}
                  onChange={(e) => setActDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Resultado</label>
                  <input
                    type="text"
                    placeholder="Ex: Lead demonstrou interesse"
                    value={actResult}
                    onChange={(e) => setActResult(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Próxima Ação</label>
                  <input
                    type="text"
                    placeholder="Ex: Cobrar na sexta-feira"
                    value={actNextAction}
                    onChange={(e) => setActNextAction(e.target.value)}
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
                  className="px-5 py-2 bg-blue-950 text-white font-semibold rounded-lg hover:bg-blue-900"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
