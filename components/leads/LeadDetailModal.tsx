'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Lead, LeadActivity, LeadTemperature } from '@/types';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/formatters';
import {
  X,
  Building2,
  Phone,
  Mail,
  MapPin,
  Globe,
  ExternalLink,
  Sparkles,
  Calendar,
  MessageSquare,
  Clock,
  User,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  FileText,
  Star,
  XCircle,
} from 'lucide-react';
import { LossReasonModal } from './LossReasonModal';

interface LeadDetailModalProps {
  leadId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenConvertModal?: (lead: Lead) => void;
  onOpenConvertLead?: (lead: Lead) => void;
}

export function LeadDetailModal({
  leadId,
  isOpen,
  onClose,
  onOpenConvertModal,
  onOpenConvertLead,
}: LeadDetailModalProps) {
  const triggerConvert = onOpenConvertLead || onOpenConvertModal || (() => {});
  const { leads, updateLead, deleteLead, moveLeadStage, stages, addLeadActivity, settings } = useApp();

  const lead = leads.find((l) => l.id === leadId);

  // New activity form state
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [isLossModalOpen, setIsLossModalOpen] = useState(false);
  const [actType, setActType] = useState<LeadActivity['type']>('whatsapp');
  const [actTitle, setActTitle] = useState('');
  const [actDescription, setActDescription] = useState('');
  const [actResult, setActResult] = useState('');
  const [actNextAction, setActNextAction] = useState('');

  if (!isOpen || !lead) return null;

  const currentStage = stages.find((s) => s.id === lead.stageId);

  const handleStageChange = (newStageId: string) => {
    if (newStageId === 'perdido') {
      setIsLossModalOpen(true);
    } else if (newStageId === 'ganho') {
      triggerConvert(lead);
    } else {
      moveLeadStage(lead.id, newStageId);
    }
  };

  const handleTempChange = (newTemp: LeadTemperature) => {
    updateLead(lead.id, { temperature: newTemp });
  };

  const handleCreateActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actTitle.trim()) return;

    addLeadActivity(lead.id, {
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
    setShowActivityForm(false);
  };

  const handleDelete = () => {
    if (confirm(`Deseja realmente excluir o lead ${lead.companyName}?`)) {
      deleteLead(lead.id);
      onClose();
    }
  };

  return (
    <div
      id="lead-detail-backdrop"
      className="fixed inset-0 z-50 bg-neutral-950/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="lead-detail-modal"
        className="bg-white rounded-2xl shadow-2xl border border-neutral-200 w-full max-w-3xl max-h-[90vh] flex flex-col text-neutral-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-neutral-100">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center font-bold flex-shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold text-neutral-900">{lead.companyName}</h2>
                <span
                  className="px-2 py-0.5 rounded-md text-[11px] font-bold"
                  style={{
                    backgroundColor: `${currentStage?.color || '#3b82f6'}20`,
                    color: currentStage?.color || '#3b82f6',
                  }}
                >
                  {currentStage?.name || lead.stageId}
                </span>
                {lead.status === 'ganho' && (
                  <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-800">
                    Ganho / Fechado
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">
                {lead.category} • {lead.city}, {lead.state} - {lead.country}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {lead.status !== 'ganho' && lead.status !== 'perdido' && (
              <button
                id="lead-lost-btn"
                type="button"
                onClick={() => setIsLossModalOpen(true)}
                className="px-3 py-1.5 border border-rose-200 text-rose-700 hover:bg-rose-50 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Marcar como Perdido</span>
              </button>
            )}

            {lead.status !== 'ganho' && (
              <button
                id="lead-convert-btn"
                onClick={() => triggerConvert(lead)}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Converter em Cliente</span>
              </button>
            )}
            <button
              id="close-lead-detail-btn"
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Tabs / Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          {/* Banner if lead is lost */}
          {lead.status === 'perdido' && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-1 text-rose-950 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="font-bold flex items-center gap-1.5 text-rose-800">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  Oportunidade Arquivada como Perdida
                </span>
                <button
                  type="button"
                  onClick={() => moveLeadStage(lead.id, 'contato')}
                  className="px-2.5 py-1 bg-white border border-rose-300 text-rose-800 hover:bg-rose-100 rounded-md text-[11px] font-bold transition-colors"
                >
                  Reabrir Lead no Funil
                </button>
              </div>
              <div className="text-xs text-rose-900 pt-1">
                <strong>Motivo principal:</strong> {lead.lossReason || 'Não informado'}
              </div>
              {lead.lossCustomNote && (
                <div className="text-[11px] text-rose-700">
                  <strong>Observações:</strong> {lead.lossCustomNote}
                </div>
              )}
            </div>
          )}
          {/* Quick Actions Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-neutral-50 rounded-xl border border-neutral-200/80">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-neutral-600">Etapa:</span>
              <select
                id="lead-stage-select-detail"
                value={lead.stageId}
                onChange={(e) => handleStageChange(e.target.value)}
                className="bg-white border border-neutral-200 rounded-lg px-2.5 py-1 font-medium text-neutral-800 focus:outline-hidden"
              >
                {stages.map((stg) => (
                  <option key={stg.id} value={stg.id}>
                    {stg.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-semibold text-neutral-600">Temperatura:</span>
              <select
                id="lead-temp-select-detail"
                value={lead.temperature}
                onChange={(e: any) => handleTempChange(e.target.value)}
                className="bg-white border border-neutral-200 rounded-lg px-2.5 py-1 font-medium text-neutral-800 focus:outline-hidden"
              >
                <option value="frio">❄️ Frio</option>
                <option value="morno">🌤️ Morno</option>
                <option value="quente">🔥 Quente</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowActivityForm((prev) => !prev)}
                className="px-3 py-1 bg-blue-950 text-white rounded-lg font-medium hover:bg-blue-900 transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Registrar Atividade</span>
              </button>
              <button
                onClick={handleDelete}
                className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                title="Excluir lead"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Form to log activity if opened */}
          {showActivityForm && (
            <form
              onSubmit={handleCreateActivity}
              className="p-4 bg-blue-50/50 rounded-xl border border-blue-200 space-y-3 animate-in fade-in"
            >
              <h4 className="font-bold text-blue-950 text-xs flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-blue-700" />
                Registrar Nova Atividade Comercial
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="text-neutral-700 block mb-1">Tipo de Contato</label>
                  <select
                    value={actType}
                    onChange={(e: any) => setActType(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-neutral-200 bg-white rounded-lg text-neutral-900"
                  >
                    <option value="whatsapp">WhatsApp</option>
                    <option value="ligacao">Ligação Telefônica</option>
                    <option value="email">E-mail</option>
                    <option value="reuniao">Reunião Online</option>
                    <option value="proposta">Envio de Proposta</option>
                    <option value="nota">Anotação Interna</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="text-neutral-700 block mb-1">Título da Atividade *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Mensagem enviada apresentando o combo site + GBP"
                    value={actTitle}
                    onChange={(e) => setActTitle(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-neutral-200 bg-white rounded-lg text-neutral-900"
                  />
                </div>
              </div>

              <div>
                <label className="text-neutral-700 block mb-1">Resumo da Conversa / Detalhes</label>
                <textarea
                  rows={2}
                  placeholder="O que o cliente disse, principais dúvidas ou reações..."
                  value={actDescription}
                  onChange={(e) => setActDescription(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-neutral-200 bg-white rounded-lg text-neutral-900 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-neutral-700 block mb-1">Resultado / Status</label>
                  <input
                    type="text"
                    placeholder="Ex: Pediu proposta formal para amanhã"
                    value={actResult}
                    onChange={(e) => setActResult(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-neutral-200 bg-white rounded-lg text-neutral-900"
                  />
                </div>
                <div>
                  <label className="text-neutral-700 block mb-1">Próxima Ação Definida</label>
                  <input
                    type="text"
                    placeholder="Ex: Enviar PDF e cobrar feedback na quarta"
                    value={actNextAction}
                    onChange={(e) => setActNextAction(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-neutral-200 bg-white rounded-lg text-neutral-900"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowActivityForm(false)}
                  className="px-3 py-1.5 border border-neutral-200 rounded-lg hover:bg-white text-neutral-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-950 text-white rounded-lg font-semibold hover:bg-blue-900"
                >
                  Salvar Atividade
                </button>
              </div>
            </form>
          )}

          {/* 2 Column Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Col 1: Dados Comerciais & Empresa */}
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-neutral-200 bg-white space-y-3">
                <h4 className="font-bold text-neutral-900 border-b border-neutral-100 pb-1">
                  Oportunidade Comercial
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-neutral-500 block text-[11px]">Valor Estimado</span>
                    <span className="font-bold text-neutral-900 text-sm">
                      {formatCurrency(lead.estimatedValue, lead.currency)}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block text-[11px]">Probabilidade</span>
                    <span className="font-bold text-neutral-900 text-sm">
                      {lead.closingProbability}%
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-neutral-500 block text-[11px]">Solução de Interesse</span>
                    <span className="font-semibold text-blue-900">{lead.serviceOfInterest}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block text-[11px]">Origem</span>
                    <span className="font-medium text-neutral-800">{lead.source}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block text-[11px]">Responsável</span>
                    <span className="font-medium text-neutral-800">{lead.responsibleName}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block text-[11px]">Próximo Follow-up</span>
                    <span className="font-medium text-amber-800">{formatDate(lead.nextFollowUpDate)}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block text-[11px]">Data de Entrada</span>
                    <span className="font-medium text-neutral-600">{formatDate(lead.createdAt)}</span>
                  </div>
                </div>
              </div>

              {/* Presença Digital & Google Maps */}
              <div className="p-4 rounded-xl border border-neutral-200 bg-white space-y-3">
                <h4 className="font-bold text-neutral-900 border-b border-neutral-100 pb-1">
                  Presença Digital & Google Maps
                </h4>
                <div className="space-y-2 text-xs">
                  {lead.googleRating && (
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-500">Avaliação Google:</span>
                      <span className="flex items-center gap-1 font-bold text-amber-600">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        {lead.googleRating} ({lead.reviewCount || 0} avaliações)
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500">Status Google Meu Negócio:</span>
                    <span className="font-semibold text-neutral-800">{lead.gbpStatus || 'Não informado'}</span>
                  </div>

                  {lead.googleMapsUrl && (
                    <a
                      href={lead.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-700 hover:underline flex items-center gap-1 font-medium pt-1"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>Ver Ficha no Google Maps</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}

                  {lead.website && (
                    <a
                      href={lead.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-700 hover:underline flex items-center gap-1 font-medium"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>Website Oficial</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>

              {/* Contatos */}
              <div className="p-4 rounded-xl border border-neutral-200 bg-white space-y-2">
                <h4 className="font-bold text-neutral-900 border-b border-neutral-100 pb-1">
                  Decisores & Contatos
                </h4>
                {lead.contacts.length === 0 ? (
                  <div className="text-neutral-500 text-xs space-y-1">
                    <p>Telefone: <strong>{lead.phone || lead.whatsapp || '-'}</strong></p>
                    <p>E-mail: <strong>{lead.email || '-'}</strong></p>
                  </div>
                ) : (
                  lead.contacts.map((c) => (
                    <div key={c.id} className="p-2.5 bg-neutral-50 rounded-lg border border-neutral-200 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-neutral-900">{c.name}</span>
                        <span className="text-[10px] text-neutral-500">{c.role}</span>
                      </div>
                      <div className="flex flex-wrap gap-3 text-[11px] text-neutral-600">
                        {c.whatsapp && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-emerald-600" />
                            {c.whatsapp}
                          </span>
                        )}
                        {c.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3 text-blue-600" />
                            {c.email}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Col 2: Timeline de Atividades */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-neutral-900 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-neutral-500" />
                  Histórico de Atividades & Interações ({lead.activities.length})
                </h4>
              </div>

              {lead.activities.length === 0 ? (
                <div className="p-8 text-center bg-neutral-50 rounded-xl border border-neutral-200 text-neutral-500">
                  <p>Nenhuma atividade registrada ainda.</p>
                  <button
                    onClick={() => setShowActivityForm(true)}
                    className="mt-2 text-blue-700 font-semibold hover:underline"
                  >
                    Registrar o primeiro contato &rarr;
                  </button>
                </div>
              ) : (
                <div className="relative pl-6 border-l-2 border-neutral-200 space-y-4">
                  {lead.activities.map((act) => (
                    <div key={act.id} className="relative">
                      {/* Circle icon */}
                      <span className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-blue-600 border-2 border-white shadow-xs" />
                      <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-neutral-900">{act.title}</span>
                          <span className="text-[10px] text-neutral-500">{formatDateTime(act.date)}</span>
                        </div>
                        <p className="text-neutral-700 text-[11px] leading-relaxed">{act.description}</p>
                        {act.result && (
                          <p className="text-[10px] text-emerald-700 font-medium">
                            Resultado: {act.result}
                          </p>
                        )}
                        {act.nextAction && (
                          <p className="text-[10px] text-blue-800 font-medium">
                            Próxima ação: {act.nextAction}
                          </p>
                        )}
                        <span className="text-[10px] text-neutral-400 block pt-0.5">
                          Por: {act.responsibleName}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <LossReasonModal
        lead={lead}
        isOpen={isLossModalOpen}
        onClose={() => setIsLossModalOpen(false)}
      />
    </div>
  );
}
