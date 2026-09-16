export type Currency = 'BRL' | 'USD';

export type LeadTemperature = 'frio' | 'morno' | 'quente';

export type LeadStageId = 
  | 'novo_lead'
  | 'pesquisa_qualificacao'
  | 'primeiro_contato'
  | 'contato_realizado'
  | 'reuniao_agendada'
  | 'reuniao_realizada'
  | 'proposta_enviada'
  | 'negociacao'
  | 'aguardando_decisao'
  | 'ganho'
  | 'perdido'
  | 'nutricao';

export interface LeadStage {
  id: LeadStageId | string;
  name: string;
  color: string;
  order: number;
}

export type LeadSource = 
  | 'Google Maps'
  | 'Google Business Profile'
  | 'LinkedIn'
  | 'Instagram'
  | 'Indicação'
  | 'Outbound E-mail'
  | 'Cold Call / WhatsApp'
  | 'Site Orgânico'
  | 'Tráfego Pago'
  | 'Outros';

export interface ContactPerson {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  whatsapp: string;
  preferredChannel: 'whatsapp' | 'email' | 'phone' | 'outro';
  notes?: string;
}

export interface LeadActivity {
  id: string;
  type: 'ligacao' | 'whatsapp' | 'email' | 'reuniao' | 'proposta' | 'nota' | 'followup';
  title: string;
  description: string;
  date: string; // ISO string
  createdAt: string;
  result?: string;
  nextAction?: string;
  responsibleName: string;
}

export interface Lead {
  id: string;
  companyName: string;
  tradeName?: string; // Nome fantasia
  category: string; // Nicho (ex: Odontologia, Imobiliária, Restaurante, Advocacia)
  description?: string;
  website?: string;
  googleMapsUrl?: string;
  gbpStatus?: 'Nao reivindicado' | 'Incompleto' | 'Otimizado' | 'Sem presenca' | 'Excelente';
  googleRating?: number;
  reviewCount?: number;
  phone: string;
  whatsapp: string;
  email: string;
  address?: string;
  city: string;
  state: string;
  country: string;
  postalCode?: string;
  
  // Comercial
  responsibleName: string;
  source: LeadSource;
  campaign?: string;
  stageId: LeadStageId | string;
  status: 'aberto' | 'ganho' | 'perdido' | 'nutricao';
  temperature: LeadTemperature;
  serviceOfInterest: string;
  estimatedValue: number;
  dealValue?: number;
  currency: Currency;
  closingProbability: number; // 0 a 100
  createdAt: string;
  wonAt?: string;
  convertedAt?: string;
  lastContactDate?: string;
  nextFollowUpDate?: string;
  nextMeetingDate?: string;
  lossReason?: string;
  lossCustomNote?: string;
  notes?: string;
  importMetadata?: {
    score?: string | number;
    originalChannel?: string;
    originalStatus?: string;
    importedAt?: string;
    rawCriadoEm?: string;
  };
  
  // Contatos
  contacts: ContactPerson[];
  activities: LeadActivity[];
  convertedClientId?: string;
}

export type ClientStatus = 
  | 'novo'
  | 'onboarding'
  | 'ativo'
  | 'execucao'
  | 'aguardando_cliente'
  | 'pausado'
  | 'inativo'
  | 'cancelado'
  | 'churn';

export interface Client {
  id: string;
  leadOriginId?: string;
  companyName: string;
  tradeName?: string;
  category: string;
  website?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  city: string;
  state: string;
  country: string;
  postalCode?: string;
  
  primaryContactName: string;
  primaryContactRole?: string;
  primaryContactPhone?: string;
  primaryContactEmail?: string;
  
  servicesSubscribed: string[];
  status: ClientStatus;
  healthScore?: 'excelente' | 'bom' | 'atencao' | 'critico';
  responsibleName?: string;
  contractedValue: number;
  currency: Currency;
  billingType: 'fixo' | 'recorrente' | 'hibrido';
  recurringValue?: number;
  recurringAmount?: number;
  nextBillingDate?: string;
  nextRenewalDate?: string;
  startDate: string;
  lastContactDate?: string;
  notes?: string;
  
  contacts: ContactPerson[];
  documents: { id: string; name: string; url?: string; date: string; category: string }[];
  sharedLinks?: { id: string; title: string; url: string; type?: string }[];
  documentNumber?: string;
  taxId?: string;
  paymentMethod?: string;
  accountManager?: string;
  monthlyRecurringValue?: number;
  contractStartDate?: string;
  contractEndDate?: string;
  convertedClientId?: string;
  legalName?: string;
  cnpjCpf?: string;
  contactName?: string;
  source?: string;
  leadId?: string;
  billingDay?: number;
  totalPaidBRL?: number;
  totalPaidUSD?: number;
  outstandingBalanceBRL?: number;
  outstandingBalanceUSD?: number;
  monthlyContractValue?: number;
}

