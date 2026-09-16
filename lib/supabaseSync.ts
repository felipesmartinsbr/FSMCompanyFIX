import { getSupabase, isSupabaseConfigured } from './supabaseClient';
import {
  Lead,
  LeadStage,
  Client,
  Project,
  FinancialTransaction,
  RecurringContract,
  SolutionProduct,
  TeamMember,
  CompanySettings,
  Currency,
} from '@/types';

// ============================================================================
// CONVERSÕES DE TIPOS: TYPESCRIPT (camelCase) <-> SUPABASE (snake_case)
// ============================================================================

export function leadToDb(lead: Lead) {
  return {
    id: lead.id,
    company_name: lead.companyName,
    trade_name: lead.tradeName || null,
    category: lead.category || null,
    description: lead.description || null,
    website: lead.website || null,
    google_maps_url: lead.googleMapsUrl || null,
    gbp_status: lead.gbpStatus || null,
    google_rating: lead.googleRating || null,
    review_count: lead.reviewCount || 0,
    phone: lead.phone || null,
    whatsapp: lead.whatsapp || null,
    email: lead.email || null,
    address: lead.address || null,
    city: lead.city || null,
    state: lead.state || null,
    country: lead.country || 'Brasil',
    postal_code: lead.postalCode || null,
    responsible_name: lead.responsibleName || null,
    source: lead.source,
    stage_id: lead.stageId,
    status: lead.status,
    temperature: lead.temperature,
    service_of_interest: lead.serviceOfInterest || null,
    estimated_value: lead.estimatedValue,
    currency: lead.currency,
    closing_probability: lead.closingProbability,
    created_at: lead.createdAt,
    last_contact_date: lead.lastContactDate || null,
    next_meeting_date: lead.nextMeetingDate || null,
    next_follow_up_date: lead.nextFollowUpDate || null,
    loss_reason: lead.lossReason || null,
    loss_custom_note: lead.lossCustomNote || null,
    notes: lead.notes || null,
    contacts: lead.contacts || [],
    activities: lead.activities || [],
  };
}

export function dbToLead(row: any): Lead {
  return {
    id: row.id,
    companyName: row.company_name,
    tradeName: row.trade_name || undefined,
    category: row.category || undefined,
    description: row.description || undefined,
    website: row.website || undefined,
    googleMapsUrl: row.google_maps_url || undefined,
    gbpStatus: row.gbp_status || undefined,
    googleRating: row.google_rating ? Number(row.google_rating) : undefined,
    reviewCount: row.review_count ? Number(row.review_count) : 0,
    phone: row.phone || undefined,
    whatsapp: row.whatsapp || undefined,
    email: row.email || undefined,
    address: row.address || undefined,
    city: row.city || undefined,
    state: row.state || undefined,
    country: row.country || 'Brasil',
    postalCode: row.postal_code || undefined,
    responsibleName: row.responsible_name || 'Felipe Martins',
    source: row.source || 'Outro',
    stageId: row.stage_id,
    status: row.status,
    temperature: row.temperature || 'morno',
    serviceOfInterest: row.service_of_interest || undefined,
    estimatedValue: Number(row.estimated_value) || 0,
    currency: row.currency || 'BRL',
    closingProbability: Number(row.closing_probability) || 50,
    createdAt: row.created_at || new Date().toISOString(),
    lastContactDate: row.last_contact_date || undefined,
    nextMeetingDate: row.next_meeting_date || undefined,
    nextFollowUpDate: row.next_follow_up_date || undefined,
    lossReason: row.loss_reason || undefined,
    lossCustomNote: row.loss_custom_note || undefined,
    notes: row.notes || undefined,
    contacts: Array.isArray(row.contacts) ? row.contacts : [],
    activities: Array.isArray(row.activities) ? row.activities : [],
  };
}

