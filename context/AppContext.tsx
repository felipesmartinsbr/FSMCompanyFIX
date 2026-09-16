'use client';

import React, { createContext, useContext, useEffect, useState, useMemo, useRef } from 'react';
import {
  Lead,
  LeadStage,
  Client,
  Project,
  ProjectStatus,
  ProjectPhase,
  FinancialTransaction,
  RecurringContract,
  TeamMember,
  SolutionProduct,
  CompanySettings,
  Currency,
  ProjectTask,
  ProjectComment,
  LeadActivity,
} from '@/types';
import {
  DEFAULT_SETTINGS,
  DEFAULT_STAGES,
  INITIAL_PRODUCTS,
  INITIAL_LEADS,
  INITIAL_CLIENTS,
  INITIAL_PROJECTS,
  INITIAL_TRANSACTIONS,
  INITIAL_RECURRING,
  INITIAL_TEAM,
} from '@/lib/mockData';
import {
  isSupabaseConfigured,
  testSupabaseConnection,
} from '@/lib/supabaseClient';
import {
  fetchFullStateFromSupabase,
  syncLeadToSupabase,
  deleteLeadFromSupabase,
  syncClientToSupabase,
  deleteClientFromSupabase,
  syncProjectToSupabase,
  deleteProjectFromSupabase,
  syncTransactionToSupabase,
  deleteTransactionFromSupabase,
  syncRecurringToSupabase,
  deleteRecurringFromSupabase,
  syncProductToSupabase,
  deleteProductFromSupabase,
  syncTeamMemberToSupabase,
  deleteTeamMemberFromSupabase,
  syncSettingsToSupabase,
  pushAllLocalDataToSupabase,
} from '@/lib/supabaseSync';

export type NavigationTab =
  | 'dashboard'
  | 'leads'
  | 'pipeline'
  | 'activities'
  | 'clients'
  | 'projects'
  | 'finance_overview'
  | 'finance_receivables'
  | 'finance_payables'
  | 'finance_cashflow'
  | 'finance_expenses'
  | 'finance_hr'
  | 'products'
  | 'reports'
  | 'settings';

export type PeriodFilter = 'today' | 'week' | 'month' | 'quarter' | 'year' | 'all' | 'este_mes' | 'mes_passado' | 'este_ano' | 'tudo';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
}

interface AppContextType {
  // Navigation & UI
  currentTab: NavigationTab;
  setCurrentTab: (tab: NavigationTab) => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean | ((prev: boolean) => boolean)) => void;
  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  
  // Selected detail states
  selectedLeadId: string | null;
  setSelectedLeadId: (id: string | null) => void;
  selectedClientId: string | null;
  setSelectedClientId: (id: string | null) => void;
  selectedProjectId: string | null;
  setSelectedProjectId: (id: string | null) => void;
  
  // Filters
  currencyFilter: 'ALL' | Currency;
  setCurrencyFilter: (currency: 'ALL' | Currency) => void;
  periodFilter: PeriodFilter;
  setPeriodFilter: (period: PeriodFilter) => void;
  locationFilter: string;
  setLocationFilter: (location: string) => void;
  
  // Toasts
  toasts: Toast[];
  showToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;

  // Data Entities
  leads: Lead[];
  stages: LeadStage[];
  clients: Client[];
  projects: Project[];
  transactions: FinancialTransaction[];
  recurringContracts: RecurringContract[];
  products: SolutionProduct[];
  team: TeamMember[];
  settings: CompanySettings;

  // Lead Actions
  addLead: (lead: Omit<Lead, 'id' | 'createdAt' | 'activities' | 'contacts'> & { contacts?: Lead['contacts'] }) => void;
  updateLead: (id: string, updates: Partial<Lead>) => void;
  deleteLead: (id: string) => void;
  moveLeadStage: (id: string, newStageId: string) => void;
  markLeadAsWon: (id: string) => void;
  markLeadAsLost: (id: string, reason: string, customNote?: string) => void;
  addLeadActivity: (leadId: string, activity: Omit<LeadActivity, 'id' | 'createdAt'>) => void;
  importLeads: (leads: Partial<Lead>[], options?: { duplicateStrategy?: 'import_all' | 'skip_duplicates' | 'update_existing' }) => { count: number; updated: number; skipped: number };
  convertLeadToClient: (params: {
    leadId: string;
    clientData: Partial<Client>;
    soldProductId?: string;
    soldAmount: number;
    currency: Currency;
    billingType: 'fixo' | 'recorrente' | 'hibrido';
    recurringAmount?: number;
    paymentMethod: 'Pix' | 'Boleto' | 'Cartao de Credito' | 'Transferencia' | 'Wire / Stripe' | 'PayPal' | 'Outro';
    firstDueDate?: string;
    paymentCondition?: 'integral' | 'entrada_50' | 'personalizado';
    conditionPercentage?: number;
    projectOption?: 'nao_criar' | 'planejamento' | 'aguardando_pagamento';
    createProject?: boolean;
    projectName?: string;
    projectDueDate?: string;
    existingClientId?: string;
  }) => void;

  // Client Actions
  addClient: (client: Omit<Client, 'id' | 'startDate' | 'contacts' | 'documents'> & { contacts?: Client['contacts']; startDate?: string; documents?: Client['documents'] }) => void;
  updateClient: (id: string, updates: Partial<Client>) => void;
  deleteClient: (id: string) => void;

  // Project Actions
  addProject: (project: Omit<Project, 'id' | 'phases' | 'comments' | 'files' | 'meetings'> & { phases?: Project['phases'] }) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  releaseProject: (projectId: string, reason?: string) => void;
  startProjectExecution: (projectId: string) => void;
  updateTaskStatus: (projectId: string, taskId: string, status: ProjectTask['status']) => void;
  toggleTaskStatus: (projectId: string, phaseIdOrTaskId: string, optionalTaskId?: string) => void;
  toggleChecklistItem: (projectId: string, arg2: string, arg3: string, arg4?: string) => void;
  addTaskToProject: (projectId: string, phaseId: string, task: Omit<ProjectTask, 'id' | 'projectId' | 'phaseId'>) => void;
  addProjectTask: (projectId: string, phaseId: string, task: any) => void;
  addProjectPhase: (projectId: string, phaseName: string) => void;
  addProjectComment: (projectId: string, comment: Omit<ProjectComment, 'id' | 'createdAt'>) => void;

  // Financial Actions
  addTransaction: (tx: Omit<FinancialTransaction, 'id'>) => void;
  updateTransaction: (id: string, updates: Partial<FinancialTransaction>) => void;
  deleteTransaction: (id: string) => void;
  markTransactionAsPaid: (id: string, paymentDate?: string) => void;
  addRecurringContract: (rc: Omit<RecurringContract, 'id'>) => void;
  updateRecurringContract: (id: string, updates: Partial<RecurringContract>) => void;

  // Product Actions
  addProduct: (product: Omit<SolutionProduct, 'id' | 'salesCount' | 'totalRevenueBRL' | 'totalRevenueUSD'>) => void;
  updateProduct: (id: string, updates: Partial<SolutionProduct>) => void;
  deleteProduct: (id: string) => void;
  duplicateProduct: (id: string) => void;

  // Team Actions
  addTeamMember: (member: Omit<TeamMember, 'id'>) => void;
  updateTeamMember: (id: string, updates: Partial<TeamMember>) => void;
  deleteTeamMember: (id: string) => void;

  // System Actions
  updateSettings: (updates: Partial<CompanySettings>) => void;
  resetToDefaultData: () => void;
  resetToInitialData: () => void;
  exportBackupJson: () => void;
  exportBackupJSON: () => void;
  importBackupJson: (jsonData: string) => boolean;
  importBackupJSON: (jsonData: string) => boolean;

  // Supabase Integration & Diagnostics
  isSupabaseConfigured: boolean;
  isSupabaseConnected: boolean;
  supabaseStatusMessage: string;
  testSupabase: () => Promise<{ success: boolean; message: string }>;
  syncAllToSupabase: () => Promise<{ success: boolean; message: string }>;
  reloadFromSupabase: () => Promise<{ success: boolean; message: string }>;
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEY = 'FSM_COMPANY_SYSTEM_DATA_V1';

