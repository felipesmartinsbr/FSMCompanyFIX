'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { formatCurrency } from '@/lib/formatters';
import { exportAllDataToExcel } from '@/lib/excelExport';
import {
  Building2,
  DollarSign,
  Download,
  Upload,
  RefreshCw,
  Save,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Database,
  ShieldCheck,
  Server,
  Code2,
  ExternalLink,
  Copy,
  Check,
  Radio,
} from 'lucide-react';

export function SettingsView() {
  const {
    settings,
    updateSettings,
    exportBackupJSON,
    importBackupJSON,
    leads,
    clients,
    projects,
    transactions,
    isSupabaseConfigured,
    isSupabaseConnected,
    supabaseStatusMessage,
    testSupabase,
    syncAllToSupabase,
    reloadFromSupabase,
  } = useApp();

  const [companyName, setCompanyName] = useState(settings.companyName);
  const [legalName, setLegalName] = useState(settings.legalName || '');
  const [taxId, setTaxId] = useState(settings.taxId || '');
  const [email, setEmail] = useState(settings.email || '');
  const [phone, setPhone] = useState(settings.phone || '');
  const [ownerName, setOwnerName] = useState(settings.ownerName);
  const [usdToBrlRate, setUsdToBrlRate] = useState(settings.usdToBrlRate);
  const [isSaved, setIsSaved] = useState(false);

  const [isTestingSupabase, setIsTestingSupabase] = useState(false);
  const [isSyncingSupabase, setIsSyncingSupabase] = useState(false);
  const [isReloadingSupabase, setIsReloadingSupabase] = useState(false);
  const [showSqlModal, setShowSqlModal] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  const handleSaveCompany = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      companyName,
      legalName,
      taxId,
      email,
      phone,
      ownerName,
      usdToBrlRate: Number(usdToBrlRate) || 5.65,
      exchangeRateBRLtoUSD: Number(usdToBrlRate) || 5.65,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleTestSupabase = async () => {
    setIsTestingSupabase(true);
    try {
      await testSupabase();
    } finally {
      setIsTestingSupabase(false);
    }
  };

  const handleSyncToSupabase = async () => {
    setIsSyncingSupabase(true);
    try {
      await syncAllToSupabase();
    } finally {
      setIsSyncingSupabase(false);
    }
  };

  const handleReloadFromSupabase = async () => {
    setIsReloadingSupabase(true);
    try {
      await reloadFromSupabase();
    } finally {
      setIsReloadingSupabase(false);
    }
  };

  const handleJsonUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      if (content) {
        const success = importBackupJSON(content);
        if (success) {
          alert('Backup restaurado com sucesso!');
        } else {
          alert('Falha ao restaurar: Arquivo JSON de backup inválido.');
        }
      }
    };
    reader.readAsText(file);
  };

  const handleExportAllExcel = () => {
    exportAllDataToExcel({
      leads,
      clients,
      projects,
      transactions,
    });
  };

  const copySqlToClipboard = () => {
    const sqlScript = `-- Para executar o script completo do Supabase, consulte o arquivo /supabase/schema.sql
-- Ou cole o arquivo /supabase/schema.sql completo no SQL Editor do seu projeto Supabase.
-- Acesse: https://supabase.com/dashboard/project/_/sql`;
    navigator.clipboard.writeText(sqlScript);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const supabaseUrl = typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_SUPABASE_URL || '' : '';
  const hasAnonKey = typeof process !== 'undefined' ? !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY : false;

  return (
    <div id="settings-view" className="p-4 md:p-8 max-w-5xl mx-auto space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-neutral-900 tracking-tight">
          Configurações, Parâmetros & Banco de Dados
        </h2>
        <p className="text-xs text-neutral-500 mt-0.5">
          Conexão direta com Supabase PostgreSQL, parâmetros de câmbio oficial e identidade institucional.
        </p>
      </div>

      {/* Supabase Integration & Status Panel */}
      <div className="bg-white rounded-2xl p-6 border border-neutral-200/80 shadow-2xs space-y-5 text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-800">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-neutral-900">
                  Banco de Dados Supabase (PostgreSQL)
                </h3>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                    isSupabaseConnected
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : isSupabaseConfigured
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-neutral-100 text-neutral-600 border border-neutral-200'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isSupabaseConnected
                        ? 'bg-emerald-700 animate-pulse'
                        : isSupabaseConfigured
                        ? 'bg-amber-600'
                        : 'bg-neutral-400'
                    }`}
                  />
                  {isSupabaseConnected
                    ? 'Conectado & Sincronizado'
                    : isSupabaseConfigured
                    ? 'Configurado (Verificar Conexão)'
                    : 'Aguardando Credenciais'}
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 mt-0.5">
                Persistência relacional em nuvem com RLS ativo, sincronização automática em tempo real e isolamento por tabelas.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleTestSupabase}
              disabled={isTestingSupabase}
              className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 text-white font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Radio className={`w-3.5 h-3.5 ${isTestingSupabase ? 'animate-spin' : ''}`} />
              <span>{isTestingSupabase ? 'Testando...' : 'Testar Conexão'}</span>
            </button>
            <button
              onClick={() => setShowSqlModal(true)}
              className="px-3 py-1.5 border border-neutral-200 hover:bg-neutral-50 text-neutral-700 font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Code2 className="w-3.5 h-3.5 text-blue-700" />
              <span>Ver Auditoria SQL</span>
            </button>
          </div>
        </div>

        {/* Status diagnosis message */}
        {supabaseStatusMessage && (
          <div
            className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs ${
              isSupabaseConnected
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                : 'bg-amber-50/70 border-amber-200 text-amber-900'
            }`}
          >
            {isSupabaseConnected ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
            )}
            <div className="flex-1">
              <span className="font-semibold block">Diagnóstico de Conexão:</span>
              <span className="text-[11px] opacity-90">{supabaseStatusMessage}</span>
            </div>
          </div>
        )}

        {/* Configuration details grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3.5 rounded-xl bg-neutral-50/70 border border-neutral-200/80 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
              NEXT_PUBLIC_SUPABASE_URL
            </span>
            <div className="font-mono text-xs text-neutral-900 truncate">
              {supabaseUrl ? supabaseUrl : <span className="text-neutral-400 italic">Não configurada no ambiente</span>}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-neutral-50/70 border border-neutral-200/80 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
              NEXT_PUBLIC_SUPABASE_ANON_KEY
            </span>
            <div className="font-mono text-xs text-neutral-900">
              {hasAnonKey ? (
                <span className="text-emerald-700 font-medium">•••••••••••••••••••••••••••••••• (Presente e Ativa)</span>
              ) : (
                <span className="text-neutral-400 italic">Não configurada no ambiente</span>
              )}
            </div>
          </div>
        </div>

        {/* Sync Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-neutral-100">
          <div className="text-[11px] text-neutral-500">
            Cada ação comercial (Lead, Cliente, Projeto, Lançamento Financeiro) sincroniza automaticamente com o Supabase.
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSyncToSupabase}
              disabled={isSyncingSupabase}
              className="px-3 py-1.5 border border-emerald-300 text-emerald-800 hover:bg-emerald-50 rounded-lg font-semibold transition-colors flex items-center gap-1.5 text-xs disabled:opacity-50"
            >
              <Server className="w-3.5 h-3.5" />
              <span>{isSyncingSupabase ? 'Sincronizando...' : 'Enviar Dados Locais ao Supabase'}</span>
            </button>

            <button
              onClick={handleReloadFromSupabase}
              disabled={isReloadingSupabase}
              className="px-3 py-1.5 border border-blue-300 text-blue-800 hover:bg-blue-50 rounded-lg font-semibold transition-colors flex items-center gap-1.5 text-xs disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isReloadingSupabase ? 'animate-spin' : ''}`} />
              <span>{isReloadingSupabase ? 'Recarregando...' : 'Recarregar Dados do Supabase'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSaveCompany} className="bg-white rounded-2xl p-6 border border-neutral-200/80 shadow-2xs space-y-6 text-xs">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-900" />
            <h3 className="font-bold text-sm text-neutral-900">
              Identidade Institucional da Empresa
            </h3>
          </div>
          {isSaved && (
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Alterações salvas!
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="font-semibold text-neutral-700 block mb-1">Nome Fantasia da Agência</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-neutral-900 font-medium"
            />
          </div>

          <div>
            <label className="font-semibold text-neutral-700 block mb-1">Razão Social</label>
            <input
              type="text"
              value={legalName}
              onChange={(e) => setLegalName(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-neutral-900"
            />
          </div>

          <div>
            <label className="font-semibold text-neutral-700 block mb-1">CNPJ / Identificação Fiscal</label>
            <input
              type="text"
              value={taxId}
              onChange={(e) => setTaxId(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-neutral-900"
            />
          </div>

          <div>
            <label className="font-semibold text-neutral-700 block mb-1">E-mail Corporativo</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-neutral-900"
            />
          </div>

          <div>
            <label className="font-semibold text-neutral-700 block mb-1">Telefone / WhatsApp Oficial</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-neutral-900"
            />
          </div>

          <div>
            <label className="font-semibold text-neutral-700 block mb-1">Líder / Responsável Principal</label>
            <input
              type="text"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-neutral-900 font-medium"
            />
          </div>
        </div>

        {/* Currency Exchange Rate Setting */}
        <div className="pt-4 border-t border-neutral-100 space-y-3">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-700" />
            <h4 className="font-bold text-neutral-900">Taxa de Câmbio de Referência (USD / BRL)</h4>
          </div>
          <p className="text-neutral-500">
            Utilizada no Dashboard para conversão visual consolidada e cálculos de rentabilidade internacional.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <div className="w-40">
              <label className="text-[11px] text-neutral-500 block mb-1">1 USD em Reais (R$)</label>
              <input
                type="number"
                step="0.01"
                value={usdToBrlRate}
                onChange={(e) => setUsdToBrlRate(parseFloat(e.target.value) || 5.65)}
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg font-bold text-emerald-800 text-sm"
              />
            </div>

            <div className="bg-neutral-50 p-2.5 rounded-xl border border-neutral-200/80 text-neutral-700 flex items-center gap-3 self-end mb-0.5">
              <span>Simulação: $1,000.00 USD =</span>
              <strong className="text-emerald-800 text-sm">
                {formatCurrency(1000 * usdToBrlRate, 'BRL')}
              </strong>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-3">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-950 hover:bg-blue-900 text-white font-bold rounded-lg shadow-xs flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Salvar Configurações</span>
          </button>
        </div>
      </form>

      {/* Backup, Reports & Export Management */}
      <div className="bg-white rounded-2xl p-6 border border-neutral-200/80 shadow-2xs space-y-4 text-xs">
        <div className="flex items-center gap-2 border-b border-neutral-100 pb-3">
          <RefreshCw className="w-4 h-4 text-neutral-700" />
          <h3 className="font-bold text-sm text-neutral-900">
            Relatórios, Exportação em Planilhas & Segurança
          </h3>
        </div>

        <p className="text-neutral-600">
          Você pode exportar cadernos completos de planilhas do Excel (.xlsx) contendo todos os registros comerciais e financeiros, além de realizar downloads ou restaurações de segurança em formato JSON.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          {/* Export Everything to Excel */}
          <button
            onClick={handleExportAllExcel}
            className="p-4 rounded-xl border border-emerald-200 hover:border-emerald-400 bg-emerald-50/40 hover:bg-emerald-50/70 text-left transition-colors space-y-1.5"
          >
            <FileSpreadsheet className="w-5 h-5 text-emerald-700" />
            <span className="font-bold text-neutral-900 block">Exportar Caderno Excel</span>
            <span className="text-[11px] text-neutral-500 block">
              Gera planilha multi-abas com Leads, Clientes, Projetos e Transações Financeiras.
            </span>
          </button>

          {/* Download JSON */}
          <button
            onClick={exportBackupJSON}
            className="p-4 rounded-xl border border-neutral-200 hover:border-blue-400 bg-neutral-50/50 hover:bg-blue-50/30 text-left transition-colors space-y-1.5"
          >
            <Download className="w-5 h-5 text-blue-700" />
            <span className="font-bold text-neutral-900 block">Exportar Backup JSON</span>
            <span className="text-[11px] text-neutral-500 block">
              Salva um arquivo .json seguro com todos os registros locais do sistema.
            </span>
          </button>

          {/* Import JSON */}
          <label className="p-4 rounded-xl border border-neutral-200 hover:border-blue-400 bg-neutral-50/50 hover:bg-blue-50/30 text-left transition-colors space-y-1.5 cursor-pointer block">
            <Upload className="w-5 h-5 text-blue-700" />
            <span className="font-bold text-neutral-900 block">Restaurar Arquivo JSON</span>
            <span className="text-[11px] text-neutral-500 block">
              Selecione um arquivo de backup para restaurar a base de dados instantaneamente.
            </span>
            <input
              type="file"
              accept=".json"
              onChange={handleJsonUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* SQL Migration & Audit Modal */}
      {showSqlModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-4 max-h-[85vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-emerald-700" />
                <h3 className="font-bold text-base text-neutral-900">
                  Auditoria de Tabelas do Supabase (9 Tabelas)
                </h3>
              </div>
              <button
                onClick={() => setShowSqlModal(false)}
                className="text-neutral-400 hover:text-neutral-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto space-y-4 text-xs pr-1">
              <p className="text-neutral-600">
                O arquivo <code className="bg-neutral-100 px-1.5 py-0.5 rounded font-mono font-bold">/supabase/schema.sql</code> contém a estrutura de banco de dados completa e otimizada para o sistema.
              </p>

              <div className="space-y-2">
                <span className="font-bold text-neutral-900 block">Estrutura das Tabelas Criadas:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 bg-neutral-50 rounded-lg border border-neutral-200">
                    <strong className="text-neutral-900">1. company_settings</strong>
                    <p className="text-neutral-500">Parâmetros, câmbio USD/BRL e dados fiscais</p>
                  </div>
                  <div className="p-2 bg-neutral-50 rounded-lg border border-neutral-200">
                    <strong className="text-neutral-900">2. lead_stages</strong>
                    <p className="text-neutral-500">Etapas customizáveis do pipeline Kanban</p>
                  </div>
                  <div className="p-2 bg-neutral-50 rounded-lg border border-neutral-200">
                    <strong className="text-neutral-900">3. solution_products</strong>
                    <p className="text-neutral-500">Catálogo de serviços, preços e templates</p>
                  </div>
                  <div className="p-2 bg-neutral-50 rounded-lg border border-neutral-200">
                    <strong className="text-neutral-900">4. team_members</strong>
                    <p className="text-neutral-500">Equipe técnica e comercial</p>
                  </div>
                  <div className="p-2 bg-neutral-50 rounded-lg border border-neutral-200">
                    <strong className="text-neutral-900">5. leads</strong>
                    <p className="text-neutral-500">Funil de prospecção, contatos e atividades</p>
                  </div>
                  <div className="p-2 bg-neutral-50 rounded-lg border border-neutral-200">
                    <strong className="text-neutral-900">6. clients</strong>
                    <p className="text-neutral-500">Carteira de clientes ativos e saúde (Health Score)</p>
                  </div>
                  <div className="p-2 bg-neutral-50 rounded-lg border border-neutral-200">
                    <strong className="text-neutral-900">7. projects</strong>
                    <p className="text-neutral-500">Projetos, fases, tarefas, checklists e comentários</p>
                  </div>
                  <div className="p-2 bg-neutral-50 rounded-lg border border-neutral-200">
                    <strong className="text-neutral-900">8. financial_transactions</strong>
                    <p className="text-neutral-500">Receitas, despesas, parcelas e conciliação</p>
                  </div>
                  <div className="p-2 bg-neutral-50 rounded-lg border border-neutral-200 sm:col-span-2">
                    <strong className="text-neutral-900">9. recurring_contracts</strong>
                    <p className="text-neutral-500">Contratos recorrentes (MRR), mensalidades e vencimentos</p>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-neutral-900 text-neutral-100 rounded-xl space-y-2">
                <span className="font-bold text-xs flex items-center gap-1.5 text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                  Segurança RLS e Desempenho
                </span>
                <p className="text-[11px] text-neutral-300 leading-relaxed">
                  Todas as tabelas contam com Row Level Security (RLS) habilitado com políticas para usuários autenticados e chave anônima, além de índices B-Tree em chaves estrangeiras (<code className="text-amber-300">client_id</code>, <code className="text-amber-300">stage_id</code>, <code className="text-amber-300">status</code>, <code className="text-amber-300">due_date</code>) e triggers automáticos para atualização de <code className="text-amber-300">updated_at</code>.
                </p>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-2 text-blue-900">
                <span className="font-bold text-xs">Como aplicar no seu projeto Supabase:</span>
                <ol className="list-decimal list-inside space-y-1 text-[11px]">
                  <li>Acesse o dashboard do seu projeto no Supabase (<a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="underline font-semibold inline-flex items-center gap-0.5">supabase.com <ExternalLink className="w-3 h-3 inline" /></a>).</li>
                  <li>No menu esquerdo, abra o <strong>SQL Editor</strong> e clique em <strong>New query</strong>.</li>
                  <li>Cole o conteúdo do arquivo <code className="font-mono font-bold">/supabase/schema.sql</code> e clique em <strong>Run</strong>.</li>
                  <li>Adicione as variáveis <code className="font-mono">NEXT_PUBLIC_SUPABASE_URL</code> e <code className="font-mono">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> nas configurações de ambiente.</li>
                </ol>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-neutral-100 pt-3">
              <button
                onClick={copySqlToClipboard}
                className="px-4 py-2 border border-neutral-200 hover:bg-neutral-50 text-neutral-800 font-semibold rounded-lg flex items-center gap-1.5"
              >
                {copiedSql ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copiedSql ? 'Copiado!' : 'Copiar Instruções SQL'}</span>
              </button>
              <button
                onClick={() => setShowSqlModal(false)}
                className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white font-bold rounded-lg"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
