'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { ProjectPriority, ProjectStatus } from '@/types';
import { X, FolderKanban, Sparkles, Building2, Calendar } from 'lucide-react';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedClientId?: string;
}

export function NewProjectModal({
  isOpen,
  onClose,
  preselectedClientId,
}: NewProjectModalProps) {
  const { clients, products, addProject, settings } = useApp();

  const [clientId, setClientId] = useState(preselectedClientId || clients[0]?.id || '');
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [responsibleName, setResponsibleName] = useState(settings.ownerName);
  const [priority, setPriority] = useState<ProjectPriority>('alta');
  const [status, setStatus] = useState<ProjectStatus>('onboarding');
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 20);
    return d.toISOString().split('T')[0];
  });

  if (!isOpen) return null;

  const selectedClient = clients.find((c) => c.id === clientId);
  const selectedProduct = products.find((p) => p.id === selectedProductId);

  const handleProductChange = (prodId: string) => {
    setSelectedProductId(prodId);
    const prod = products.find((p) => p.id === prodId);
    if (prod && selectedClient) {
      setName(`Entrega: ${prod.name} - ${selectedClient.companyName}`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !selectedClient) return;

    // Use phases from product template if available
    const productPhases = selectedProduct?.projectTemplatePhases || selectedProduct?.templatePhases;
    const initialPhases = productPhases && productPhases.length > 0
      ? productPhases.map((tp: any, pIdx: number) => {
          const phaseId = `phase_${Date.now()}_${tp.id || tp.order || pIdx + 1}`;
          return {
            id: phaseId,
            projectId: '',
            title: tp.name || tp.title || `Fase ${pIdx + 1}`,
            order: tp.order || pIdx + 1,
            status: pIdx === 0 ? ('em_andamento' as const) : ('pendente' as const),
            tasks: (tp.tasks || []).map((t: any, idx: number) => ({
              id: `task_${Date.now()}_${pIdx}_${idx}`,
              projectId: '',
              phaseId: phaseId,
              title: t.title,
              status: (pIdx === 0 && idx === 0 ? 'em_andamento' : 'a_fazer') as 'em_andamento' | 'a_fazer',
              priority: 'media' as const,
              dueDate: dueDate,
              responsibleName: responsibleName,
              checklist: (t.checklist || []).map((c: any, cIdx: number) => ({
                id: `chk_${Date.now()}_${pIdx}_${idx}_${cIdx}`,
                title: typeof c === 'string' ? c : c.title,
                isCompleted: false,
                completed: false,
              })),
            })),
          };
        })
      : [
          {
            id: `phase_${Date.now()}_1`,
            projectId: '',
            title: 'Fase 1: Onboarding & Briefing',
            order: 1,
            status: 'em_andamento' as const,
            tasks: [
              {
                id: `task_${Date.now()}_1`,
                projectId: '',
                phaseId: `phase_${Date.now()}_1`,
                title: 'Alinhamento inicial com cliente',
                status: 'a_fazer' as const,
                priority: 'alta' as const,
                dueDate: dueDate,
                responsibleName: responsibleName,
                checklist: [],
              },
            ],
          },
        ];

    addProject({
      name: name || `Projeto ${selectedProduct?.name || 'Entrega'} - ${selectedClient.companyName}`,
      clientId: selectedClient.id,
      clientName: selectedClient.companyName,
      serviceType: selectedProduct?.name || 'Desenvolvimento Web & Marketing',
      status,
      priority,
      progressPercentage: 0,
      startDate: new Date().toISOString().split('T')[0],
      dueDate,
      responsibleName,
      description,
      phases: initialPhases,
      sharedLinks: [],
    });

    onClose();
  };

  return (
    <div
      id="new-project-modal-backdrop"
      className="fixed inset-0 z-50 bg-neutral-950/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in"
      onClick={onClose}
    >
      <div
        id="new-project-modal"
        className="bg-white rounded-2xl shadow-2xl border border-neutral-200 w-full max-w-xl max-h-[90vh] flex flex-col text-neutral-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <div>
            <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2">
              <FolderKanban className="w-5 h-5 text-amber-600" />
              Novo Projeto de Entrega
            </h2>
            <p className="text-xs text-neutral-500">
              Configure as fases, checklists e prazos a partir do catálogo de soluções.
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          <div>
            <label className="font-semibold text-neutral-700 block mb-1">Cliente Vinculado *</label>
            <select
              required
              value={clientId}
              onChange={(e) => {
                setClientId(e.target.value);
                const cl = clients.find((c) => c.id === e.target.value);
                if (cl && selectedProduct) {
                  setName(`Entrega: ${selectedProduct.name} - ${cl.companyName}`);
                }
              }}
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg bg-white text-neutral-900"
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.companyName} ({c.city})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-semibold text-neutral-700 block mb-1">Modelo de Entrega / Solução *</label>
            <select
              value={selectedProductId}
              onChange={(e) => handleProductChange(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg bg-white text-neutral-900 font-medium"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({(p.templatePhases?.length ?? p.projectTemplatePhases?.length ?? 0)} fases pré-programadas)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-semibold text-neutral-700 block mb-1">Nome do Projeto *</label>
            <input
              required
              type="text"
              placeholder="Ex: Criação do Website de Alta Conversão - Prime Dental"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-neutral-900 font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-neutral-700 block mb-1">Prioridade</label>
              <select
                value={priority}
                onChange={(e: any) => setPriority(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg bg-white text-neutral-900 font-medium"
              >
                <option value="baixa">Baixa</option>
                <option value="media">Média</option>
                <option value="alta">Alta</option>
                <option value="urgente">Urgente</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-neutral-700 block mb-1">Status Inicial</label>
              <select
                value={status}
                onChange={(e: any) => setStatus(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg bg-white text-neutral-900 font-medium"
              >
                <option value="onboarding">Onboarding</option>
                <option value="planejamento">Planejamento</option>
                <option value="em_andamento">Em Andamento</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-neutral-700 block mb-1">Prazo de Entrega</label>
              <input
                required
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-neutral-900"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-neutral-700 block mb-1">Responsável Principal</label>
            <input
              type="text"
              value={responsibleName}
              onChange={(e) => setResponsibleName(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-neutral-900"
            />
          </div>

          <div>
            <label className="font-semibold text-neutral-700 block mb-1">Descrição / Escopo Geral</label>
            <textarea
              rows={3}
              placeholder="Objetivos específicos desta entrega..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-neutral-900 resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-neutral-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-neutral-200 rounded-lg text-neutral-700 hover:bg-neutral-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg shadow-sm"
            >
              Criar Projeto
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