export function clientToDb(client: Client) {
  return {
    id: client.id,
    company_name: client.companyName,
    trade_name: client.tradeName || null,
    legal_name: client.legalName || null,
    cnpj_cpf: client.cnpjCpf || null,
    contact_name: client.contactName || null,
    email: client.email || null,
    phone: client.phone || null,
    whatsapp: client.whatsapp || null,
    address: client.address || null,
    city: client.city || null,
    state: client.state || null,
    country: client.country || 'Brasil',
    postal_code: client.postalCode || null,
    status: client.status,
    source: client.source || null,
    lead_id: client.leadId || null,
    start_date: client.startDate,
    account_manager: client.accountManager || null,
    currency: client.currency,
    billing_day: client.billingDay || 10,
    total_paid_brl: client.totalPaidBRL || 0,
    total_paid_usd: client.totalPaidUSD || 0,
    outstanding_balance_brl: client.outstandingBalanceBRL || 0,
    outstanding_balance_usd: client.outstandingBalanceUSD || 0,
    monthly_contract_value: client.monthlyContractValue || 0,
    notes: client.notes || null,
    contacts: client.contacts || [],
    documents: client.documents || [],
  };
}

export function dbToClient(row: any): Client {
  return {
    id: row.id,
    leadOriginId: row.lead_id || undefined,
    companyName: row.company_name,
    tradeName: row.trade_name || undefined,
    legalName: row.legal_name || undefined,
    cnpjCpf: row.cnpj_cpf || undefined,
    contactName: row.contact_name || undefined,
    category: row.category || 'Geral',
    website: row.website || undefined,
    email: row.email || undefined,
    phone: row.phone || undefined,
    whatsapp: row.whatsapp || undefined,
    address: row.address || undefined,
    city: row.city || 'São Paulo',
    state: row.state || 'SP',
    country: row.country || 'Brasil',
    postalCode: row.postal_code || undefined,
    primaryContactName: row.contact_name || row.primary_contact_name || row.company_name,
    primaryContactRole: 'Responsável',
    primaryContactPhone: row.phone || undefined,
    primaryContactEmail: row.email || undefined,
    servicesSubscribed: Array.isArray(row.services_subscribed) ? row.services_subscribed : [],
    status: row.status,
    healthScore: row.health_score || 'excelente',
    responsibleName: row.account_manager || 'Diretoria Executiva',
    contractedValue: Number(row.contracted_value) || Number(row.monthly_contract_value) || 0,
    currency: row.currency || 'BRL',
    billingType: row.billing_type || 'fixo',
    recurringValue: Number(row.monthly_contract_value) || 0,
    recurringAmount: Number(row.monthly_contract_value) || 0,
    monthlyRecurringValue: Number(row.monthly_contract_value) || 0,
    startDate: row.start_date || new Date().toISOString().split('T')[0],
    source: row.source || undefined,
    leadId: row.lead_id || undefined,
    accountManager: row.account_manager || 'Diretoria Executiva',
    billingDay: Number(row.billing_day) || 10,
    totalPaidBRL: Number(row.total_paid_brl) || 0,
    totalPaidUSD: Number(row.total_paid_usd) || 0,
    outstandingBalanceBRL: Number(row.outstanding_balance_brl) || 0,
    outstandingBalanceUSD: Number(row.outstanding_balance_usd) || 0,
    monthlyContractValue: Number(row.monthly_contract_value) || 0,
    notes: row.notes || undefined,
    contacts: Array.isArray(row.contacts) ? row.contacts : [],
    documents: Array.isArray(row.documents) ? row.documents : [],
  };
}

export function projectToDb(project: Project) {
  return {
    id: project.id,
    name: project.name,
    client_id: project.clientId,
    client_name: project.clientName,
    status: project.status,
    priority: project.priority || 'media',
    service_type: project.serviceType || null,
    product_id: project.productId || null,
    responsible_name: project.responsibleName,
    start_date: project.startDate,
    actual_start_date: project.actualStartDate || null,
    due_date: project.dueDate,
    completed_date: project.completedDate || null,
    progress_percentage: project.progressPercentage || 0,
    currency: project.currency,
    contract_value: project.contractValue || 0,
    is_released: project.isReleased ?? true,
    released_at: project.releasedAt || null,
    financial_transaction_id: project.financialTransactionId || null,
    google_drive_url: project.googleDriveUrl || null,
    figma_url: project.figmaUrl || null,
    live_url: project.liveUrl || null,
    notes: project.notes || null,
    phases: project.phases || [],
    comments: project.comments || [],
    files: project.files || [],
    meetings: project.meetings || [],
  };
}

