'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Project, ProjectPriority, ProjectStatus, ProjectTask } from '@/types';
import { formatDate, isDateOverdue } from '@/lib/formatters';
import {
  X,
  FolderKanban,
  CheckCircle2,
  Circle,
  Clock,
  AlertTriangle,
  Plus,
  Trash2,
  Calendar,
  User,
  Link2,
  ExternalLink,
  CheckSquare,
  Unlock,
  PlayCircle,
  ShieldAlert,
} from 'lucide-react';

interface ProjectDetailModalProps {
  projectId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProjectDetailModal({
  projectId,
  isOpen,
  onClose,
}: ProjectDetailModalProps) {
  const {
    projects,
    updateProject,
    deleteProject,
    toggleTaskStatus,
    toggleChecklistItem,
    addProjectTask,
    addProjectPhase,
    releaseProject,
    startProjectExecution,
    settings,
  } = useApp();

  const [activePhaseId, setActivePhaseId] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPhaseId, setNewTaskPhaseId] = useState('');
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [newPhaseName, setNewPhaseName] = useState('');
  const [showNewPhaseForm, setShowNewPhaseForm] = useState(false);

  // Link form
  const [linkTitle, setLinkTitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkType, setLinkType] = useState<'figma' | 'staging' | 'drive' | 'github' | 'other'>('staging');
  const [showAddLink, setShowAddLink] = useState(false);

  const project = projects.find((p) => p.id === projectId);
  if (!isOpen || !project) return null;

  const isOverdue = isDateOverdue(project.dueDate) && project.status !== 'concluido';

  // Calculate total tasks and completed tasks
  let totalTasks = 0;
  let completedTasks = 0;
  project.phases.forEach((ph) => {
    ph.tasks.forEach((t) => {
      totalTasks++;
      if (t.status === 'concluida') completedTasks++;
    });
  });

  const autoProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : project.progressPercentage;

  const handleStatusChange = (newStatus: ProjectStatus) => {
    updateProject(project.id, {
      status: newStatus,
      progressPercentage: newStatus === 'concluido' ? 100 : project.progressPercentage,
    });
  };

  const handlePriorityChange = (newPriority: ProjectPriority) => {
    updateProject(project.id, { priority: newPriority });
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !newTaskPhaseId) return;

    addProjectTask(project.id, newTaskPhaseId, {
      title: newTaskTitle,
      status: 'pendente',
      priority: 'media',
      dueDate: project.dueDate,
      responsibleName: project.responsibleName,
      checklist: [],
    });

