import * as XLSX from 'xlsx';
import { Lead, FinancialTransaction, Client, Project, SolutionProduct, RecurringContract } from '@/types';
import { formatCurrency, formatDate } from './formatters';

export function exportLeadsToExcel(leads: Lead[], filename = 'FSM_Company_Leads.xlsx') {
  const data = leads.map((l) => ({
    'Empresa': l.companyName,
    'Nome Fantasia': l.tradeName || '',
    'Nicho / Categoria': l.category,
    'Contato Principal': l.contacts[0]?.name || '',
    'Cargo Contato': l.contacts[0]?.role || '',
    'Telefone': l.phone,
    'WhatsApp': l.whatsapp,
    'E-mail': l.email,
    'Cidade': l.city,
    'Estado': l.state,
    'País': l.country,
    'Endereço': l.address || '',
    'Google Maps URL': l.googleMapsUrl || '',
    'Status Ficha GBP': l.gbpStatus || '',
    'Avaliação Google': l.googleRating || '',
    'Qtd Avaliações': l.reviewCount || '',
    'Website': l.website || '',
    'Origem': l.source,
    'Etapa Pipeline': l.stageId,
    'Status': l.status,
    'Temperatura': l.temperature,
    'Serviço de Interesse': l.serviceOfInterest,
    'Valor Estimado': l.estimatedValue,
    'Moeda': l.currency,
    'Probabilidade Fechamento (%)': l.closingProbability,
    'Responsável': l.responsibleName,
    'Data de Cadastro': formatDate(l.createdAt),
    'Último Contato': formatDate(l.lastContactDate),
    'Próximo Follow-up': formatDate(l.nextFollowUpDate),
    'Observações': l.notes || '',
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Leads');
  XLSX.writeFile(workbook, filename);
}

export function exportClientsToExcel(clients: Client[], filename = 'FSM_Company_Clientes.xlsx') {
  const data = clients.map((c) => ({
    'Empresa': c.companyName,
    'Nome Fantasia': c.tradeName || '',
    'CNPJ / CPF / Tax ID': c.documentNumber || '',
    'Contato Principal': c.primaryContactName,
    'E-mail': c.email,
    'Telefone': c.phone,
    'WhatsApp': c.whatsapp,
    'Cidade': c.city,
    'Estado': c.state,
    'País': c.country,
    'Status Contrato': c.status,
    'Tipo de Cobrança': c.billingType,
    'Valor Contratado': c.contractedValue,
    'Valor Recorrente (MRR)': c.monthlyRecurringValue || 0,
    'Moeda': c.currency,
    'Forma de Pagamento': c.paymentMethod,
    'Responsável': c.accountManager,
    'Início Contrato': formatDate(c.contractStartDate),
    'Fim / Renovação': formatDate(c.contractEndDate),
    'Observações': c.notes || '',
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Clientes');
  XLSX.writeFile(workbook, filename);
}

export function exportProjectsToExcel(projects: Project[], filename = 'FSM_Company_Projetos.xlsx') {
  const data = projects.map((p) => {
    const allTasks = p.phases ? p.phases.flatMap((ph) => ph.tasks || []) : [];
    return {
      'Projeto': p.name,
      'Cliente': p.clientName,
      'Status': p.status,
      'Prioridade': p.priority,
      'Progresso (%)': p.progressPercentage,
      'Valor': p.contractedValue || 0,
      'Moeda': p.currency || 'BRL',
      'Responsável': p.responsibleName,
      'Data de Início': formatDate(p.startDate),
      'Previsão de Entrega': formatDate(p.dueDate),
      'Data de Conclusão': formatDate(p.completedDate),
      'Total de Tarefas': allTasks.length,
      'Tarefas Concluídas': allTasks.filter((t) => t.status === 'concluida').length,
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Projetos');
  XLSX.writeFile(workbook, filename);
}

export function exportFinancialToExcel(transactions: FinancialTransaction[], filename = 'FSM_Company_Financeiro.xlsx') {
  const data = transactions.map((t) => ({
    'Tipo': t.type === 'receita' ? 'Receita' : 'Despesa',
    'Título': t.title,
    'Categoria': t.category,
    'Valor': t.amount,
    'Moeda': t.currency,
    'Status': t.status,
    'Cliente / Fornecedor': t.clientName || t.supplierName || '-',
    'Projeto': t.projectName || '-',
    'Data Emissão': formatDate(t.issueDate),
    'Data Vencimento': formatDate(t.dueDate),
    'Data Pagamento': formatDate(t.paymentDate),
    'Forma de Pagamento': t.paymentMethod,
    'Recorrente': t.isRecurring ? 'Sim' : 'Não',
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Financeiro');
  XLSX.writeFile(workbook, filename);
}

export const exportTransactionsToExcel = exportFinancialToExcel;

export function exportAllDataToExcel(
  leadsOrData: Lead[] | { leads: Lead[]; clients: Client[]; projects: Project[]; transactions: FinancialTransaction[] },
  maybeClients?: Client[],
  maybeProjects?: Project[],
  maybeTransactions?: FinancialTransaction[],
  filename = 'FSM_Company_Backup_Completo.xlsx'
) {
  let leads: Lead[];
  let clients: Client[];
  let projects: Project[];
  let transactions: FinancialTransaction[];

  if (Array.isArray(leadsOrData)) {
    leads = leadsOrData;
    clients = maybeClients || [];
    projects = maybeProjects || [];
    transactions = maybeTransactions || [];
  } else {
    leads = leadsOrData.leads || [];
    clients = leadsOrData.clients || [];
    projects = leadsOrData.projects || [];
    transactions = leadsOrData.transactions || [];
  }

  const workbook = XLSX.utils.book_new();

  // Sheet 1: Leads
  const leadsData = leads.map((l: any) => ({
    'Empresa': l.companyName,
    'Nicho': l.category || l.segment || '',
    'Contato': l.contacts?.[0]?.name || '',
    'Telefone': l.phone || l.contacts?.[0]?.phone || '',
    'Status': l.status,
    'Valor': l.dealValue ?? l.estimatedValue ?? 0,
    'Moeda': l.currency,
  }));
  const wsLeads = XLSX.utils.json_to_sheet(leadsData);
  XLSX.utils.book_append_sheet(workbook, wsLeads, 'Leads');

  // Sheet 2: Clientes
  const clientsData = clients.map((c: any) => ({
    'Cliente': c.companyName,
    'Contato': c.primaryContactName || c.contactName || '',
    'Status': c.status,
    'Valor Contratado': c.contractedValue ?? 0,
    'MRR': c.monthlyRecurringValue || c.recurringAmount || 0,
    'Moeda': c.currency,
  }));
  const wsClients = XLSX.utils.json_to_sheet(clientsData);
  XLSX.utils.book_append_sheet(workbook, wsClients, 'Clientes');

  // Sheet 3: Projetos
  const projectsData = projects.map((p: any) => ({
    'Projeto': p.name,
    'Cliente': p.clientName,
    'Status': p.status,
    'Progresso': `${p.progressPercentage ?? p.progressPercent ?? 0}%`,
    'Valor': p.contractedValue ?? p.contractValue ?? 0,
    'Moeda': p.currency || 'BRL',
  }));
  const wsProjects = XLSX.utils.json_to_sheet(projectsData);
  XLSX.utils.book_append_sheet(workbook, wsProjects, 'Projetos');

  // Sheet 4: Financeiro
  const finData = transactions.map((t: any) => ({
    'Tipo': t.type,
    'Título': t.title,
    'Categoria': t.category,
    'Valor': t.amount,
    'Moeda': t.currency,
    'Status': t.status,
    'Vencimento': formatDate(t.dueDate),
  }));
  const wsFin = XLSX.utils.json_to_sheet(finData);
  XLSX.utils.book_append_sheet(workbook, wsFin, 'Financeiro');

  XLSX.writeFile(workbook, filename);
}

export async function parseExcelOrCsv(file: File): Promise<{ headers: string[]; rows: Record<string, any>[] }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (!json || json.length === 0) {
          resolve({ headers: [], rows: [] });
          return;
        }

        const headers = (json[0] as string[]).map((h) => String(h || '').trim());
        const rows: Record<string, any>[] = [];

        for (let i = 1; i < json.length; i++) {
          const rowArray = json[i] as any[];
          if (!rowArray || rowArray.length === 0) continue;
          const rowObj: Record<string, any> = {};
          headers.forEach((h, idx) => {
            rowObj[h] = rowArray[idx] !== undefined ? rowArray[idx] : '';
          });
          // Only add non-empty rows
          if (Object.values(rowObj).some((v) => String(v).trim() !== '')) {
            rows.push(rowObj);
          }
        }

        resolve({ headers, rows });
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsBinaryString(file);
  });
}