export function dbToProject(row: any): Project {
  return {
    id: row.id,
    name: row.name,
    clientId: row.client_id,
    clientName: row.client_name,
    status: row.status,
    priority: row.priority || 'media',
    serviceType: row.service_type || undefined,
    productId: row.product_id || undefined,
    responsibleName: row.responsible_name || 'Felipe Martins',
    startDate: row.start_date,
    actualStartDate: row.actual_start_date || undefined,
    dueDate: row.due_date,
    completedDate: row.completed_date || undefined,
    progressPercentage: Number(row.progress_percentage) || 0,
    currency: row.currency || 'BRL',
    contractValue: Number(row.contract_value) || 0,
    isReleased: row.is_released ?? true,
    releasedAt: row.released_at || undefined,
    financialTransactionId: row.financial_transaction_id || undefined,
    googleDriveUrl: row.google_drive_url || undefined,
    figmaUrl: row.figma_url || undefined,
    liveUrl: row.live_url || undefined,
    notes: row.notes || undefined,
    phases: Array.isArray(row.phases) ? row.phases : [],
    comments: Array.isArray(row.comments) ? row.comments : [],
    files: Array.isArray(row.files) ? row.files : [],
    meetings: Array.isArray(row.meetings) ? row.meetings : [],
  };
}

export function transactionToDb(tx: FinancialTransaction) {
  return {
    id: tx.id,
    type: tx.type,
    category: tx.category,
    title: tx.title,
    description: tx.description || tx.title,
    amount: tx.amount,
    currency: tx.currency,
    amount_in_primary_currency: tx.amountInPrimaryCurrency || null,
    exchange_rate_applied: tx.exchangeRateApplied || null,
    status: tx.status,
    due_date: tx.dueDate,
    payment_date: tx.paymentDate || null,
    issue_date: tx.issueDate,
    client_id: tx.clientId || null,
    client_name: tx.clientName || null,
    project_id: tx.projectId || null,
    project_name: tx.projectName || null,
    payment_method: tx.paymentMethod,
    payment_link: tx.paymentLink || null,
    invoice_number: tx.invoiceNumber || null,
    installment_number: tx.installmentNumber || 1,
    total_installments: tx.totalInstallments || 1,
    cost_center: tx.costCenter || null,
    supplier_name: tx.supplierName || null,
    recurring_contract_id: tx.recurringContractId || null,
    notes: tx.notes || null,
  };
}

export function dbToTransaction(row: any): FinancialTransaction {
  return {
    id: row.id,
    type: row.type,
    title: row.title || row.description || 'Lançamento Financeiro',
    category: row.category,
    description: row.description,
    amount: Number(row.amount) || 0,
    currency: row.currency || 'BRL',
    amountInPrimaryCurrency: row.amount_in_primary_currency ? Number(row.amount_in_primary_currency) : undefined,
    exchangeRateApplied: row.exchange_rate_applied ? Number(row.exchange_rate_applied) : undefined,
    status: row.status,
    dueDate: row.due_date,
    paymentDate: row.payment_date || undefined,
    issueDate: row.issue_date,
    clientId: row.client_id || undefined,
    clientName: row.client_name || undefined,
    projectId: row.project_id || undefined,
    projectName: row.project_name || undefined,
    paymentMethod: row.payment_method || 'Pix',
    paymentLink: row.payment_link || undefined,
    invoiceNumber: row.invoice_number || undefined,
    installmentNumber: row.installment_number || 1,
    totalInstallments: row.total_installments || 1,
    costCenter: row.cost_center || undefined,
    supplierName: row.supplier_name || undefined,
    recurringContractId: row.recurring_contract_id || undefined,
    notes: row.notes || undefined,
  };
}