    setNewTaskTitle('');
    setShowNewTaskForm(false);
  };

  const handleCreatePhase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhaseName.trim()) return;

    addProjectPhase(project.id, newPhaseName);
    setNewPhaseName('');
    setShowNewPhaseForm(false);
  };

  const handleAddLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkTitle || !linkUrl) return;

    updateProject(project.id, {
      sharedLinks: [
        ...(project.sharedLinks || []),
        {
          id: `link_${Date.now()}`,
          title: linkTitle,
          url: linkUrl,
          type: linkType,
        },
      ],
    });

    setLinkTitle('');
    setLinkUrl('');
    setShowAddLink(false);
  };

  const handleDelete = () => {
    if (confirm(`Deseja realmente excluir o projeto ${project.name}?`)) {
      deleteProject(project.id);
      onClose();
    }
  };

  return (
    <div
      id="project-detail-backdrop"
      className="fixed inset-0 z-50 bg-neutral-950/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in"
      onClick={onClose}
    >
      <div
        id="project-detail-modal"
        className="bg-white rounded-2xl shadow-2xl border border-neutral-200 w-full max-w-4xl max-h-[90vh] flex flex-col text-neutral-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-neutral-100 bg-neutral-50/50">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold flex-shrink-0">
              <FolderKanban className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold text-neutral-900">{project.name}</h2>
                <select
                  value={project.status}
                  onChange={(e: any) => handleStatusChange(e.target.value)}
                  className="px-2.5 py-0.5 rounded-md text-xs font-bold capitalize bg-white border border-neutral-200 focus:outline-hidden"
                >
                  <option value="aguardando_pagamento">Aguardando Pagamento</option>
                  <option value="liberado">Liberado</option>
                  <option value="onboarding">Onboarding</option>
                  <option value="planejamento">Planejamento</option>
                  <option value="em_andamento">Em Andamento</option>
                  <option value="aguardando_cliente">Aguardando Cliente</option>
                  <option value="em_revisao">Em Revisão</option>
                  <option value="concluido">Concluído</option>
                  <option value="cancelado">Cancelado</option>
                </select>
                <select
                  value={project.priority}
                  onChange={(e: any) => handlePriorityChange(e.target.value)}
                  className="px-2 py-0.5 rounded-md text-[11px] font-semibold capitalize bg-white border border-neutral-200"
                >
                  <option value="baixa">Baixa</option>
                  <option value="media">Média</option>
                  <option value="alta">Alta</option>
                  <option value="urgente">Urgente</option>
                </select>
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">
                Cliente: <strong className="text-neutral-800">{project.clientName}</strong> • {project.serviceType}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={onClose} className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Progress & Meta Bar */}
        <div className="px-6 py-3 bg-white border-b border-neutral-100 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-4 flex-wrap">
            <div>
              <span className="text-neutral-500 text-[11px] block">Prazo de Entrega:</span>
              <span className={`font-bold ${isOverdue ? 'text-rose-600' : 'text-neutral-800'}`}>
                {formatDate(project.dueDate)} {isOverdue && '(Vencido!)'}
              </span>
            </div>
            {project.actualStartDate && (
              <div>
                <span className="text-neutral-500 text-[11px] block">Início Real:</span>
                <span className="font-semibold text-emerald-700">
                  {formatDate(project.actualStartDate)}
                </span>
              </div>
            )}
            <div>
              <span className="text-neutral-500 text-[11px] block">Responsável:</span>
              <span className="font-semibold text-neutral-800">{project.responsibleName}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-neutral-500 text-[11px] block">Progresso Geral</span>
              <span className="font-bold text-neutral-900">{autoProgress}%</span>
            </div>
            <div className="w-28 bg-neutral-100 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${autoProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          {/* Lifecycle Action Banners */}
          {project.status === 'aguardando_pagamento' && (
            <div
              id="project-awaiting-payment-banner"
              className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2 animate-in fade-in"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-amber-950 text-xs sm:text-sm">
                      Aguardando Confirmação de Pagamento
                    </h4>
                    <p className="text-amber-800 text-[11px] mt-0.5 leading-relaxed">
                      Este projeto foi cadastrado com condição comercial que exige recebimento de entrada. O projeto é liberado automaticamente ao marcar o recebimento no financeiro ou manualmente pelo gestor.
                    </p>
                  </div>
                </div>
                <button
                  id="release-project-manual-btn"
                  type="button"
                  onClick={() => {
                    const reason = prompt('Informe a justificativa para liberação manual:', 'Liberação autorizada pelo gestor de operações');
                    if (reason !== null) {
                      releaseProject(project.id, reason);
                    }
                  }}
                  className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors flex-shrink-0"
                >
                  <Unlock className="w-3.5 h-3.5" />
                  <span>Liberar Manualmente</span>
                </button>
              </div>
            </div>
          )}

          {project.status === 'liberado' && (
            <div
              id="project-released-banner"
              className="p-4 bg-cyan-50 border border-cyan-200 rounded-xl space-y-2 animate-in fade-in"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <Unlock className="w-5 h-5 text-cyan-700 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-cyan-950 text-xs sm:text-sm">
                      Projeto Liberado para Início
                    </h4>
                    <p className="text-cyan-800 text-[11px] mt-0.5 leading-relaxed">
                      A condição financeira foi validada ou autorizada com sucesso. Inicie a execução oficial para mobilizar o time e computar a data de início real.
                    </p>
                  </div>
                </div>
                <button
                  id="start-project-execution-btn"
                  type="button"
                  onClick={() => startProjectExecution(project.id)}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors flex-shrink-0"
                >
                  <PlayCircle className="w-4 h-4" />
                  <span>Iniciar Execução Oficial</span>
                </button>
              </div>
            </div>
          )}
          {/* Fases e Tarefas Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-neutral-900 flex items-center gap-1.5">
                <CheckSquare className="w-4 h-4 text-blue-700" />
                Fases do Projeto, Tarefas e Checklists
              </h3>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowNewPhaseForm((prev) => !prev)}
                  className="px-2.5 py-1 text-xs font-semibold bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg transition-colors"
                >
                  + Nova Fase
                </button>
                <button
                  onClick={() => {
                    setNewTaskPhaseId(project.phases[0]?.id || '');
                    setShowNewTaskForm((prev) => !prev);
                  }}
                  className="px-3 py-1 text-xs font-semibold bg-blue-950 hover:bg-blue-900 text-white rounded-lg transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Nova Tarefa</span>
                </button>
              </div>
            </div>

            {/* New Phase Form */}
            {showNewPhaseForm && (
              <form onSubmit={handleCreatePhase} className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 flex gap-2">
                <input
                  required
                  type="text"
                  placeholder="Nome da nova fase (ex: Fase 4: Otimização de SEO)"
                  value={newPhaseName}
                  onChange={(e) => setNewPhaseName(e.target.value)}
                  className="flex-1 px-3 py-1.5 border border-neutral-200 rounded-lg bg-white"
                />
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-950 text-white font-semibold rounded-lg hover:bg-blue-900"
                >
                  Adicionar
                </button>
              </form>
            )}

            {/* New Task Form */}
            {showNewTaskForm && (
              <form onSubmit={handleCreateTask} className="p-4 bg-blue-50/60 rounded-xl border border-blue-200 space-y-3">
                <h4 className="font-bold text-blue-950">Adicionar Tarefa a uma Fase</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-neutral-700 block mb-1">Fase de Destino</label>
                    <select
                      value={newTaskPhaseId}
                      onChange={(e) => setNewTaskPhaseId(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-neutral-200 rounded-lg bg-white"
                    >
                      {project.phases.map((ph) => (
                        <option key={ph.id} value={ph.id}>
                          {ph.name || ph.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-neutral-700 block mb-1">Título da Tarefa</label>
                    <input
                      required
                      type="text"
                      placeholder="Ex: Configurar domínio e DNS da Cloudflare"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-neutral-200 rounded-lg bg-white"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowNewTaskForm(false)}
                    className="px-3 py-1 border border-neutral-200 rounded-lg hover:bg-white"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1 bg-blue-950 text-white font-semibold rounded-lg"
                  >
                    Salvar Tarefa
                  </button>
                </div>
              </form>
            )}

            {/* Phases Accordion / List */}
            <div className="space-y-4">
              {project.phases.map((phase) => (
                <div
                  key={phase.id}
                  className="border border-neutral-200 rounded-xl overflow-hidden bg-white shadow-2xs"
                >
                  <div className="px-4 py-2.5 bg-neutral-50/90 border-b border-neutral-200 flex items-center justify-between font-bold text-neutral-800">
                    <span>{phase.name}</span>
                    <span className="text-[11px] font-normal text-neutral-500">
                      {phase.tasks.filter((t) => t.status === 'concluida').length} de {phase.tasks.length} concluídas
                    </span>
                  </div>

                  <div className="divide-y divide-neutral-100 p-2">
                    {phase.tasks.map((task) => (
                      <div key={task.id} className="p-2.5 hover:bg-neutral-50/50 rounded-lg space-y-2">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <button
                              onClick={() => toggleTaskStatus(project.id, phase.id, task.id)}
                              className="text-neutral-400 hover:text-emerald-600 transition-colors"
                            >
                              {task.status === 'concluida' ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-100" />
                              ) : (
                                <Circle className="w-4 h-4" />
                              )}
                            </button>
                            <span
                              className={`font-semibold ${
                                task.status === 'concluida'
                                  ? 'line-through text-neutral-400'
                                  : 'text-neutral-900'
                              }`}
                            >
                              {task.title}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-[11px] text-neutral-500">
                            <span>{task.responsibleName}</span>
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-semibold capitalize ${
                                task.status === 'concluida'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-neutral-100 text-neutral-600'
                              }`}
                            >
                              {task.status}
                            </span>
                          </div>
                        </div>

                        {/* Checklist items */}
                        {task.checklist && task.checklist.length > 0 && (
                          <div className="pl-7 space-y-1 pt-1">
                            {task.checklist.map((item) => (
                              <label
                                key={item.id}
                                className="flex items-center gap-2 text-[11px] text-neutral-600 cursor-pointer hover:text-neutral-900"
                              >
                                <input
                                  type="checkbox"
                                  checked={item.isCompleted}
                                  onChange={() =>
                                    toggleChecklistItem(project.id, phase.id, task.id, item.id)
                                  }
                                  className="w-3.5 h-3.5 rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                                />
                                <span className={item.isCompleted ? 'line-through text-neutral-400' : ''}>
                                  {item.title}
                                </span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}

                    {phase.tasks.length === 0 && (
                      <div className="py-3 text-center text-neutral-400 text-xs">
                        Nenhuma tarefa nesta fase.
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Links de Entrega & Staging */}
          <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-neutral-900 flex items-center gap-1.5">
                <Link2 className="w-4 h-4 text-blue-700" />
                Ambientes de Staging, Figma & Repositórios
              </span>
              <button
                onClick={() => setShowAddLink((prev) => !prev)}
                className="text-xs text-blue-700 font-semibold hover:underline"
              >
                + Adicionar Link
              </button>
            </div>

            {showAddLink && (
              <form onSubmit={handleAddLink} className="p-3 bg-white rounded-lg border border-neutral-200 space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <input
                      required
                      type="text"
                      placeholder="Título (ex: Staging Vercel)"
                      value={linkTitle}
                      onChange={(e) => setLinkTitle(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-neutral-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <input
                      required
                      type="url"
                      placeholder="https://..."
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-neutral-200 rounded-lg"
                    />
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={linkType}
                      onChange={(e: any) => setLinkType(e.target.value)}
                      className="flex-1 px-2 py-1.5 border border-neutral-200 rounded-lg bg-white"
                    >
                      <option value="staging">Staging</option>
                      <option value="figma">Figma</option>
                      <option value="github">GitHub</option>
                      <option value="drive">Drive</option>
                    </select>
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-blue-950 text-white rounded-lg font-semibold"
                    >
                      Salvar
                    </button>
                  </div>
                </div>
              </form>
            )}

            <div className="flex flex-wrap gap-2">
              {(project.sharedLinks || []).map((link: any) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-white border border-neutral-200 rounded-lg font-medium text-neutral-800 hover:border-blue-400 flex items-center gap-1.5 transition-colors"
                >
                  <span>{link.title}</span>
                  <ExternalLink className="w-3 h-3 text-neutral-400" />
                </a>
              ))}
              {(!project.sharedLinks || project.sharedLinks.length === 0) && (
                <span className="text-neutral-400 text-xs">Nenhum link configurado para este projeto.</span>
              )}
            </div>
          </div>

          {/* Footer actions */}
          <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
            <button
              onClick={handleDelete}
              className="text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1"
            >
              <Trash2 className="w-4 h-4" />
              <span>Excluir Projeto</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 bg-neutral-900 text-white font-bold rounded-lg hover:bg-neutral-800"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
