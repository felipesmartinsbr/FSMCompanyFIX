'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { Project, ProjectPriority, ProjectStatus } from '@/types';
import { formatDate, isDateOverdue } from '@/lib/formatters';
import { exportProjectsToExcel } from '@/lib/excelExport';
import {
  FolderKanban,
  Search,
  Plus,
  Download,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Calendar,
  User,
  Filter,
  ArrowRight,
} from 'lucide-react';

interface ProjectsViewProps {
  onOpenNewProject: () => void;
}

export function ProjectsView({ onOpenNewProject }: ProjectsViewProps) {
  const {
    projects,
    selectedProjectId,
    setSelectedProjectId,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      if (statusFilter !== 'ALL' && p.status !== statusFilter) return false;
      if (priorityFilter !== 'ALL' && p.priority !== priorityFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = (p.name || '').toLowerCase().includes(q);
        const matchClient = (p.clientName || '').toLowerCase().includes(q);
        const matchService = (p.serviceType || p.solutionName || '').toLowerCase().includes(q);
        if (!matchName && !matchClient && !matchService) return false;
      }
      return true;
    });
  }, [projects, statusFilter, priorityFilter, searchQuery]);

  const handleExportExcel = () => {
    exportProjectsToExcel(filteredProjects, `FSM_Projetos_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div id="projects-view" className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-neutral-900 tracking-tight">
              Gestão de Projetos & Entregas
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
              {filteredProjects.length} projetos
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">
            Acompanhe fases, checklists de qualidade, prazos de entrega e responsabilidades da equipe.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="export-projects-btn"
            onClick={handleExportExcel}
            className="px-3.5 py-1.5 bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-700 rounded-lg text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Exportar Excel</span>
          </button>
          <button
            id="open-new-project-btn"
            onClick={onOpenNewProject}
            className="px-4 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Projeto</span>
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-neutral-200/80 shadow-2xs flex flex-wrap items-center gap-3 text-xs">
        <div className="flex-1 min-w-[220px] relative">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
          <input
            id="projects-search-input"
            type="text"
            placeholder="Buscar por projeto, cliente ou serviço..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-neutral-200 rounded-lg text-neutral-900 placeholder-neutral-400 focus:outline-hidden"
          />
        </div>

        <select
          id="projects-filter-status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-1.5 border border-neutral-200 rounded-lg bg-white text-neutral-700 font-medium"
        >
          <option value="ALL">Status: Todos</option>
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
          id="projects-filter-priority"
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="px-3 py-1.5 border border-neutral-200 rounded-lg bg-white text-neutral-700 font-medium"
        >
          <option value="ALL">Prioridade: Todas</option>
          <option value="urgente">Urgente</option>
          <option value="alta">Alta</option>
          <option value="media">Média</option>
          <option value="baixa">Baixa</option>
        </select>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProjects.map((project) => {
          const isOverdue = isDateOverdue(project.dueDate) && project.status !== 'concluido';
          
          let totalTasks = 0;
          let completedTasks = 0;
          project.phases.forEach((ph) => {
            ph.tasks.forEach((t) => {
              totalTasks++;
              if (t.status === 'concluida') completedTasks++;
            });
          });

          return (
            <div
              key={project.id}
              onClick={() => setSelectedProjectId(project.id)}
              className="bg-white rounded-2xl p-5 border border-neutral-200/80 hover:border-amber-400 shadow-2xs hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">
                      {project.clientName}
                    </span>
                    <h3 className="font-bold text-sm text-neutral-900 mt-0.5 leading-snug">
                      {project.name}
                    </h3>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize flex-shrink-0 ${
                      project.status === 'concluido'
                        ? 'bg-emerald-100 text-emerald-800'
                        : project.status === 'aguardando_pagamento'
                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                        : project.status === 'liberado'
                        ? 'bg-cyan-100 text-cyan-900 border border-cyan-200'
                        : project.status === 'em_andamento'
                        ? 'bg-blue-100 text-blue-800'
                        : project.status === 'aguardando_cliente'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-neutral-100 text-neutral-700'
                    }`}
                  >
                    {project.status === 'aguardando_pagamento'
                      ? 'Aguardando Pagamento'
                      : project.status === 'liberado'
                      ? 'Liberado'
                      : project.status.replace('_', ' ')}
                  </span>
                </div>

                <p className="text-[11px] text-neutral-500 line-clamp-2">
                  {project.description || project.serviceType}
                </p>

                {/* Meta info */}
                <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-1">
                  <span>Resp: {project.responsibleName}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-semibold capitalize ${
                      project.priority === 'urgente'
                        ? 'bg-rose-100 text-rose-800'
                        : project.priority === 'alta'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-neutral-100 text-neutral-600'
                    }`}
                  >
                    {project.priority}
                  </span>
                </div>
              </div>

              {/* Progress & Due date footer */}
              <div className="pt-3 border-t border-neutral-100 space-y-2 text-xs">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-neutral-500">
                    {completedTasks} de {totalTasks} tarefas concluídas
                  </span>
                  <span className="font-bold text-neutral-900">{project.progressPercentage}%</span>
                </div>

                <div className="w-full bg-neutral-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-amber-600 h-2 rounded-full transition-all"
                    style={{ width: `${project.progressPercentage}%` }}
                  />
                </div>

                <div className="flex items-center justify-between pt-1 text-[11px]">
                  <span
                    className={`flex items-center gap-1 ${
                      isOverdue ? 'text-rose-600 font-bold' : 'text-neutral-500'
                    }`}
                  >
                    <Clock className="w-3 h-3" />
                    Prazo: {formatDate(project.dueDate)} {isOverdue && '(Vencido)'}
                  </span>

                  <span className="text-blue-700 font-semibold flex items-center gap-0.5">
                    Detalhes <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {filteredProjects.length === 0 && (
          <div className="col-span-full py-16 text-center text-neutral-400 bg-white rounded-2xl border border-dashed border-neutral-200">
            Nenhum projeto cadastrado ou encontrado com os filtros selecionados.
          </div>
        )}
      </div>
    </div>
  );
}