export type ProjectStatus = 
  | 'planejamento'
  | 'onboarding'
  | 'aguardando_pagamento'
  | 'liberado'
  | 'em_andamento'
  | 'aguardando_cliente'
  | 'aguardando_material'
  | 'em_revisao'
  | 'pausado'
  | 'bloqueado'
  | 'concluido'
  | 'cancelado';

export type ProjectPriority = 
  | 'baixa' 
  | 'media' 
  | 'alta' 
  | 'urgente' 
  | (string & {});

export interface TaskChecklistItem {
  id: string;
  title: string;
  completed: boolean;
  isCompleted?: boolean;
}

export interface ProjectTask {
  id: string;
  projectId: string;
  phaseId: string;
  title: string;
  description?: string;
  responsibleName: string;
  status: 'a_fazer' | 'em_andamento' | 'em_revisao' | 'bloqueada' | 'concluida' | 'cancelada';
  priority: 'baixa' | 'media' | 'alta' | 'urgente';
  startDate?: string;
  dueDate: string;
  completedAt?: string;
  estimatedHours?: number;
  checklist: TaskChecklistItem[];
  commentsCount?: number;
}

export interface ProjectPhase {
  id: string;
  projectId: string;
  title: string;
  name?: string;
  order: number;
  status: 'pendente' | 'em_andamento' | 'concluida';
  responsibleName?: string;
  dueDate?: string;
  tasks: ProjectTask[];
}

export interface ProjectComment {
  id: string;
  projectId: string;
  authorName: string;
  authorRole: string;
  content: string;
  createdAt: string;
}

