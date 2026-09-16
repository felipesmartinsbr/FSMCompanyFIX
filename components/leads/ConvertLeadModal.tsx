'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Lead, Currency } from '@/types';
import { formatCurrency } from '@/lib/formatters';
import {
  Sparkles,
  CheckCircle2,
  X,
  Building2,
  FolderKanban,
  DollarSign,
  ArrowRight,
} from 'lucide-react';

interface ConvertLeadModalProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ConvertLeadModal({ lead, isOpen, onClose }: ConvertLeadModalProps) {
  const { convertLeadToClient, products, clients } = useApp();

  const [clientMode, setClientMode] = useState<'new' | 'existing'>('new');
  const [selectedExistingClientId, setSelectedExistingClientId] = useState<string>(clients[0]?.id || '');
  const [companyName, setCompanyName] = useState(lead?.companyName || '');
  const [tradeName, setTradeName] = useState(lead?.tradeName || lead?.companyName || '');
  const [primaryContactName, setPrimaryContactName] = useState(lead?.contacts[0]?.name || '');
  const [primaryContactEmail, setPrimaryContactEmail] = useState(lead?.contacts[0]?.email || lead?.email || '');
  const [primaryContactPhone, setPrimaryContactPhone] = useState(lead?.contacts[0]?.phone || lead?.phone || '');
  
  const [soldProductId, setSoldProductId] = useState<string>(products[0]?.id || '');
  const [soldAmount, setSoldAmount] = useState<number>(lead?.estimatedValue || 3500);
  const [currency, setCurrency] = useState<Currency>(lead?.currency || 'BRL');
  const [billingType, setBillingType] = useState<'fixo' | 'recorrente' | 'hibrido'>('fixo');
  const [recurringAmount, setRecurringAmount] = useState<number>(1450);
  const [paymentMethod, setPaymentMethod] = useState<'Pix' | 'Boleto' | 'Cartao de Credito' | 'Transferencia' | 'Wire / Stripe' | 'PayPal' | 'Outro'>('Pix');
  
  // Condições de pagamento
  const [paymentCondition, setPaymentCondition] = useState<'integral' | 'entrada_50' | 'personalizado'>('entrada_50');
  const [conditionPercentage, setConditionPercentage] = useState<number>(50);
  const [firstDueDate, setFirstDueDate] = useState<string>(() => new Date().toISOString().split('T')[0]);