export function recurringToDb(rc: RecurringContract) {
  return {
    id: rc.id,
    client_id: rc.clientId,
    client_name: rc.clientName,
    product_name: rc.productName,
    recurring_amount: rc.recurringAmount,
    currency: rc.currency,
    billing_interval: rc.billingInterval,
    billing_day: rc.billingDay,
    start_date: rc.startDate,
    next_billing_date: rc.nextBillingDate,
    status: rc.status,
    payment_method: rc.paymentMethod,
    notes: rc.notes || null,
  };
}

export function dbToRecurring(row: any): RecurringContract {
  return {
    id: row.id,
    clientId: row.client_id,
    clientName: row.client_name,
    productName: row.product_name,
    recurringAmount: Number(row.recurring_amount) || 0,
    currency: row.currency || 'BRL',
    billingInterval: row.billing_interval || 'mensal',
    billingDay: Number(row.billing_day) || 10,
    startDate: row.start_date,
    nextBillingDate: row.next_billing_date,
    status: row.status,
    paymentMethod: row.payment_method || 'Boleto',
    notes: row.notes || undefined,
  };
}

export function productToDb(p: SolutionProduct) {
  return {
    id: p.id,
    name: p.name,
    category: p.category,
    short_description: p.shortDescription || null,
    full_description: p.fullDescription || null,
    status: p.status || 'ativo',
    target_audience: p.targetAudience || null,
    recommended_niched: p.recommendedNiched || [],
    problem_solved: p.problemSolved || null,
    benefits: p.benefits || [],
    price_brl: p.priceBRL,
    price_usd: p.priceUSD,
    billing_type: p.billingType,
    default_currency: p.defaultCurrency,
    estimated_days_min: p.estimatedDaysMin || 7,
    estimated_days_max: p.estimatedDaysMax || 15,
    responsible_name: p.responsibleName || null,
    sales_count: p.salesCount || 0,
    total_revenue_brl: p.totalRevenueBRL || 0,
    total_revenue_usd: p.totalRevenueUSD || 0,
    components: p.components || [],
    project_template_phases: p.projectTemplatePhases || [],
  };
}

export function dbToProduct(row: any): SolutionProduct {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    shortDescription: row.short_description || '',
    fullDescription: row.full_description || '',
    status: row.status || 'ativo',
    targetAudience: row.target_audience || '',
    recommendedNiched: Array.isArray(row.recommended_niched) ? row.recommended_niched : [],
    problemSolved: row.problem_solved || '',
    benefits: Array.isArray(row.benefits) ? row.benefits : [],
    priceBRL: Number(row.price_brl) || 0,
    priceUSD: Number(row.price_usd) || 0,
    billingType: row.billing_type || 'fixo',
    defaultCurrency: row.default_currency || 'BRL',
    estimatedDaysMin: Number(row.estimated_days_min) || 7,
    estimatedDaysMax: Number(row.estimated_days_max) || 15,
    responsibleName: row.responsible_name || 'Felipe Martins',
    salesCount: Number(row.sales_count) || 0,
    totalRevenueBRL: Number(row.total_revenue_brl) || 0,
    totalRevenueUSD: Number(row.total_revenue_usd) || 0,
    components: Array.isArray(row.components) ? row.components : [],
    projectTemplatePhases: Array.isArray(row.project_template_phases) ? row.project_template_phases : [],
  };
}

export function teamToDb(m: TeamMember) {
  return {
    id: m.id,
    name: m.name,
    role: m.role,
    department: m.department || null,
    email: m.email,
    phone: m.phone || null,
    whatsapp: m.whatsapp || null,
    country: m.country || 'Brasil',
    city: m.city || null,
    contract_type: m.contractType || 'PJ',
    monthly_cost: m.monthlyCost || 0,
    currency: m.paymentCurrency || m.currency || 'BRL',
    status: m.status || 'ativo',
    start_date: m.startDate,
    skills: m.skills || [],
    notes: m.notes || null,
  };
}