export interface ProjectFile {
  id: string;
  projectId: string;
  name: string;
  category: 'Briefing' | 'Contrato' | 'Materiais' | 'Design' | 'Desenvolvimento' | 'Entregas' | 'Comprovantes' | 'Outros';
  sizeFormatted: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface ProjectMeeting {
  id: string;
  projectId: string;
  clientId: string;
  title: string;
  date: string;
  time: string;
  durationMinutes: number;
  attendees: string[];
  meetingLink?: string;
  objective: string;
  status: 'agendada' | 'realizada' | 'cancelada';
  notes?: string;
  actionItems?: string;
}

export interface Project {
  id: string;
  clientId: string;
  clientName: string;
  solutionId?: string;
  solutionName?: string;
  serviceType?: string;
  name: string;
  description?: string;
  objective?: string;
  responsibleName: string;
  teamMembers?: string[];
  status: ProjectStatus;
  priority: ProjectPriority;
  startDate: string;
  dueDate: string;
  completedDate?: string;
  budget?: number;
  currency?: Currency;
  contractedValue?: number;
  progressPercentage: number;
  phases: ProjectPhase[];
  comments?: ProjectComment[];
  files?: ProjectFile[];
  meetings?: ProjectMeeting[];
  sharedLinks?: any[];
  notes?: string;
  leadOriginId?: string;
  saleTransactionId?: string;
  paymentConditionRequired?: 'integral' | 'entrada_50' | 'personalizado';
  paymentConditionPercentage?: number;
  isReleased?: boolean;
  releasedAt?: string;
  actualStartDate?: string;
  productId?: string;
  contractValue?: number;
  financialTransactionId?: string;
  googleDriveUrl?: string;
  figmaUrl?: string;
  liveUrl?: string;
}

export type FinancialCategory = 
  | 'Venda de Solucao'
  | 'Recorrencia Mensal'
  | 'Consultoria'
  | 'Serviço Prestado'
  | 'Ferramentas & Softwares'
  | 'Hospedagem & Dominios'
  | 'Publicidade & Trafego'
  | 'Freelancers & Parceiros'
  | 'Salarios & RH'
  | 'Impostos & Taxas'
  | 'Equipamentos & Escritorio'
  | 'Outros'
  | (string & {});

export type TransactionType = 'receita' | 'despesa';

export type TransactionStatus = 
  | 'previsto'
  | 'pendente'
  | 'pago'
  | 'parcial'
  | 'vencido'
  | 'cancelado';

export type PaymentMethod = 
  | 'Pix' 
  | 'Boleto' 
  | 'Cartao de Credito' 
  | 'Transferencia' 
  | 'Wire / Stripe' 
  | 'PayPal' 
  | 'Outro'
  | (string & {});

export interface FinancialTransaction {
  id: string;
  type: TransactionType;
  title: string;
  description?: string;
  category: FinancialCategory;
  amount: number;
  currency: Currency;
  amountInPrimaryCurrency?: number;
  exchangeRateApplied?: number;
  clientId?: string;
  clientName?: string;
  supplierName?: string; // For expenses
  supplier?: string;
  projectId?: string;
  projectName?: string;
  leadId?: string;
  paymentCondition?: 'integral' | 'entrada_50' | 'personalizado';
  conditionPercentage?: number;
  isInitialSaleReceivable?: boolean;
  issueDate?: string; // Data emissao
  dueDate: string; // Data vencimento
  paymentDate?: string; // Data efetiva
  status: TransactionStatus;
  paymentMethod: PaymentMethod;
  isRecurring?: boolean;
  billingType?: 'fixo' | 'recorrente' | 'hibrido' | string;
  installments?: { current: number; total: number };
  paymentLink?: string;
  invoiceNumber?: string;
  installmentNumber?: number;
  totalInstallments?: number;
  costCenter?: string;
  recurringContractId?: string;
  notes?: string;
  receiptAttachment?: string;
}

export type Transaction = FinancialTransaction;

export interface RecurringContract {
  id: string;
  clientId: string;
  clientName: string;
  solutionName?: string;
  serviceName?: string;
  productName?: string;
  recurringAmount: number;
  currency: Currency;
  interval?: 'mensal' | 'trimestral' | 'semestral' | 'anual' | string;
  periodicity?: 'mensal' | 'trimestral' | 'semestral' | 'anual' | string;
  billingInterval?: 'mensal' | 'trimestral' | 'semestral' | 'anual' | string;
  billingDay?: number;
  dueDay?: number;
  startDate: string;
  nextBillingDate?: string;
  nextRenewalDate?: string;
  status: 'ativo' | 'pausado' | 'cancelado';
  paymentMethod?: string;
  notes?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  department?: string;
  email: string;
  phone: string;
  whatsapp?: string;
  country: string;
  city?: string;
  paymentCurrency: Currency;
  contractType: 'PJ' | 'CLT' | 'Freelance' | 'Socio';
  startDate: string;
  status: 'ativo' | 'inativo' | 'afastado';
  monthlyCost: number;
  assignedProjectsCount?: number;
  notes?: string;
  skills?: string[];
  type?: 'fundador' | 'pj' | 'freelancer' | string;
  currency?: Currency;
}

export interface ProductComponent {
  id: string;
  name: string;
  description: string;
  order: number;
  isRequired: boolean;
  estimatedHours: number;
}

export interface ProductPhaseTemplate {
  name: string;
  order: number;
  tasks: { title: string; estimatedDays: number; checklist: string[] }[];
}

export interface SolutionProduct {
  id: string;
  name: string;
  category: 'Websites' | 'SEO' | 'Google Meu Negocio' | 'Trafego Pago' | 'Inteligencia Artificial' | 'Automacao' | 'Consultoria' | 'Outros' | string;
  shortDescription?: string;
  fullDescription?: string;
  description?: string;
  status: 'ativo' | 'rascunho' | 'descontinuado' | string;
  targetAudience?: string;
  recommendedNiched?: string[];
  problemSolved?: string;
  benefits?: string[];
  deliverables?: string[];
  templatePhases?: any[];
  
  // Pricing BRL and USD
  priceBRL?: number;
  priceUSD?: number;
  suggestedPriceBRL?: number;
  suggestedPriceUSD?: number;
  billingType?: 'fixo' | 'recorrente' | 'hibrido';
  pricingModel?: 'unico' | 'recorrente' | 'hibrido' | string;
  defaultCurrency?: Currency;
  
  estimatedDaysMin?: number;
  estimatedDaysMax?: number;
  avgDeliveryDays?: number;
  responsibleName?: string;
  components?: ProductComponent[];
  projectTemplatePhases?: ProductPhaseTemplate[];
  salesCount: number;
  totalRevenueBRL: number;
  totalRevenueUSD: number;
}

export type Product = SolutionProduct;
export type ProductCategory = SolutionProduct['category'] | string;
export type ProductPricingModel = 'unico' | 'recorrente' | 'hibrido' | string;
export type ProductStatus = SolutionProduct['status'];

export interface CompanySettings {
  companyName: string;
  tradeName: string;
  legalName?: string;
  taxId?: string;
  email?: string;
  phone?: string;
  logoText: string;
  primaryCurrency: Currency;
  exchangeRateBRLtoUSD: number; // Ex: 5.60
  usdToBrlRate: number;
  baseCountry: string;
  operatingCities: string[];
  timezone: string;
  ownerName: string;
  ownerEmail: string;
}