  // Opções de Projeto
  const [projectOption, setProjectOption] = useState<'aguardando_pagamento' | 'planejamento' | 'nao_criar'>('aguardando_pagamento');
  const [projectName, setProjectName] = useState(
    lead ? `Entrega Comercial: ${lead.serviceOfInterest} - ${lead.companyName}` : ''
  );
  const [projectDueDate, setProjectDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 21);
    return d.toISOString().split('T')[0];
  });

  if (!isOpen || !lead) return null;

  // Check if lead already converted
  const alreadyConvertedClient = clients.find((c) => c.leadOriginId === lead.id || c.id === lead.convertedClientId);

  const handleProductChange = (prodId: string) => {
    setSoldProductId(prodId);
    const prod = products.find((p) => p.id === prodId);
    if (prod) {
      const price = currency === 'USD' ? (prod.priceUSD ?? prod.suggestedPriceUSD ?? 0) : (prod.priceBRL ?? prod.suggestedPriceBRL ?? 0);
      setSoldAmount(price);
      setBillingType(prod.billingType || (prod.pricingModel as any) || 'fixo');
      if (prod.billingType === 'recorrente' || prod.pricingModel === 'recorrente') {
        setRecurringAmount(price);
      }
      const targetName = clientMode === 'existing' 
        ? (clients.find(c => c.id === selectedExistingClientId)?.companyName || lead.companyName)
        : (companyName || lead.companyName);
      setProjectName(`Projeto: ${prod.name} - ${targetName}`);
    }
  };

  const handleCurrencyChange = (curr: Currency) => {
    setCurrency(curr);
    const prod = products.find((p) => p.id === soldProductId);
    if (prod) {
      const price = curr === 'USD' ? (prod.priceUSD ?? prod.suggestedPriceUSD ?? 0) : (prod.priceBRL ?? prod.suggestedPriceBRL ?? 0);
      setSoldAmount(price);
      if (billingType === 'recorrente') {
        setRecurringAmount(price);
      }
    }
  };

  const handleConvert = (e: React.FormEvent) => {
    e.preventDefault();

    convertLeadToClient({
      leadId: lead.id,
      clientData: {
        companyName: companyName || lead.companyName,
        tradeName: tradeName || lead.tradeName,
        primaryContactName: primaryContactName || lead.contacts[0]?.name,
        primaryContactEmail: primaryContactEmail || lead.email,
        primaryContactPhone: primaryContactPhone || lead.phone,
      },
      soldProductId,
      soldAmount: Number(soldAmount) || 0,
      currency,
      billingType,
      recurringAmount: billingType !== 'fixo' ? Number(recurringAmount) : 0,
      paymentMethod,
      firstDueDate,
      paymentCondition,
      conditionPercentage: Number(conditionPercentage) || 50,
      projectOption,
      createProject: projectOption !== 'nao_criar',
      projectName,
      projectDueDate,
      existingClientId: clientMode === 'existing' ? selectedExistingClientId : undefined,
    });

    onClose();
  };

  return (
    <div
      id="convert-lead-modal-backdrop"
      className="fixed inset-0 z-50 bg-neutral-950/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="convert-lead-modal"
        className="bg-white rounded-2xl shadow-2xl border border-neutral-200 w-full max-w-2xl max-h-[90vh] flex flex-col text-neutral-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-emerald-50/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900">
                Converter Lead Ganho em Cliente
              </h2>
              <p className="text-xs text-neutral-600">
                Oficialize o fechamento comercial, registre o contrato e inicie a entrega do projeto.
              </p>
            </div>
          </div>
          <button
            id="close-convert-lead-modal"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Warning if already converted */}
        {alreadyConvertedClient && (
          <div className="mx-6 mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
            <strong>Aviso:</strong> Este lead já possui o cliente <strong>{alreadyConvertedClient.companyName}</strong> associado no sistema.
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleConvert} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          {/* Section 1: Client Info */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-1">
              <span className="font-bold text-xs uppercase tracking-wider text-neutral-500">
                1. Cliente Destino
              </span>
              <div className="flex items-center gap-1 bg-neutral-100 p-0.5 rounded-lg text-[11px]">
                <button
                  type="button"
                  onClick={() => setClientMode('new')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                    clientMode === 'new' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  Criar Novo Cliente
                </button>
                <button
                  type="button"
                  onClick={() => setClientMode('existing')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                    clientMode === 'existing' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  Vincular a Existente
                </button>
              </div>
            </div>

            {clientMode === 'existing' ? (
              <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-xl space-y-2">
                <label className="font-semibold text-blue-900 block text-xs">Selecione o Cliente Existente na Base:</label>
                <select
                  id="convert-existing-client-select"
                  value={selectedExistingClientId}
                  onChange={(e) => {
                    setSelectedExistingClientId(e.target.value);
                    const selected = clients.find(c => c.id === e.target.value);
                    if (selected) {
                      const prod = products.find(p => p.id === soldProductId);
                      if (prod) setProjectName(`Projeto: ${prod.name} - ${selected.companyName}`);
                    }
                  }}
                  className="w-full px-3 py-2 border border-blue-200 rounded-lg bg-white text-neutral-900 text-xs font-medium"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.companyName} {c.tradeName ? `(${c.tradeName})` : ''} - {c.city}/{c.state}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-blue-700">
                  Ao vincular, a nova venda e contrato serão anexados ao histórico deste cliente sem gerar duplicidade.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Razão Social / Nome da Empresa</label>
                  <input
                    id="convert-company-name"
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-neutral-900 focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Nome Fantasia</label>
                  <input
                    id="convert-trade-name"
                    type="text"
                    value={tradeName}
                    onChange={(e) => setTradeName(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-neutral-900 focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Contato Principal</label>
                  <input
                    id="convert-contact-name"
                    type="text"
                    value={primaryContactName}
                    onChange={(e) => setPrimaryContactName(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-neutral-900 focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">WhatsApp / Telefone</label>
                  <input
                    id="convert-contact-phone"
                    type="text"
                    value={primaryContactPhone}
                    onChange={(e) => setPrimaryContactPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-neutral-900 focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Venda e Condições Comerciais */}
          <div className="space-y-3">
            <span className="font-bold text-xs uppercase tracking-wider text-neutral-500 block border-b border-neutral-100 pb-1">
              2. Venda & Condições Comerciais
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Solução / Produto Vendido</label>
                <select
                  id="convert-product-select"
                  value={soldProductId}
                  onChange={(e) => handleProductChange(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg bg-white text-neutral-900"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Moeda da Transação</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleCurrencyChange('BRL')}
                    className={`flex-1 py-2 rounded-lg border font-bold text-center ${
                      currency === 'BRL'
                        ? 'bg-blue-900 text-white border-blue-900'
                        : 'bg-neutral-50 text-neutral-700 border-neutral-200'
                    }`}
                  >
                    BRL R$
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCurrencyChange('USD')}
                    className={`flex-1 py-2 rounded-lg border font-bold text-center ${
                      currency === 'USD'
                        ? 'bg-emerald-900 text-white border-emerald-900'
                        : 'bg-neutral-50 text-neutral-700 border-neutral-200'
                    }`}
                  >
                    USD $
                  </button>
                </div>
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Tipo de Cobrança</label>
                <select
                  id="convert-billing-type"
                  value={billingType}
                  onChange={(e: any) => setBillingType(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg bg-white text-neutral-900"
                >
                  <option value="fixo">Pagamento Fixo (Projeto Único)</option>
                  <option value="recorrente">Recorrente Mensal (Retainer / MRR)</option>
                  <option value="hibrido">Híbrido (Setup Inicial + Mensalidade)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Valor Contratado Total ({currency})</label>
                <input
                  id="convert-sold-amount"
                  type="number"
                  value={soldAmount}
                  onChange={(e) => setSoldAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-neutral-900 font-bold"
                />
              </div>

              {billingType !== 'fixo' && (
                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Valor Mensal Recorrente ({currency})</label>
                  <input
                    id="convert-recurring-amount"
                    type="number"
                    value={recurringAmount}
                    onChange={(e) => setRecurringAmount(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-neutral-900 font-bold text-emerald-700"
                  />
                </div>
              )}

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Forma de Pagamento</label>
                <select
                  id="convert-payment-method"
                  value={paymentMethod}
                  onChange={(e: any) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg bg-white text-neutral-900"
                >
                  <option value="Pix">Pix</option>
                  <option value="Boleto">Boleto</option>
                  <option value="Cartao de Credito">Cartão de Crédito</option>
                  <option value="Transferencia">Transferência Bancária</option>
                  <option value="Wire / Stripe">Wire / Stripe (USD)</option>
                  <option value="PayPal">PayPal</option>
                </select>
              </div>
            </div>

            {/* Sub-section: Condições de Pagamento e Vencimento */}
            <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 space-y-3">
              <span className="font-bold text-neutral-800 block text-xs">
                Condição de Pagamento do Contrato Inicial:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentCondition('entrada_50')}
                  className={`p-2.5 rounded-lg border text-left transition-colors ${
                    paymentCondition === 'entrada_50'
                      ? 'bg-white border-emerald-600 ring-1 ring-emerald-600 text-emerald-950 font-bold'
                      : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-100/60'
                  }`}
                >
                  <div className="text-xs">Entrada 50% + 50%</div>
                  <div className="text-[10px] text-neutral-500 font-normal">50% entrada, 50% em 30d</div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentCondition('integral')}
                  className={`p-2.5 rounded-lg border text-left transition-colors ${
                    paymentCondition === 'integral'
                      ? 'bg-white border-emerald-600 ring-1 ring-emerald-600 text-emerald-950 font-bold'
                      : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-100/60'
                  }`}
                >
                  <div className="text-xs">Integral (100%)</div>
                  <div className="text-[10px] text-neutral-500 font-normal">Pagamento total à vista</div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentCondition('personalizado')}
                  className={`p-2.5 rounded-lg border text-left transition-colors ${
                    paymentCondition === 'personalizado'
                      ? 'bg-white border-emerald-600 ring-1 ring-emerald-600 text-emerald-950 font-bold'
                      : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-100/60'
                  }`}
                >
                  <div className="text-xs">Personalizado (%)</div>
                  <div className="text-[10px] text-neutral-500 font-normal">Definir % da entrada</div>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Data de Vencimento da 1ª Parcela / Entrada</label>
                  <input
                    id="convert-first-due-date"
                    type="date"
                    required
                    value={firstDueDate}
                    onChange={(e) => setFirstDueDate(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-200 bg-white rounded-lg text-neutral-900"
                  />
                </div>

                {paymentCondition === 'personalizado' && (
                  <div>
                    <label className="font-semibold text-neutral-700 block mb-1">Percentual de Entrada (%)</label>
                    <input
                      id="convert-condition-percentage"
                      type="number"
                      min="1"
                      max="99"
                      value={conditionPercentage}
                      onChange={(e) => setConditionPercentage(Number(e.target.value) || 50)}
                      className="w-full px-3 py-2 border border-neutral-200 bg-white rounded-lg text-neutral-900 font-bold"
                    />
                  </div>
                )}
              </div>

              {/* Real-time installment breakdown preview */}
              <div className="p-2.5 bg-emerald-50/70 border border-emerald-200 rounded-lg text-[11px] text-emerald-900 space-y-1">
                <div className="font-bold flex items-center justify-between">
                  <span>Previsão de Lançamento em Contas a Receber:</span>
                  <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded font-semibold text-[10px]">Status: Pendente</span>
                </div>
                {paymentCondition === 'entrada_50' && (
                  <>
                    <div className="flex justify-between text-neutral-700">
                      <span>• Parcela 1 (Entrada 50%): <strong>{formatCurrency(soldAmount * 0.5, currency)}</strong></span>
                      <span>Venc: {firstDueDate}</span>
                    </div>
                    <div className="flex justify-between text-neutral-700">
                      <span>• Parcela 2 (Saldo 50%): <strong>{formatCurrency(soldAmount * 0.5, currency)}</strong></span>
                      <span>Venc: em 30 dias</span>
                    </div>
                  </>
                )}
                {paymentCondition === 'integral' && (
                  <div className="flex justify-between text-neutral-700">
                    <span>• Parcela Única (100%): <strong>{formatCurrency(soldAmount, currency)}</strong></span>
                    <span>Venc: {firstDueDate}</span>
                  </div>
                )}
                {paymentCondition === 'personalizado' && (
                  <>
                    <div className="flex justify-between text-neutral-700">
                      <span>• Entrada ({conditionPercentage}%): <strong>{formatCurrency(soldAmount * (conditionPercentage / 100), currency)}</strong></span>
                      <span>Venc: {firstDueDate}</span>
                    </div>
                    {conditionPercentage < 100 && (
                      <div className="flex justify-between text-neutral-700">
                        <span>• Saldo ({100 - conditionPercentage}%): <strong>{formatCurrency(soldAmount * ((100 - conditionPercentage) / 100), currency)}</strong></span>
                        <span>Venc: em 30 dias</span>
                      </div>
                    )}
                  </>
                )}
                <p className="text-[10px] text-neutral-500 pt-0.5">
                  🛡️ Nenhum pagamento é considerado recebido antecipadamente. O recebimento deve ser confirmado no Contas a Receber.
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Project Creation Options */}
          <div className="space-y-3 p-4 bg-neutral-50 rounded-xl border border-neutral-200">
            <span className="font-bold text-xs uppercase tracking-wider text-neutral-600 block">
              3. Inicialização do Projeto Operacional
            </span>

            <div className="space-y-2">
              <label className="flex items-start gap-2.5 p-2.5 rounded-lg border bg-white cursor-pointer hover:bg-neutral-50 transition-colors">
                <input
                  type="radio"
                  name="projectOption"
                  value="aguardando_pagamento"
                  checked={projectOption === 'aguardando_pagamento'}
                  onChange={() => setProjectOption('aguardando_pagamento')}
                  className="mt-0.5 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                <div className="text-xs">
                  <div className="font-bold text-neutral-900">Aguardando Pagamento Comercial (Recomendado)</div>
                  <div className="text-neutral-500 text-[11px]">
                    O projeto é criado e fica bloqueado até que o financeiro confirme o recebimento da entrada no módulo de Contas a Receber.
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-2.5 rounded-lg border bg-white cursor-pointer hover:bg-neutral-50 transition-colors">
                <input
                  type="radio"
                  name="projectOption"
                  value="planejamento"
                  checked={projectOption === 'planejamento'}
                  onChange={() => setProjectOption('planejamento')}
                  className="mt-0.5 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                <div className="text-xs">
                  <div className="font-bold text-neutral-900">Liberar Imediatamente em Fase de Planejamento</div>
                  <div className="text-neutral-500 text-[11px]">
                    Cria o projeto imediatamente liberado para a equipe operacional começar o kickoff sem travas de cobrança.
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-2.5 rounded-lg border bg-white cursor-pointer hover:bg-neutral-50 transition-colors">
                <input
                  type="radio"
                  name="projectOption"
                  value="nao_criar"
                  checked={projectOption === 'nao_criar'}
                  onChange={() => setProjectOption('nao_criar')}
                  className="mt-0.5 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                <div className="text-xs">
                  <div className="font-bold text-neutral-900">Não Criar Projeto Agora</div>
                  <div className="text-neutral-500 text-[11px]">
                    Apenas formaliza o cliente e lança o financeiro. O projeto pode ser criado manualmente depois.
                  </div>
                </div>
              </label>
            </div>

            {projectOption !== 'nao_criar' && (
              <div className="pt-2 space-y-3 border-t border-neutral-200 mt-2">
                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Nome do Projeto</label>
                  <input
                    id="convert-project-name"
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-200 bg-white rounded-lg text-neutral-900"
                  />
                </div>
                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Prazo Estimado de Entrega</label>
                  <input
                    id="convert-project-due-date"
                    type="date"
                    value={projectDueDate}
                    onChange={(e) => setProjectDueDate(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-200 bg-white rounded-lg text-neutral-900"
                  />
                </div>
                <p className="text-[11px] text-neutral-500">
                  ℹ️ As fases, checklists e tarefas padrão da solução selecionada serão geradas automaticamente na estrutura do projeto.
                </p>
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-100">
            <button
              id="cancel-convert-btn"
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-neutral-200 rounded-lg text-neutral-700 hover:bg-neutral-50 font-medium"
            >
              Cancelar
            </button>
            <button
              id="confirm-convert-btn"
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-sm transition-colors flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Efetivar Conversão em Cliente
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