export function dbToTeam(row: any): TeamMember {
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    department: row.department || undefined,
    email: row.email,
    phone: row.phone || '',
    whatsapp: row.whatsapp || undefined,
    country: row.country || 'Brasil',
    city: row.city || undefined,
    paymentCurrency: (row.currency || 'BRL') as Currency,
    contractType: row.contract_type || 'PJ',
    monthlyCost: Number(row.monthly_cost) || 0,
    currency: (row.currency || 'BRL') as Currency,
    status: row.status || 'ativo',
    startDate: row.start_date || new Date().toISOString().split('T')[0],
    skills: Array.isArray(row.skills) ? row.skills : [],
    notes: row.notes || undefined,
  };
}

export function settingsToDb(s: CompanySettings) {
  return {
    id: 'default',
    company_name: s.companyName,
    trade_name: s.tradeName || null,
    legal_name: s.legalName || null,
    logo_text: s.logoText || 'FSM',
    tax_id: s.taxId || null,
    email: s.email || null,
    phone: s.phone || null,
    primary_currency: s.primaryCurrency,
    exchange_rate_brl_to_usd: s.exchangeRateBRLtoUSD,
    usd_to_brl_rate: s.usdToBrlRate,
    base_country: s.baseCountry,
    operating_cities: s.operatingCities || [],
    timezone: s.timezone,
    owner_name: s.ownerName,
    owner_email: s.ownerEmail,
  };
}

export function dbToSettings(row: any, fallback: CompanySettings): CompanySettings {
  if (!row) return fallback;
  return {
    companyName: row.company_name || fallback.companyName,
    tradeName: row.trade_name || fallback.tradeName,
    legalName: row.legal_name || fallback.legalName,
    logoText: row.logo_text || fallback.logoText,
    taxId: row.tax_id || fallback.taxId,
    email: row.email || fallback.email,
    phone: row.phone || fallback.phone,
    primaryCurrency: row.primary_currency || fallback.primaryCurrency,
    exchangeRateBRLtoUSD: Number(row.exchange_rate_brl_to_usd) || fallback.exchangeRateBRLtoUSD,
    usdToBrlRate: Number(row.usd_to_brl_rate) || fallback.usdToBrlRate,
    baseCountry: row.base_country || fallback.baseCountry,
    operatingCities: Array.isArray(row.operating_cities) ? row.operating_cities : fallback.operatingCities,
    timezone: row.timezone || fallback.timezone,
    ownerName: row.owner_name || fallback.ownerName,
    ownerEmail: row.owner_email || fallback.ownerEmail,
  };
}

// ============================================================================
// SERVIÇOS DE LEITURA & ESCRITA SUPABASE
// ============================================================================

