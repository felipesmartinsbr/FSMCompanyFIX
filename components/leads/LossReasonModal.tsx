'use client';

import React, { useState } from 'react';
import { Lead } from '@/types';
import { useApp } from '@/context/AppContext';
import { X, AlertOctagon, HelpCircle } from 'lucide-react';

interface LossReasonModalProps {
  isOpen: boolean;
  lead: Lead | null;
  onClose: () => void;
  onConfirm?: (leadId: string, reason: string, customNote?: string) => void;
}

export const PREDEFINED_LOSS_REASONS = [
  'Preço',
  'Sem orçamento',
  'Não respondeu',
  'Escolheu concorrente',
  'Não possui interesse',
  'Momento inadequado',
  'Serviço não adequado',
  'Dados inválidos',
  'Outro',
];

export function LossReasonModal({
  isOpen,
  lead,
  onClose,
  onConfirm,
}: LossReasonModalProps) {
  const { markLeadAsLost } = useApp();
  const [selectedReason, setSelectedReason] = useState<string>(PREDEFINED_LOSS_REASONS[0]);
  const [customNote, setCustomNote] = useState('');

  if (!isOpen || !lead) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReason) return;
    if (onConfirm) {
      onConfirm(lead.id, selectedReason, customNote.trim() || undefined);
    } else {
      markLeadAsLost(lead.id, selectedReason, customNote.trim() || undefined);
    }
    onClose();
  };

  return (
    <div
      id="loss-reason-backdrop"
      className="fixed inset-0 z-50 bg-neutral-950/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="loss-reason-modal"
        className="bg-white rounded-2xl shadow-2xl border border-neutral-200 w-full max-w-md flex flex-col text-neutral-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-rose-50/60 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900">
                Registrar Motivo de Perda
              </h2>
              <p className="text-xs text-neutral-600 truncate max-w-[240px]">
                {lead.companyName}
              </p>
            </div>
          </div>
          <button
            id="close-loss-modal-btn"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/80 text-neutral-600 leading-relaxed">
            O lead será mantido no sistema com o status <strong className="text-rose-700">Perdido</strong> para análise de taxa de conversão e histórico comercial.
          </div>

          <div>
            <label className="font-bold text-neutral-800 block mb-2">
              Qual foi o motivo principal da perda?
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PREDEFINED_LOSS_REASONS.map((reason) => (
                <label
                  key={reason}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all ${
                    selectedReason === reason
                      ? 'border-rose-600 bg-rose-50/70 text-rose-950 font-bold shadow-2xs'
                      : 'border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="lossReason"
                    value={reason}
                    checked={selectedReason === reason}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    className="text-rose-600 focus:ring-rose-500"
                  />
                  <span>{reason}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="font-semibold text-neutral-700 block mb-1">
              Observações ou feedback do prospect (opcional):
            </label>
            <textarea
              id="loss-custom-note"
              rows={3}
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              placeholder="Ex: Cliente optou por fechar com agência local por proximidade física..."
              className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-neutral-900 placeholder-neutral-400 focus:ring-1 focus:ring-rose-600 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 border border-neutral-200 rounded-lg text-neutral-700 hover:bg-neutral-50 font-semibold"
            >
              Cancelar
            </button>
            <button
              id="confirm-loss-btn"
              type="submit"
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold shadow-2xs transition-colors"
            >
              Confirmar Perda
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