export function AppProvider({ children }: { children: React.ReactNode }) {
  const toastCountRef = useRef(0);
  // Navigation
  const [currentTab, setCurrentTab] = useState<NavigationTab>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  
  // Selected detail drawers/modals
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // Filters
  const [currencyFilter, setCurrencyFilter] = useState<'ALL' | Currency>('ALL');
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('month');
  const [locationFilter, setLocationFilter] = useState<string>('ALL');

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Entities
  const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS);
  const [stages, setStages] = useState<LeadStage[]>(DEFAULT_STAGES);
  const [clients, setClients] = useState<Client[]>(INITIAL_CLIENTS);
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [transactions, setTransactions] = useState<FinancialTransaction[]>(INITIAL_TRANSACTIONS);
  const [recurringContracts, setRecurringContracts] = useState<RecurringContract[]>(INITIAL_RECURRING);
  const [products, setProducts] = useState<SolutionProduct[]>(INITIAL_PRODUCTS);
  const [team, setTeam] = useState<TeamMember[]>(INITIAL_TEAM);
  const [settings, setSettings] = useState<CompanySettings>(DEFAULT_SETTINGS);

  const [isLoaded, setIsLoaded] = useState(false);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState<boolean>(false);
  const [supabaseStatusMessage, setSupabaseStatusMessage] = useState<string>(
    isSupabaseConfigured()
      ? 'Supabase configurado nas variáveis de ambiente'
      : 'Supabase não configurado no .env'
  );

  // Load from Supabase (primary) or localStorage (offline fallback) on mount
  useEffect(() => {
    let isMounted = true;
    async function initializeAppData() {
      // 1. Tenta carregar do Supabase se configurado
      if (isSupabaseConfigured()) {
        try {
          const remoteData = await fetchFullStateFromSupabase(DEFAULT_STAGES, DEFAULT_SETTINGS);
          if (remoteData && isMounted) {
            setLeads(remoteData.leads);
            setStages(remoteData.stages);
            setClients(remoteData.clients);
            setProjects(remoteData.projects);
            setTransactions(remoteData.transactions);
            setRecurringContracts(remoteData.recurringContracts);
            setProducts(remoteData.products.length > 0 ? remoteData.products : INITIAL_PRODUCTS);
            setTeam(remoteData.team);
            setSettings(remoteData.settings);
            setIsSupabaseConnected(true);
            setSupabaseStatusMessage('Conectado ao Supabase com sucesso.');
            setIsLoaded(true);
            return;
          }
        } catch (err) {
          console.warn('Supabase fetch failed on mount, falling back to local cache:', err);
        }
      }

      // 2. Fallback para localStorage
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored && isMounted) {
          const parsed = JSON.parse(stored);
          if (parsed.leads) setLeads(parsed.leads);
          if (parsed.stages) setStages(parsed.stages);
          if (parsed.clients) setClients(parsed.clients);
          if (parsed.projects) setProjects(parsed.projects);
          if (parsed.transactions) setTransactions(parsed.transactions);
          if (parsed.recurringContracts) setRecurringContracts(parsed.recurringContracts);
          if (parsed.products) setProducts(parsed.products);
          if (parsed.team) setTeam(parsed.team);
          if (parsed.settings) setSettings(parsed.settings);
        }
      } catch (err) {
        console.error('Failed to load state from localStorage:', err);
      } finally {
        if (isMounted) setIsLoaded(true);
      }
    }

    initializeAppData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Save to localStorage when entities change (only after initial load)
  useEffect(() => {
    if (!isLoaded) return;
    try {
      const payload = {
        leads,
        stages,
        clients,
        projects,
        transactions,
        recurringContracts,
        products,
        team,
        settings,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (err) {
      console.error('Failed to save state to localStorage:', err);
    }
  }, [leads, stages, clients, projects, transactions, recurringContracts, products, team, settings, isLoaded]);

  // Command palette keyboard shortcut (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const showToast = (toast: Omit<Toast, 'id'>) => {
    toastCountRef.current += 1;
    const id = `toast_${toastCountRef.current}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Lead actions
  const addLead = (leadData: Omit<Lead, 'id' | 'createdAt' | 'activities' | 'contacts'> & { contacts?: Lead['contacts'] }) => {
    const newLead: Lead = {
      ...leadData,
      id: `lead_${Date.now()}`,
      createdAt: new Date().toISOString(),
      contacts: leadData.contacts || [],
      activities: [
        {
          id: `act_${Date.now()}`,
          type: 'nota',
          title: 'Lead cadastrado no sistema FSM Company',
          description: `Origem: ${leadData.source}. Nicho: ${leadData.category}.`,
          date: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          responsibleName: leadData.responsibleName || settings.ownerName,
        }
      ],
    };
    setLeads((prev) => [newLead, ...prev]);
    syncLeadToSupabase(newLead);
    showToast({
      type: 'success',
      title: 'Lead Cadastrado',
      message: `${newLead.companyName} foi inserido no pipeline com sucesso.`
    });
  };

  const updateLead = (id: string, updates: Partial<Lead>) => {
    setLeads((prev) => {
      const updated = prev.map((l) => (l.id === id ? { ...l, ...updates } : l));
      const target = updated.find((l) => l.id === id);
      if (target) syncLeadToSupabase(target);
      return updated;
    });
    showToast({
      type: 'info',
      title: 'Lead Atualizado',
      message: 'As alterações foram salvas com sucesso.'
    });
  };

  const deleteLead = (id: string) => {
    const lead = leads.find((l) => l.id === id);
    setLeads((prev) => prev.filter((l) => l.id !== id));
    deleteLeadFromSupabase(id);
    if (selectedLeadId === id) setSelectedLeadId(null);
    showToast({
      type: 'warning',
      title: 'Lead Removido',
      message: lead ? `${lead.companyName} foi excluído.` : 'Lead removido.'
    });
  };

  const moveLeadStage = (id: string, newStageId: string) => {
    const stage = stages.find((s) => s.id === newStageId);
    setLeads((prev) => {
      const updated = prev.map((l) => {
        if (l.id !== id) return l;
        const isWon = newStageId === 'ganho';
        const isLost = newStageId === 'perdido';
        const newStatus: Lead['status'] = isWon ? 'ganho' : isLost ? 'perdido' : newStageId === 'nutricao' ? 'nutricao' : 'aberto';
        const actType: LeadActivity['type'] = isWon ? 'proposta' : 'nota';
        return {
          ...l,
          stageId: newStageId,
          status: newStatus,
          wonAt: isWon ? (l.wonAt || new Date().toISOString()) : l.wonAt,
          closingProbability: isWon ? 100 : isLost ? 0 : l.closingProbability,
          activities: [
            ...l.activities,
            {
              id: `act_${Date.now()}`,
              type: actType,
              title: isWon ? 'Oportunidade Marcada como Ganha! 🚀' : isLost ? 'Oportunidade Marcada como Perdida' : `Etapa alterada para: ${stage?.name || newStageId}`,
              description: isWon ? 'Oportunidade pronta para conversão em cliente.' : isLost ? (l.lossReason ? `Motivo: ${l.lossReason}` : 'Movimentado para Perdido.') : 'Movimentação no pipeline comercial.',
              date: new Date().toISOString(),
              createdAt: new Date().toISOString(),
              responsibleName: l.responsibleName,
            }
          ]
        };
      });
      const target = updated.find((l) => l.id === id);
      if (target) syncLeadToSupabase(target);
      return updated;
    });
  };

  const markLeadAsWon = (id: string) => {
    setLeads((prev) => {
      const updated = prev.map((l) => {
        if (l.id !== id) return l;
        return {
          ...l,
          stageId: 'ganho',
          status: 'ganho' as const,
          wonAt: new Date().toISOString(),
          closingProbability: 100,
          activities: [
            ...l.activities,
            {
              id: `act_${Date.now()}`,
              type: 'proposta' as const,
              title: 'Oportunidade Ganha! 🚀',
              description: `Venda concluída no valor de ${l.currency} ${l.estimatedValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}.`,
              date: new Date().toISOString(),
              createdAt: new Date().toISOString(),
              responsibleName: l.responsibleName,
            },
          ],
        };
      });
      const target = updated.find((l) => l.id === id);
      if (target) syncLeadToSupabase(target);
      return updated;
    });
    showToast({
      type: 'success',
      title: 'Oportunidade Ganha! 🚀',
      message: 'Lead marcado como Ganho. Pronto para conversão em cliente.',
    });
  };

  const markLeadAsLost = (id: string, reason: string, customNote?: string) => {
    setLeads((prev) => {
      const updated = prev.map((l) => {
        if (l.id !== id) return l;
        return {
          ...l,
          stageId: 'perdido',
          status: 'perdido' as const,
          lossReason: reason,
          lossCustomNote: customNote,
          closingProbability: 0,
          activities: [
            ...l.activities,
            {
              id: `act_${Date.now()}`,
              type: 'nota' as const,
              title: `Oportunidade Perdida: ${reason}`,
              description: customNote ? `Detalhes: ${customNote}` : `Motivo registrado: ${reason}.`,
              date: new Date().toISOString(),
              createdAt: new Date().toISOString(),
              responsibleName: l.responsibleName,
            },
          ],
        };
      });
      const target = updated.find((l) => l.id === id);
      if (target) syncLeadToSupabase(target);
      return updated;
    });
    showToast({
      type: 'info',
      title: 'Motivo de Perda Registrado',
      message: `Motivo: ${reason}. Registro preservado no histórico comercial.`,
    });
  };

  const addLeadActivity = (leadId: string, activity: Omit<LeadActivity, 'id' | 'createdAt'>) => {
    const newAct: LeadActivity = {
      ...activity,
      id: `act_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setLeads((prev) => {
      const updated = prev.map((l) => {
        if (l.id !== leadId) return l;
        return {
          ...l,
          lastContactDate: activity.date,
          nextFollowUpDate: activity.nextAction ? l.nextFollowUpDate : l.nextFollowUpDate,
          activities: [newAct, ...l.activities],
        };
      });
      const target = updated.find((l) => l.id === leadId);
      if (target) syncLeadToSupabase(target);
      return updated;
    });
    showToast({
      type: 'success',
      title: 'Atividade Registrada',
      message: `Atividade de ${activity.type} salva no histórico.`
    });
  };

  const importLeads = (
    newLeadsData: Partial<Lead>[],
    options?: { duplicateStrategy?: 'import_all' | 'skip_duplicates' | 'update_existing' }
  ): { count: number; updated: number; skipped: number } => {
    const strategy = options?.duplicateStrategy || 'skip_duplicates';
    let count = 0;
    let updated = 0;
    let skipped = 0;
    const now = new Date().toISOString();

    setLeads((prevLeads) => {
      let currentLeads = [...prevLeads];
      const toAdd: Lead[] = [];

      for (const item of newLeadsData) {
        if (!item.companyName || !item.companyName.trim()) {
          skipped++;
          continue;
        }

        const normName = item.companyName.trim().toLowerCase();
        const cleanPhone = (item.phone || '').replace(/\D/g, '');
        const cleanWebsite = (item.website || '').trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '');

        // Check duplicate
        const existingIndex = currentLeads.findIndex((existing) => {
          if (existing.companyName.trim().toLowerCase() === normName) return true;
          if (cleanPhone && cleanPhone.length >= 8) {
            const exPhone = (existing.phone || '').replace(/\D/g, '');
            const exWhats = (existing.whatsapp || '').replace(/\D/g, '');
            if (exPhone && exPhone.includes(cleanPhone)) return true;
            if (exWhats && exWhats.includes(cleanPhone)) return true;
          }
          if (cleanWebsite && cleanWebsite.length > 4) {
            const exWeb = (existing.website || '').trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '');
            if (exWeb && exWeb === cleanWebsite) return true;
          }
          return false;
        });

        if (existingIndex >= 0) {
          if (strategy === 'skip_duplicates') {
            skipped++;
            continue;
          } else if (strategy === 'update_existing') {
            const existing = currentLeads[existingIndex];
            currentLeads[existingIndex] = {
              ...existing,
              category: item.category || existing.category,
              city: item.city || existing.city,
              state: item.state || existing.state,
              address: item.address || existing.address,
              phone: item.phone || existing.phone,
              whatsapp: item.whatsapp || existing.whatsapp || item.phone || existing.phone,
              email: item.email || existing.email,
              website: item.website || existing.website,
              source: item.source || existing.source,
              importMetadata: {
                ...existing.importMetadata,
                score: item.importMetadata?.score ?? existing.importMetadata?.score,
                originalChannel: item.importMetadata?.originalChannel ?? existing.importMetadata?.originalChannel,
                importedAt: now,
              },
            };
            updated++;
            continue;
          }
        }

        // Create new lead
        const lead: Lead = {
          id: `lead_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          companyName: item.companyName.trim(),
          tradeName: item.tradeName || item.companyName.trim(),
          category: item.category || 'Geral',
          description: item.description || '',
          website: item.website || '',
          googleMapsUrl: item.googleMapsUrl || '',
          gbpStatus: item.gbpStatus || 'Incompleto',
          googleRating: item.googleRating || 4.5,
          reviewCount: item.reviewCount || 10,
          phone: item.phone || '',
          whatsapp: item.whatsapp || item.phone || '',
          email: item.email || '',
          address: item.address || '',
          city: item.city || 'São Paulo',
          state: item.state || 'SP',
          country: item.country || 'Brasil',
          postalCode: item.postalCode || '',
          responsibleName: item.responsibleName || settings.ownerName,
          source: item.source || 'Google Maps',
          campaign: item.campaign || 'Importação Planilha',
          stageId: item.stageId || 'novo_lead',
          status: (item.status as any) || 'aberto',
          temperature: item.temperature || 'morno',
          serviceOfInterest: item.serviceOfInterest || 'Criação de Website de Alta Conversão',
          estimatedValue: Number(item.estimatedValue) || 2500,
          currency: item.currency || 'BRL',
          closingProbability: Number(item.closingProbability) || 30,
          createdAt: item.createdAt || now,
          notes: item.notes || '',
          importMetadata: item.importMetadata || {
            importedAt: now,
          },
          contacts: item.contacts || (item.phone || item.email ? [{
            id: `ct_${Date.now()}`,
            name: item.companyName.trim(),
            role: 'Contato Comercial',
            email: item.email || '',
            phone: item.phone || '',
            whatsapp: item.whatsapp || item.phone || '',
            preferredChannel: 'whatsapp',
          }] : []),
          activities: [
            {
              id: `act_${Date.now()}_imp`,
              type: 'nota',
              title: 'Lead importado via planilha/Excel',
              description: `Origem: ${item.source || 'Planilha'}.`,
              date: now,
              createdAt: now,
              responsibleName: item.responsibleName || settings.ownerName,
            }
          ],
        };
        toAdd.push(lead);
        count++;
      }

      return [...toAdd, ...currentLeads];
    });

    showToast({
      type: 'success',
      title: 'Importação Concluída',
      message: `${count} leads importados com sucesso! ${updated > 0 ? `(${updated} atualizados)` : ''} ${skipped > 0 ? `(${skipped} duplicados ignorados)` : ''}`.trim(),
    });

    return { count, updated, skipped };
  };

  // Convert Lead to Client Workflow
  const convertLeadToClient = (params: {
    leadId: string;
    clientData: Partial<Client>;
    soldProductId?: string;
    soldAmount: number;
    currency: Currency;
    billingType: 'fixo' | 'recorrente' | 'hibrido';
    recurringAmount?: number;
    paymentMethod: 'Pix' | 'Boleto' | 'Cartao de Credito' | 'Transferencia' | 'Wire / Stripe' | 'PayPal' | 'Outro';
    firstDueDate?: string;
    paymentCondition?: 'integral' | 'entrada_50' | 'personalizado';
    conditionPercentage?: number;
    projectOption?: 'nao_criar' | 'planejamento' | 'aguardando_pagamento';
    createProject?: boolean;
    projectName?: string;
    projectDueDate?: string;
    existingClientId?: string;
  }) => {
    const lead = leads.find((l) => l.id === params.leadId);
    if (!lead) return;

    const today = new Date().toISOString().split('T')[0];
    const product = products.find((p) => p.id === params.soldProductId);
    const serviceName = product ? product.name : lead.serviceOfInterest;
    const paymentCond = params.paymentCondition || 'integral';
    const condPercent = paymentCond === 'entrada_50' ? 50 : paymentCond === 'personalizado' ? (params.conditionPercentage || 100) : 100;

    let targetClientId = params.existingClientId;
    let targetClientName = params.clientData.companyName || lead.companyName;

    // 1. Client Handling: Existing association vs New Creation
    if (targetClientId) {
      // Associate with existing client
      setClients((prev) =>
        prev.map((c) => {
          if (c.id !== targetClientId) return c;
          targetClientName = c.companyName;
          const updatedServices = c.servicesSubscribed.includes(serviceName)
            ? c.servicesSubscribed
            : [...c.servicesSubscribed, serviceName];
          const updatedClient: Client = {
            ...c,
            servicesSubscribed: updatedServices,
            contractedValue: (c.contractedValue || 0) + params.soldAmount,
            monthlyRecurringValue:
              params.billingType === 'recorrente' || params.billingType === 'hibrido'
                ? (c.monthlyRecurringValue || 0) + (params.recurringAmount || params.soldAmount)
                : c.monthlyRecurringValue,
            lastContactDate: today,
            notes: `${c.notes || ''}\n[${today}] Nova venda/solução associada: ${serviceName} (${params.currency} ${params.soldAmount}).`.trim(),
          };
          syncClientToSupabase(updatedClient);
          return updatedClient;
        })
      );
    } else {
      // Create new client
      targetClientId = `client_${Date.now()}`;
      const newClient: Client = {
        id: targetClientId,
        leadOriginId: lead.id,
        companyName: params.clientData.companyName || lead.companyName,
        tradeName: params.clientData.tradeName || lead.tradeName || lead.companyName,
        category: params.clientData.category || lead.category,
        website: params.clientData.website || lead.website,
        phone: params.clientData.phone || lead.phone,
        whatsapp: params.clientData.whatsapp || lead.whatsapp,
        email: params.clientData.email || lead.email,
        address: params.clientData.address || lead.address,
        city: params.clientData.city || lead.city,
        state: params.clientData.state || lead.state,
        country: params.clientData.country || lead.country,
        postalCode: params.clientData.postalCode || lead.postalCode,
        primaryContactName: params.clientData.primaryContactName || (lead.contacts[0]?.name || lead.companyName),
        primaryContactRole: params.clientData.primaryContactRole || (lead.contacts[0]?.role || 'Decisor Principal'),
        primaryContactPhone: params.clientData.primaryContactPhone || (lead.contacts[0]?.phone || lead.phone),
        primaryContactEmail: params.clientData.primaryContactEmail || (lead.contacts[0]?.email || lead.email),
        servicesSubscribed: [serviceName],
        status: 'onboarding',
        healthScore: 'excelente',
        responsibleName: lead.responsibleName || settings.ownerName,
        contractedValue: params.soldAmount,
        currency: params.currency,
        billingType: params.billingType,
        recurringValue: params.recurringAmount || (params.billingType === 'recorrente' ? params.soldAmount : 0),
        recurringAmount: params.recurringAmount || (params.billingType === 'recorrente' ? params.soldAmount : 0),
        monthlyRecurringValue: params.recurringAmount || (params.billingType === 'recorrente' ? params.soldAmount : 0),
        startDate: today,
        lastContactDate: today,
        notes: `Convertido a partir do Lead: ${lead.companyName}. Observações comerciais: ${lead.notes || 'Nenhuma.'}`,
        contacts: lead.contacts,
        documents: [],
      };
      targetClientName = newClient.companyName;
      setClients((prev) => [newClient, ...prev]);
      syncClientToSupabase(newClient);
    }

    // 2. Mark Lead as Ganho
    const updatedLead: Lead = {
      ...lead,
      stageId: 'ganho',
      status: 'ganho' as const,
      wonAt: lead.wonAt || today,
      convertedAt: today,
      convertedClientId: targetClientId,
      closingProbability: 100,
      activities: [
        ...lead.activities,
        {
          id: `act_${Date.now()}`,
          type: 'proposta' as const,
          title: 'Lead Ganho & Convertido em Cliente! 🚀',
          description: `Cliente vinculado: ${targetClientName} (ID: ${targetClientId}). Venda no valor de ${params.currency} ${params.soldAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}. Condição: ${paymentCond === 'entrada_50' ? 'Entrada 50%' : paymentCond === 'personalizado' ? `Entrada ${condPercent}%` : 'Integral'}.`,
          date: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          responsibleName: lead.responsibleName,
        }
      ]
    };
    setLeads((prev) =>
      prev.map((l) => (l.id === lead.id ? updatedLead : l))
    );
    syncLeadToSupabase(updatedLead);

    // 3. Project Creation (if requested)
    const shouldCreateProject = params.projectOption ? params.projectOption !== 'nao_criar' : (params.createProject ?? true);
    const projectId = shouldCreateProject ? `proj_${Date.now()}` : undefined;
    const projectInitialStatus: ProjectStatus = params.projectOption === 'planejamento' ? 'planejamento' : 'aguardando_pagamento';
    const txId = `tx_${Date.now()}`;

    if (shouldCreateProject && projectId) {
      const phases: Project['phases'] = [];
      const templatePhases = product?.projectTemplatePhases || product?.templatePhases;

      if (templatePhases && templatePhases.length > 0) {
        templatePhases.forEach((tpl: any, idx: number) => {
          const phaseId = `ph_${projectId}_${idx + 1}`;
          phases.push({
            id: phaseId,
            projectId: projectId,
            title: tpl.name || tpl.title || `Fase ${idx + 1}`,
            order: idx + 1,
            status: idx === 0 ? 'em_andamento' : 'pendente',
            tasks: (tpl.tasks || []).map((taskTpl: any, tIdx: number) => ({
              id: `tsk_${phaseId}_${tIdx + 1}`,
              projectId: projectId,
              phaseId: phaseId,
              title: taskTpl.title,
              status: idx === 0 && tIdx === 0 ? 'em_andamento' : 'a_fazer',
              priority: 'alta',
              dueDate: params.projectDueDate || new Date(Date.now() + (tIdx + 1) * 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              responsibleName: lead.responsibleName || settings.ownerName,
              checklist: (taskTpl.checklist || []).map((cTitle: any, cIdx: number) => ({
                id: `chk_${phaseId}_${tIdx}_${cIdx}`,
                title: typeof cTitle === 'string' ? cTitle : cTitle.title,
                completed: false,
              })),
            })),
          });
        });
      } else {
        phases.push({
          id: `ph_${projectId}_1`,
          projectId: projectId,
          title: 'Fase 1: Onboarding e Alinhamento Inicial',
          order: 1,
          status: 'em_andamento',
          tasks: [
            {
              id: `tsk_${projectId}_1`,
              projectId: projectId,
              phaseId: `ph_${projectId}_1`,
              title: 'Reunião de kickoff e alinhamento',
              status: 'em_andamento',
              priority: 'alta',
              dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              responsibleName: lead.responsibleName || settings.ownerName,
              checklist: [
                { id: 'c_1', title: 'Enviar formulário de briefing', completed: false },
                { id: 'c_2', title: 'Agendar call de alinhamento comercial', completed: false },
              ],
            },
          ],
        });
      }

      const newProject: Project = {
        id: projectId,
        clientId: targetClientId,
        clientName: targetClientName,
        solutionId: product?.id,
        solutionName: serviceName,
        name: params.projectName || `Projeto: ${serviceName} - ${targetClientName}`,
        description: `Projeto gerado na conversão comercial do lead ${lead.companyName}.`,
        responsibleName: lead.responsibleName || settings.ownerName,
        teamMembers: [lead.responsibleName || settings.ownerName],
        status: projectInitialStatus,
        priority: 'alta',
        startDate: today,
        dueDate: params.projectDueDate || new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        budget: params.soldAmount,
        currency: params.currency,
        contractedValue: params.soldAmount,
        progressPercentage: projectInitialStatus === 'aguardando_pagamento' ? 0 : 5,
        phases: phases,
        leadOriginId: lead.id,
        saleTransactionId: txId,
        paymentConditionRequired: paymentCond,
        paymentConditionPercentage: condPercent,
        isReleased: projectInitialStatus !== 'aguardando_pagamento',
        comments: [
          {
            id: `comm_${Date.now()}`,
            projectId: projectId,
            authorName: settings.ownerName,
            authorRole: 'Sistema Comercial',
            content:
              projectInitialStatus === 'aguardando_pagamento'
                ? `Projeto criado. Status: Aguardando confirmação do recebimento comercial (${paymentCond === 'entrada_50' ? 'Entrada 50%' : paymentCond === 'personalizado' ? `Entrada ${condPercent}%` : 'Pagamento Integral'}) no Contas a Receber para liberação.`
                : 'Projeto criado em fase de planejamento.',
            createdAt: new Date().toISOString(),
          },
        ],
        files: [],
        meetings: [],
      };

      setProjects((prev) => [newProject, ...prev]);
      syncProjectToSupabase(newProject);
    }

    // 4. Register Financial Receivable(s) with status: 'pendente' (never auto 'pago'!)
    const firstDueDate = params.firstDueDate || today;
    let initialReceivableAmount = params.soldAmount;
    let firstTitle = `Pagamento Integral - ${serviceName} - ${targetClientName}`;

    if (paymentCond === 'entrada_50') {
      initialReceivableAmount = Math.round(params.soldAmount * 0.5 * 100) / 100;
      firstTitle = `Entrada (50%) - ${serviceName} - ${targetClientName}`;
    } else if (paymentCond === 'personalizado') {
      initialReceivableAmount = Math.round(params.soldAmount * (condPercent / 100) * 100) / 100;
      firstTitle = `Entrada (${condPercent}%) - ${serviceName} - ${targetClientName}`;
    } else if (params.billingType === 'recorrente') {
      initialReceivableAmount = params.recurringAmount || params.soldAmount;
      firstTitle = `1ª Mensalidade - ${serviceName} - ${targetClientName}`;
    }

    const firstTx: FinancialTransaction = {
      id: txId,
      type: 'receita',
      title: firstTitle,
      category: params.billingType === 'recorrente' ? 'Recorrencia Mensal' : 'Venda de Solucao',
      amount: initialReceivableAmount,
      currency: params.currency,
      clientId: targetClientId,
      clientName: targetClientName,
      projectId: projectId,
      projectName: params.projectName || `Projeto: ${serviceName} - ${targetClientName}`,
      leadId: lead.id,
      issueDate: today,
      dueDate: firstDueDate,
      status: 'pendente', // ALWAYS starts as pendente!
      paymentMethod: params.paymentMethod,
      isRecurring: params.billingType === 'recorrente',
      billingType: params.billingType,
      paymentCondition: paymentCond,
      conditionPercentage: condPercent,
      isInitialSaleReceivable: true,
      installments: paymentCond === 'entrada_50' || (paymentCond === 'personalizado' && condPercent < 100)
        ? { current: 1, total: 2 }
        : undefined,
    };

    const txToAdd: FinancialTransaction[] = [firstTx];

    // If 50% down payment or custom down payment < 100%, register the remaining installment
    if (paymentCond === 'entrada_50' || (paymentCond === 'personalizado' && condPercent < 100)) {
      const remainingAmount = Math.round((params.soldAmount - initialReceivableAmount) * 100) / 100;
      if (remainingAmount > 0) {
        const secondDueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const secondTitle = paymentCond === 'entrada_50'
          ? `2ª Parcela (50%) - ${serviceName} - ${targetClientName}`
          : `Saldo Restante (${100 - condPercent}%) - ${serviceName} - ${targetClientName}`;

        const secondTx: FinancialTransaction = {
          id: `tx_rem_${Date.now()}`,
          type: 'receita',
          title: secondTitle,
          category: 'Venda de Solucao',
          amount: remainingAmount,
          currency: params.currency,
          clientId: targetClientId,
          clientName: targetClientName,
          projectId: projectId,
          projectName: params.projectName || `Projeto: ${serviceName} - ${targetClientName}`,
          leadId: lead.id,
          issueDate: today,
          dueDate: secondDueDate,
          status: 'pendente',
          paymentMethod: params.paymentMethod,
          isRecurring: false,
          billingType: params.billingType,
          paymentCondition: paymentCond,
          conditionPercentage: 100 - condPercent,
          installments: { current: 2, total: 2 },
        };
        txToAdd.push(secondTx);
      }
    }

    setTransactions((prev) => [...txToAdd, ...prev]);
    txToAdd.forEach((tx) => syncTransactionToSupabase(tx));

    // 5. If recurring, register RecurringContract
    if (params.billingType === 'recorrente' || (params.billingType === 'hibrido' && (params.recurringAmount ?? 0) > 0)) {
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      const nextBillingDate = nextMonth.toISOString().split('T')[0];

      const newRec: RecurringContract = {
        id: `rec_${Date.now()}`,
        clientId: targetClientId,
        clientName: targetClientName,
        solutionName: serviceName,
        recurringAmount: params.recurringAmount || params.soldAmount,
        currency: params.currency,
        periodicity: 'mensal',
        startDate: today,
        nextBillingDate: nextBillingDate,
        nextRenewalDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'ativo',
        paymentMethod: params.paymentMethod,
      };
      setRecurringContracts((prev) => [newRec, ...prev]);
      syncRecurringToSupabase(newRec);
    }

    // 6. Update product sales stats
    if (product) {
      const updatedProduct: SolutionProduct = {
        ...product,
        salesCount: product.salesCount + 1,
        totalRevenueBRL: params.currency === 'BRL' ? product.totalRevenueBRL + params.soldAmount : product.totalRevenueBRL,
        totalRevenueUSD: params.currency === 'USD' ? product.totalRevenueUSD + params.soldAmount : product.totalRevenueUSD,
      };
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? updatedProduct : p))
      );
      syncProductToSupabase(updatedProduct);
    }

    showToast({
      type: 'success',
      title: 'Conversão Comercial Realizada! 🎉',
      message: `${targetClientName} cadastrado. Lançamento gerado em Contas a Receber (Pendente) e projeto criado!`,
    });
  };

  // Client actions
  const addClient = (clientData: Omit<Client, 'id' | 'startDate' | 'contacts' | 'documents'> & { contacts?: Client['contacts']; startDate?: string; documents?: Client['documents'] }) => {
    const newClient: Client = {
      ...clientData,
      id: `client_${Date.now()}`,
      startDate: clientData.startDate || new Date().toISOString().split('T')[0],
      contacts: clientData.contacts || [],
      documents: clientData.documents || [],
    };
    setClients((prev) => [newClient, ...prev]);
    syncClientToSupabase(newClient);
    showToast({
      type: 'success',
      title: 'Cliente Cadastrado',
      message: `${newClient.companyName} adicionado à carteira.`
    });
  };

  const updateClient = (id: string, updates: Partial<Client>) => {
    setClients((prev) => {
      const updated = prev.map((c) => (c.id === id ? { ...c, ...updates } : c));
      const target = updated.find((c) => c.id === id);
      if (target) syncClientToSupabase(target);
      return updated;
    });
    showToast({
      type: 'info',
      title: 'Cliente Atualizado',
      message: 'Dados do cliente atualizados com sucesso.'
    });
  };

  const deleteClient = (id: string) => {
    const client = clients.find((c) => c.id === id);
    setClients((prev) => prev.filter((c) => c.id !== id));
    deleteClientFromSupabase(id);
    if (selectedClientId === id) setSelectedClientId(null);
    showToast({
      type: 'warning',
      title: 'Cliente Removido',
      message: client ? `${client.companyName} foi removido.` : 'Cliente excluído.'
    });
  };

  // Project actions
  const addProject = (projectData: Omit<Project, 'id' | 'phases' | 'comments' | 'files' | 'meetings'> & { phases?: Project['phases'] }) => {
    const newProject: Project = {
      ...projectData,
      id: `proj_${Date.now()}`,
      phases: projectData.phases || [],
      comments: [],
      files: [],
      meetings: [],
    };
    setProjects((prev) => [newProject, ...prev]);
    syncProjectToSupabase(newProject);
    showToast({
      type: 'success',
      title: 'Projeto Criado',
      message: `${newProject.name} foi adicionado aos projetos ativos.`
    });
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects((prev) => {
      const next = prev.map((p) => (p.id === id ? { ...p, ...updates } : p));
      const target = next.find((p) => p.id === id);
      if (target) syncProjectToSupabase(target);
      return next;
    });
    showToast({
      type: 'info',
      title: 'Projeto Atualizado',
      message: 'Alterações no projeto salvas com sucesso.'
    });
  };

  const releaseProject = (id: string, releaseNote?: string) => {
    const now = new Date().toISOString();
    setProjects((prev) => {
      const next = prev.map((p) => {
        if (p.id !== id) return p;
        const updated: Project = {
          ...p,
          status: 'liberado',
          isReleased: true,
          releasedAt: now,
          comments: [
            ...(p.comments || []),
            {
              id: `comm_${Date.now()}`,
              projectId: id,
              authorName: settings.ownerName,
              authorRole: 'Gestão Financeira / Operações',
              content: releaseNote || 'Projeto liberado para execução após validação financeira.',
              createdAt: now,
            },
          ],
        };
        return updated;
      });
      const target = next.find((p) => p.id === id);
      if (target) syncProjectToSupabase(target);
      return next;
    });
    showToast({
      type: 'success',
      title: 'Projeto Liberado! 🚀',
      message: 'Status atualizado para Liberado. A equipe técnica já pode iniciar o kickoff.',
    });
  };

  const startProjectExecution = (id: string) => {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toISOString();
    setProjects((prev) => {
      const next = prev.map((p) => {
        if (p.id !== id) return p;
        const updated: Project = {
          ...p,
          status: 'em_andamento',
          isReleased: true,
          actualStartDate: today,
          comments: [
            ...(p.comments || []),
            {
              id: `comm_${Date.now()}`,
              projectId: id,
              authorName: settings.ownerName,
              authorRole: 'Gestão de Projetos',
              content: `Execução oficial iniciada na data ${today}.`,
              createdAt: now,
            },
          ],
        };
        return updated;
      });
      const target = next.find((p) => p.id === id);
      if (target) syncProjectToSupabase(target);
      return next;
    });
    showToast({
      type: 'success',
      title: 'Projeto em Execução',
      message: 'Status alterado para Em Andamento.',
    });
  };

  const deleteProject = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    deleteProjectFromSupabase(id);
    if (selectedProjectId === id) setSelectedProjectId(null);
    showToast({
      type: 'warning',
      title: 'Projeto Excluído',
      message: 'Projeto removido com sucesso.'
    });
  };

  const updateTaskStatus = (projectId: string, taskId: string, status: ProjectTask['status']) => {
    setProjects((prev) => {
      let targetProj: Project | undefined;
      const next = prev.map((proj) => {
        if (proj.id !== projectId) return proj;
        let totalTasks = 0;
        let completedTasks = 0;

        const newPhases = proj.phases.map((phase) => {
          const newTasks = phase.tasks.map((task) => {
            totalTasks++;
            if (task.id === taskId) {
              const completed = status === 'concluida';
              if (completed) completedTasks++;
              return {
                ...task,
                status,
                completedAt: completed ? new Date().toISOString() : undefined,
              };
            } else {
              if (task.status === 'concluida') completedTasks++;
              return task;
            }
          });
          return { ...phase, tasks: newTasks };
        });

        const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : proj.progressPercentage;

        const updated: Project = {
          ...proj,
          phases: newPhases,
          progressPercentage,
        };
        targetProj = updated;
        return updated;
      });
      if (targetProj) syncProjectToSupabase(targetProj);
      return next;
    });
  };

  const toggleChecklistItem = (projectId: string, arg2: string, arg3: string, arg4?: string) => {
    const taskId = arg4 !== undefined ? arg3 : arg2;
    const checklistItemId = arg4 !== undefined ? arg4 : arg3;

    setProjects((prev) => {
      let targetProj: Project | undefined;
      const next = prev.map((proj) => {
        if (proj.id !== projectId) return proj;
        const newPhases = proj.phases.map((phase) => {
          const newTasks = phase.tasks.map((task) => {
            if (task.id !== taskId) return task;
            const newChecklist = task.checklist.map((item) => {
              if (item.id === checklistItemId) {
                const isNowCompleted = !(item.completed ?? item.isCompleted);
                return { ...item, completed: isNowCompleted, isCompleted: isNowCompleted };
              }
              return item;
            });
            return { ...task, checklist: newChecklist };
          });
          return { ...phase, tasks: newTasks };
        });
        const updated: Project = { ...proj, phases: newPhases };
        targetProj = updated;
        return updated;
      });
      if (targetProj) syncProjectToSupabase(targetProj);
      return next;
    });
  };

  const addTaskToProject = (projectId: string, phaseId: string, task: Omit<ProjectTask, 'id' | 'projectId' | 'phaseId'>) => {
    const newTask: ProjectTask = {
      ...task,
      id: `tsk_${Date.now()}`,
      projectId,
      phaseId,
      checklist: task.checklist || [],
    };
    setProjects((prev) => {
      let targetProj: Project | undefined;
      const next = prev.map((proj) => {
        if (proj.id !== projectId) return proj;
        const newPhases = proj.phases.map((phase) => {
          if (phase.id !== phaseId) return phase;
          return { ...phase, tasks: [...phase.tasks, newTask] };
        });
        const updated: Project = { ...proj, phases: newPhases };
        targetProj = updated;
        return updated;
      });
      if (targetProj) syncProjectToSupabase(targetProj);
      return next;
    });
    showToast({
      type: 'success',
      title: 'Tarefa Adicionada',
      message: `${newTask.title} adicionada à fase.`
    });
  };

  const addProjectTask = (projectId: string, phaseId: string, task: any) => {
    addTaskToProject(projectId, phaseId, {
      title: task.title,
      status: task.status === 'pendente' ? 'a_fazer' : (task.status || 'a_fazer'),
      priority: task.priority || 'media',
      dueDate: task.dueDate || new Date().toISOString().split('T')[0],
      responsibleName: task.responsibleName || settings.ownerName,
      checklist: task.checklist || [],
    });
  };

  const addProjectPhase = (projectId: string, phaseName: string) => {
    const phaseId = `phase_${Date.now()}`;
    setProjects((prev) => {
      let targetProj: Project | undefined;
      const next = prev.map((proj) => {
        if (proj.id !== projectId) return proj;
        const newPhase: ProjectPhase = {
          id: phaseId,
          projectId,
          title: phaseName,
          order: proj.phases.length + 1,
          status: 'pendente',
          tasks: [],
        };
        const updated: Project = { ...proj, phases: [...proj.phases, newPhase] };
        targetProj = updated;
        return updated;
      });
      if (targetProj) syncProjectToSupabase(targetProj);
      return next;
    });
    showToast({
      type: 'success',
      title: 'Fase Criada',
      message: `Fase "${phaseName}" adicionada ao projeto.`
    });
  };

  const toggleTaskStatus = (projectId: string, phaseIdOrTaskId: string, optionalTaskId?: string) => {
    const taskId = optionalTaskId || phaseIdOrTaskId;
    setProjects((prev) => {
      let targetProj: Project | undefined;
      const next = prev.map((proj) => {
        if (proj.id !== projectId) return proj;
        let totalTasks = 0;
        let completedTasks = 0;
        const newPhases = proj.phases.map((phase) => {
          const newTasks = phase.tasks.map((task) => {
            totalTasks++;
            if (task.id === taskId) {
              const newStatus: ProjectTask['status'] = task.status === 'concluida' ? 'a_fazer' : 'concluida';
              if (newStatus === 'concluida') completedTasks++;
              return {
                ...task,
                status: newStatus,
                completedAt: newStatus === 'concluida' ? new Date().toISOString() : undefined,
              };
            } else {
              if (task.status === 'concluida') completedTasks++;
              return task;
            }
          });
          return { ...phase, tasks: newTasks };
        });
        const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : proj.progressPercentage;
        const updated: Project = {
          ...proj,
          phases: newPhases,
          progressPercentage,
        };
        targetProj = updated;
        return updated;
      });
      if (targetProj) syncProjectToSupabase(targetProj);
      return next;
    });
  };

  const addProjectComment = (projectId: string, comment: Omit<ProjectComment, 'id' | 'createdAt'>) => {
    const newComment: ProjectComment = {
      ...comment,
      id: `comm_${Date.now()}`,
      projectId,
      createdAt: new Date().toISOString(),
    };
    setProjects((prev) => {
      let targetProj: Project | undefined;
      const next = prev.map((p) => {
        if (p.id !== projectId) return p;
        const updated = { ...p, comments: [newComment, ...(p.comments || [])] };
        targetProj = updated;
        return updated;
      });
      if (targetProj) syncProjectToSupabase(targetProj);
      return next;
    });
  };

  // Financial actions
  const addTransaction = (tx: Omit<FinancialTransaction, 'id'>) => {
    const newTx: FinancialTransaction = {
      ...tx,
      id: `tx_${Date.now()}`,
      issueDate: tx.issueDate || new Date().toISOString().split('T')[0],
      isRecurring: tx.isRecurring ?? false,
    };
    setTransactions((prev) => [newTx, ...prev]);
    syncTransactionToSupabase(newTx);
    showToast({
      type: 'success',
      title: tx.type === 'receita' ? 'Receita Registrada' : 'Despesa Registrada',
      message: `${newTx.title} - ${newTx.currency} ${newTx.amount.toLocaleString()}`
    });
  };

  const updateTransaction = (id: string, updates: Partial<FinancialTransaction>) => {
    setTransactions((prev) => {
      const next = prev.map((t) => (t.id === id ? { ...t, ...updates } : t));
      const target = next.find((t) => t.id === id);
      if (target) syncTransactionToSupabase(target);
      return next;
    });
    showToast({
      type: 'info',
      title: 'Lançamento Atualizado',
      message: 'Dados financeiros atualizados com sucesso.'
    });
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    deleteTransactionFromSupabase(id);
    showToast({
      type: 'warning',
      title: 'Lançamento Removido',
      message: 'Transação excluída do registro.'
    });
  };

  const markTransactionAsPaid = (id: string, paymentDate?: string) => {
    const dateStr = paymentDate || new Date().toISOString().split('T')[0];
    const targetTx = transactions.find((t) => t.id === id);

    setTransactions((prev) => {
      const next = prev.map((t) => (t.id === id ? { ...t, status: 'pago' as const, paymentDate: dateStr } : t));
      const updatedTx = next.find((t) => t.id === id);
      if (updatedTx) syncTransactionToSupabase(updatedTx);
      return next;
    });

    // If this transaction is an initial sale receivable linked to a project in 'aguardando_pagamento', automatically release project
    if (targetTx) {
      setProjects((prevProjects) => {
        let releasedProject: Project | undefined;
        const next = prevProjects.map((proj) => {
          const isLinked = proj.saleTransactionId === targetTx.id || (targetTx.projectId && proj.id === targetTx.projectId);
          if (isLinked && proj.status === 'aguardando_pagamento') {
            const now = new Date().toISOString();
            const updated: Project = {
              ...proj,
              status: 'liberado' as const,
              isReleased: true,
              releasedAt: now,
              comments: [
                ...(proj.comments || []),
                {
                  id: `comm_${Date.now()}`,
                  projectId: proj.id,
                  authorName: settings.ownerName,
                  authorRole: 'Automação Financeira',
                  content: `Recebimento confirmado (${targetTx.currency} ${targetTx.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}). Projeto liberado para início de execução!`,
                  createdAt: now,
                },
              ],
            };
            releasedProject = updated;
            return updated;
          }
          return proj;
        });
        if (releasedProject) syncProjectToSupabase(releasedProject);
        return next;
      });
    }

    showToast({
      type: 'success',
      title: 'Pagamento Confirmado',
      message: targetTx?.projectId
        ? 'Status atualizado para Pago/Recebido e projeto vinculado foi liberado!'
        : 'Status atualizado para Pago/Recebido com sucesso.'
    });
  };

  const addRecurringContract = (rc: Omit<RecurringContract, 'id'>) => {
    const newRc: RecurringContract = {
      ...rc,
      id: `rec_${Date.now()}`,
      solutionName: rc.solutionName || rc.serviceName || 'Serviço Recorrente',
      serviceName: rc.serviceName || rc.solutionName || 'Serviço Recorrente',
      periodicity: rc.periodicity || (rc.interval as any) || 'mensal',
      paymentMethod: rc.paymentMethod || 'Pix',
      nextBillingDate: rc.nextBillingDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      nextRenewalDate: rc.nextRenewalDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    };
    setRecurringContracts((prev) => [newRc, ...prev]);
    syncRecurringToSupabase(newRc);
    showToast({
      type: 'success',
      title: 'Contrato Recorrente Adicionado',
      message: `${newRc.solutionName || newRc.serviceName} para ${newRc.clientName}`
    });
  };

  const updateRecurringContract = (id: string, updates: Partial<RecurringContract>) => {
    setRecurringContracts((prev) => {
      const next = prev.map((rc) => (rc.id === id ? { ...rc, ...updates } : rc));
      const target = next.find((rc) => rc.id === id);
      if (target) syncRecurringToSupabase(target);
      return next;
    });
  };

  // Product actions
  const addProduct = (product: Omit<SolutionProduct, 'id' | 'salesCount' | 'totalRevenueBRL' | 'totalRevenueUSD'>) => {
    const newProd: SolutionProduct = {
      ...product,
      id: `prod_${Date.now()}`,
      salesCount: 0,
      totalRevenueBRL: 0,
      totalRevenueUSD: 0,
    };
    setProducts((prev) => [newProd, ...prev]);
    syncProductToSupabase(newProd);
    showToast({
      type: 'success',
      title: 'Solução Criada',
      message: `${newProd.name} adicionada ao catálogo de produtos.`
    });
  };

  const updateProduct = (id: string, updates: Partial<SolutionProduct>) => {
    setProducts((prev) => {
      const next = prev.map((p) => (p.id === id ? { ...p, ...updates } : p));
      const target = next.find((p) => p.id === id);
      if (target) syncProductToSupabase(target);
      return next;
    });
    showToast({
      type: 'info',
      title: 'Solução Atualizada',
      message: 'Alterações no catálogo salvas com sucesso.'
    });
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    deleteProductFromSupabase(id);
    showToast({
      type: 'warning',
      title: 'Solução Removida',
      message: 'Produto descontinuado/removido do catálogo.'
    });
  };

  const duplicateProduct = (id: string) => {
    const original = products.find((p) => p.id === id);
    if (!original) return;
    const duplicated: SolutionProduct = {
      ...original,
      id: `prod_${Date.now()}`,
      name: `${original.name} (Cópia)`,
      salesCount: 0,
      totalRevenueBRL: 0,
      totalRevenueUSD: 0,
    };
    setProducts((prev) => [duplicated, ...prev]);
    syncProductToSupabase(duplicated);
    showToast({
      type: 'success',
      title: 'Solução Duplicada',
      message: `Uma cópia de ${original.name} foi criada.`
    });
  };

  // Team actions
  const addTeamMember = (member: Omit<TeamMember, 'id'>) => {
    const newMember: TeamMember = {
      ...member,
      id: `team_${Date.now()}`,
    };
    setTeam((prev) => [...prev, newMember]);
    syncTeamMemberToSupabase(newMember);
    showToast({
      type: 'success',
      title: 'Membro Adicionado',
      message: `${newMember.name} integrado à equipe FSM.`
    });
  };

  const updateTeamMember = (id: string, updates: Partial<TeamMember>) => {
    setTeam((prev) => {
      const next = prev.map((m) => (m.id === id ? { ...m, ...updates } : m));
      const target = next.find((m) => m.id === id);
      if (target) syncTeamMemberToSupabase(target);
      return next;
    });
  };

  const deleteTeamMember = (id: string) => {
    setTeam((prev) => prev.filter((m) => m.id !== id));
    deleteTeamMemberFromSupabase(id);
    showToast({
      type: 'warning',
      title: 'Membro Removido',
      message: 'Registro de equipe removido.'
    });
  };

  // Settings & System
  const updateSettings = (updates: Partial<CompanySettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...updates };
      syncSettingsToSupabase(next);
      return next;
    });
    showToast({
      type: 'success',
      title: 'Configurações Salvas',
      message: 'As preferências operacionais foram atualizadas.'
    });
  };

  const resetToDefaultData = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
    setLeads(INITIAL_LEADS);
    setStages(DEFAULT_STAGES);
    setClients(INITIAL_CLIENTS);
    setProjects(INITIAL_PROJECTS);
    setTransactions(INITIAL_TRANSACTIONS);
    setRecurringContracts(INITIAL_RECURRING);
    setProducts(INITIAL_PRODUCTS);
    setTeam(INITIAL_TEAM);
    setSettings(DEFAULT_SETTINGS);
    showToast({
      type: 'info',
      title: 'Dados Restaurados',
      message: 'O sistema foi restaurado para a base demonstrativa inicial da FSM Company.'
    });
  };

  const exportBackupJson = () => {
    const data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      company: settings.companyName,
      leads,
      stages,
      clients,
      projects,
      transactions,
      recurringContracts,
      products,
      team,
      settings,
    };
    const jsonStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonStr);
    downloadAnchor.setAttribute('download', `FSM_Company_Backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast({
      type: 'success',
      title: 'Backup Exportado',
      message: 'Arquivo JSON gerado e salvo com sucesso.'
    });
  };

  const importBackupJson = (jsonData: string): boolean => {
    try {
      const parsed = JSON.parse(jsonData);
      if (parsed.leads) setLeads(parsed.leads);
      if (parsed.stages) setStages(parsed.stages);
      if (parsed.clients) setClients(parsed.clients);
      if (parsed.projects) setProjects(parsed.projects);
      if (parsed.transactions) setTransactions(parsed.transactions);
      if (parsed.recurringContracts) setRecurringContracts(parsed.recurringContracts);
      if (parsed.products) setProducts(parsed.products);
      if (parsed.team) setTeam(parsed.team);
      if (parsed.settings) setSettings(parsed.settings);
      showToast({
        type: 'success',
        title: 'Backup Restaurado',
        message: 'Dados importados com sucesso a partir do arquivo JSON.'
      });
      return true;
    } catch (e) {
      console.error(e);
      showToast({
        type: 'error',
        title: 'Falha na Importação',
        message: 'Arquivo JSON inválido ou corrompido.'
      });
      return false;
    }
  };

  // Supabase management actions
  const testSupabase = async () => {
    const res = await testSupabaseConnection();
    setIsSupabaseConnected(res.success);
    setSupabaseStatusMessage(res.message);
    showToast({
      type: res.success ? 'success' : 'error',
      title: res.success ? 'Supabase Conectado' : 'Falha na Conexão Supabase',
      message: res.message,
    });
    return res;
  };

  const syncAllToSupabase = async () => {
    const res = await pushAllLocalDataToSupabase({
      leads,
      clients,
      projects,
      transactions,
      recurringContracts,
      products,
      team,
      settings,
    });
    if (res.success) {
      setIsSupabaseConnected(true);
      setSupabaseStatusMessage('Dados sincronizados com o Supabase com sucesso.');
      showToast({
        type: 'success',
        title: 'Sincronização Concluída',
        message: res.message,
      });
    } else {
      showToast({
        type: 'error',
        title: 'Erro na Sincronização',
        message: res.message,
      });
    }
    return res;
  };

  const reloadFromSupabase = async () => {
    if (!isSupabaseConfigured()) {
      const msg = 'Supabase não está configurado nas variáveis de ambiente.';
      showToast({ type: 'warning', title: 'Aviso', message: msg });
      return { success: false, message: msg };
    }
    try {
      const remoteData = await fetchFullStateFromSupabase(DEFAULT_STAGES, DEFAULT_SETTINGS);
      if (remoteData) {
        setLeads(remoteData.leads);
        setStages(remoteData.stages);
        setClients(remoteData.clients);
        setProjects(remoteData.projects);
        setTransactions(remoteData.transactions);
        setRecurringContracts(remoteData.recurringContracts);
        setProducts(remoteData.products.length > 0 ? remoteData.products : INITIAL_PRODUCTS);
        setTeam(remoteData.team);
        setSettings(remoteData.settings);
        setIsSupabaseConnected(true);
        const msg = `Carregados do Supabase: ${remoteData.leads.length} leads, ${remoteData.clients.length} clientes, ${remoteData.projects.length} projetos, ${remoteData.transactions.length} transações.`;
        showToast({
          type: 'success',
          title: 'Dados Recarregados',
          message: msg,
        });
        return { success: true, message: msg };
      } else {
        const msg = 'Não foi possível carregar os dados. Verifique se o schema.sql foi executado no Supabase.';
        showToast({ type: 'error', title: 'Erro de Leitura', message: msg });
        return { success: false, message: msg };
      }
    } catch (err: any) {
      const msg = err?.message || 'Erro ao carregar dados do Supabase.';
      showToast({ type: 'error', title: 'Erro', message: msg });
      return { success: false, message: msg };
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentTab,
        setCurrentTab,
        isSidebarCollapsed,
        setIsSidebarCollapsed,
        isCommandPaletteOpen,
        setIsCommandPaletteOpen,
        selectedLeadId,
        setSelectedLeadId,
        selectedClientId,
        setSelectedClientId,
        selectedProjectId,
        setSelectedProjectId,
        currencyFilter,
        setCurrencyFilter,
        periodFilter,
        setPeriodFilter,
        locationFilter,
        setLocationFilter,
        toasts,
        showToast,
        removeToast,
        leads,
        stages,
        clients,
        projects,
        transactions,
        recurringContracts,
        products,
        team,
        settings,
        addLead,
        updateLead,
        deleteLead,
        moveLeadStage,
        markLeadAsWon,
        markLeadAsLost,
        addLeadActivity,
        importLeads,
        convertLeadToClient,
        addClient,
        updateClient,
        deleteClient,
        addProject,
        updateProject,
        releaseProject,
        startProjectExecution,
        deleteProject,
        updateTaskStatus,
        toggleTaskStatus,
        toggleChecklistItem,
        addTaskToProject,
        addProjectTask,
        addProjectPhase,
        addProjectComment,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        markTransactionAsPaid,
        addRecurringContract,
        updateRecurringContract,
        addProduct,
        updateProduct,
        deleteProduct,
        duplicateProduct,
        addTeamMember,
        updateTeamMember,
        deleteTeamMember,
        updateSettings,
        resetToDefaultData,
        resetToInitialData: resetToDefaultData,
        exportBackupJson,
        exportBackupJSON: exportBackupJson,
        importBackupJson,
        importBackupJSON: importBackupJson,
        isSupabaseConfigured: isSupabaseConfigured(),
        isSupabaseConnected,
        supabaseStatusMessage,
        testSupabase,
        syncAllToSupabase,
        reloadFromSupabase,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