export async function fetchFullStateFromSupabase(defaultStages: LeadStage[], defaultSettings: CompanySettings) {
  const supabase = getSupabase();
  if (!supabase) return null;

  try {
    const [
      leadsRes,
      stagesRes,
      clientsRes,
      projectsRes,
      txRes,
      rcRes,
      prodRes,
      teamRes,
      settingsRes,
    ] = await Promise.all([
      supabase.from('leads').select('*').order('created_at', { ascending: false }),
      supabase.from('lead_stages').select('*').order('order', { ascending: true }),
      supabase.from('clients').select('*').order('created_at', { ascending: false }),
      supabase.from('projects').select('*').order('due_date', { ascending: true }),
      supabase.from('financial_transactions').select('*').order('due_date', { ascending: false }),
      supabase.from('recurring_contracts').select('*').order('next_billing_date', { ascending: true }),
      supabase.from('solution_products').select('*').order('name', { ascending: true }),
      supabase.from('team_members').select('*').order('name', { ascending: true }),
      supabase.from('company_settings').select('*').eq('id', 'default').maybeSingle(),
    ]);

    // Caso a tabela principal dê erro de tabela não existente, sinaliza que o schema precisa ser rodado
    if (leadsRes.error) {
      console.warn('Erro ao consultar leads do Supabase:', leadsRes.error.message);
      return null;
    }

    const leads: Lead[] = (leadsRes.data || []).map(dbToLead);
    const stages: LeadStage[] = (stagesRes.data && stagesRes.data.length > 0)
      ? stagesRes.data.map((r: any) => ({ id: r.id, name: r.name, color: r.color, order: r.order }))
      : defaultStages;
    const clients: Client[] = (clientsRes.data || []).map(dbToClient);
    const projects: Project[] = (projectsRes.data || []).map(dbToProject);
    const transactions: FinancialTransaction[] = (txRes.data || []).map(dbToTransaction);
    const recurringContracts: RecurringContract[] = (rcRes.data || []).map(dbToRecurring);
    const products: SolutionProduct[] = (prodRes.data || []).map(dbToProduct);
    const team: TeamMember[] = (teamRes.data || []).map(dbToTeam);
    const settings: CompanySettings = dbToSettings(settingsRes.data, defaultSettings);

    return {
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
  } catch (err) {
    console.error('Falha geral ao carregar dados do Supabase:', err);
    return null;
  }
}

// Operações unitárias assíncronas no Supabase (com silenciamento gracioso de erros de rede)
export async function syncLeadToSupabase(lead: Lead) {
  const supabase = getSupabase();
  if (!supabase) return;
  try {
    await supabase.from('leads').upsert(leadToDb(lead));
  } catch (e) {
    console.error('Erro ao sincronizar lead no Supabase:', e);
  }
}

export async function deleteLeadFromSupabase(id: string) {
  const supabase = getSupabase();
  if (!supabase) return;
  try {
    await supabase.from('leads').delete().eq('id', id);
  } catch (e) {
    console.error('Erro ao deletar lead no Supabase:', e);
  }
}

export async function syncClientToSupabase(client: Client) {
  const supabase = getSupabase();
  if (!supabase) return;
  try {
    await supabase.from('clients').upsert(clientToDb(client));
  } catch (e) {
    console.error('Erro ao sincronizar cliente no Supabase:', e);
  }
}

export async function deleteClientFromSupabase(id: string) {
  const supabase = getSupabase();
  if (!supabase) return;
  try {
    await supabase.from('clients').delete().eq('id', id);
  } catch (e) {
    console.error('Erro ao deletar cliente no Supabase:', e);
  }
}

export async function syncProjectToSupabase(project: Project) {
  const supabase = getSupabase();
  if (!supabase) return;
  try {
    await supabase.from('projects').upsert(projectToDb(project));
  } catch (e) {
    console.error('Erro ao sincronizar projeto no Supabase:', e);
  }
}

export async function deleteProjectFromSupabase(id: string) {
  const supabase = getSupabase();
  if (!supabase) return;
  try {
    await supabase.from('projects').delete().eq('id', id);
  } catch (e) {
    console.error('Erro ao deletar projeto no Supabase:', e);
  }
}

export async function syncTransactionToSupabase(tx: FinancialTransaction) {
  const supabase = getSupabase();
  if (!supabase) return;
  try {
    await supabase.from('financial_transactions').upsert(transactionToDb(tx));
  } catch (e) {
    console.error('Erro ao sincronizar transação no Supabase:', e);
  }
}

export async function deleteTransactionFromSupabase(id: string) {
  const supabase = getSupabase();
  if (!supabase) return;
  try {
    await supabase.from('financial_transactions').delete().eq('id', id);
  } catch (e) {
    console.error('Erro ao deletar transação no Supabase:', e);
  }
}

export async function syncRecurringToSupabase(rc: RecurringContract) {
  const supabase = getSupabase();
  if (!supabase) return;
  try {
    await supabase.from('recurring_contracts').upsert(recurringToDb(rc));
  } catch (e) {
    console.error('Erro ao sincronizar contrato no Supabase:', e);
  }
}

export async function deleteRecurringFromSupabase(id: string) {
  const supabase = getSupabase();
  if (!supabase) return;
  try {
    await supabase.from('recurring_contracts').delete().eq('id', id);
  } catch (e) {
    console.error('Erro ao deletar contrato no Supabase:', e);
  }
}

export async function syncProductToSupabase(p: SolutionProduct) {
  const supabase = getSupabase();
  if (!supabase) return;
  try {
    await supabase.from('solution_products').upsert(productToDb(p));
  } catch (e) {
    console.error('Erro ao sincronizar produto no Supabase:', e);
  }
}

export async function deleteProductFromSupabase(id: string) {
  const supabase = getSupabase();
  if (!supabase) return;
  try {
    await supabase.from('solution_products').delete().eq('id', id);
  } catch (e) {
    console.error('Erro ao deletar produto no Supabase:', e);
  }
}

export async function syncTeamMemberToSupabase(m: TeamMember) {
  const supabase = getSupabase();
  if (!supabase) return;
  try {
    await supabase.from('team_members').upsert(teamToDb(m));
  } catch (e) {
    console.error('Erro ao sincronizar colaborador no Supabase:', e);
  }
}

export async function deleteTeamMemberFromSupabase(id: string) {
  const supabase = getSupabase();
  if (!supabase) return;
  try {
    await supabase.from('team_members').delete().eq('id', id);
  } catch (e) {
    console.error('Erro ao deletar colaborador no Supabase:', e);
  }
}

export async function syncSettingsToSupabase(s: CompanySettings) {
  const supabase = getSupabase();
  if (!supabase) return;
  try {
    await supabase.from('company_settings').upsert(settingsToDb(s));
  } catch (e) {
    console.error('Erro ao sincronizar configurações no Supabase:', e);
  }
}

/**
 * Empurra todos os dados locais atuais para o Supabase de uma única vez (Migração inicial)
 */
export async function pushAllLocalDataToSupabase(payload: {
  leads: Lead[];
  clients: Client[];
  projects: Project[];
  transactions: FinancialTransaction[];
  recurringContracts: RecurringContract[];
  products: SolutionProduct[];
  team: TeamMember[];
  settings: CompanySettings;
}): Promise<{ success: boolean; message: string }> {
  const supabase = getSupabase();
  if (!supabase) {
    return { success: false, message: 'Supabase não está configurado nas variáveis de ambiente.' };
  }

  try {
    // 1. Settings
    await supabase.from('company_settings').upsert(settingsToDb(payload.settings));

    // 2. Products
    if (payload.products.length > 0) {
      await supabase.from('solution_products').upsert(payload.products.map(productToDb));
    }

    // 3. Clients
    if (payload.clients.length > 0) {
      await supabase.from('clients').upsert(payload.clients.map(clientToDb));
    }

    // 4. Leads
    if (payload.leads.length > 0) {
      await supabase.from('leads').upsert(payload.leads.map(leadToDb));
    }

    // 5. Projects
    if (payload.projects.length > 0) {
      await supabase.from('projects').upsert(payload.projects.map(projectToDb));
    }

    // 6. Transactions
    if (payload.transactions.length > 0) {
      await supabase.from('financial_transactions').upsert(payload.transactions.map(transactionToDb));
    }

    // 7. Recurring
    if (payload.recurringContracts.length > 0) {
      await supabase.from('recurring_contracts').upsert(payload.recurringContracts.map(recurringToDb));
    }

    // 8. Team
    if (payload.team.length > 0) {
      await supabase.from('team_members').upsert(payload.team.map(teamToDb));
    }

    return {
      success: true,
      message: 'Todos os registros locais foram sincronizados com sucesso no seu banco de dados Supabase!',
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Erro durante sincronização em lote: ${err?.message || 'Falha de comunicação'}`,
    };
  }
}
