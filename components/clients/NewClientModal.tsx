'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { ClientStatus, Currency } from '@/types';
import { X, Building2, User, DollarSign, Plus } from 'lucide-react';

interface NewClientModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewClientModal({ isOpen, onClose }: NewClientModalProps) {
  const { addClient, products } = useApp();

  const [companyName, setCompanyName] = useState('');
  const [tradeName, setTradeName] = useState('');
  const [taxId, setTaxId] = useState('');
  const [category, setCategory] = useState('Odontologia / Saúde');
  const [website, setWebsite] = useState('');
  const [city, setCity] = useState('São Paulo');
  const [state, setState] = useState('SP');
  const [country, setCountry] = useState('Brasil');

  // Contact
  const [primaryContactName, setPrimaryContactName] = useState('');
  const [primaryContactRole, setPrimaryContactRole] = useState('Proprietário / Diretor');
  const [primaryContactEmail, setPrimaryContactEmail] = useState('');
  const [primaryContactPhone, setPrimaryContactPhone] = useState('');

  // Commercial
  const [status, setStatus] = useState<ClientStatus>('onboarding');
  const [currency, setCurrency] = useState<Currency>('BRL');
  const [contractedValue, setContractedValue] = useState<number>(4500);
  const [billingType, setBillingType] = useState<'fixo' | 'recorrente' | 'hibrido'>('fixo');
  const [recurringAmount, setRecurringAmount] = useState<number>(0);
  const [selectedServices, setSelectedServices] = useState<string[]>([
    'Criação de Website de Alta Conversão',
  ]);

  // Links
  const [driveUrl, setDriveUrl] = useState('');
  const [contractUrl, setContractUrl] = useState('');

  if (!isOpen) return null;

  const handleToggleService = (serviceName: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceName) ? prev.filter((s) => s !== serviceName) : [...prev, serviceName]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) return;

    addClient({
      companyName,
      tradeName: tradeName || companyName,
      taxId,
      category,
      website,
      city,
      state,
      country,
      primaryContactName: primaryContactName || 'Contato Principal',
      primaryContactRole,
      primaryContactEmail,
      primaryContactPhone,
      email: primaryContactEmail || '',
      phone: primaryContactPhone || '',
      whatsapp: primaryContactPhone || '',
      healthScore: 'excelente',
      responsibleName: 'Felipe Martins',
      status,
      currency,
      contractedValue: Number(contractedValue) || 0,
      billingType,
      recurringAmount: billingType !== 'fixo' ? Number(recurringAmount) : undefined,
      servicesSubscribed: selectedServices.length > 0 ? selectedServices : ['Consultoria & Desenvolvimento'],
      startDate: new Date().toISOString().split('T')[0],
      sharedLinks: [
        ...(driveUrl ? [{ id: 'link_1', title: 'Google Drive do Cliente', url: driveUrl, type: 'drive' as const }] : []),
        ...(contractUrl ? [{ id: 'link_2', title: 'Contrato Assinado', url: contractUrl, type: 'contract' as const }] : []),
      ],
    });

    onClose();
  };

  return (
    <div
      id="new-client-modal-backdrop"
      className="fixed inset-0 z-50 bg-neutral-950/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in"
      onClick={onClose}
    >
      <div
        id="new-client-modal"
        className="bg-white rounded-2xl shadow-2xl border border-neutral-200 w-full max-w-2xl max-h-[90vh] flex flex-col text-neutral-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <div>
            <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-700" />
              Cadastrar Novo Cliente
            </h2>
            <p className="text-xs text-neutral-500">Registre os dados cadastrais, contratos e contatos da empresa.</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          {/* Section 1: Dados Empresa */}
          <div className="space-y-3">
            <span className="font-bold text-neutral-500 uppercase tracking-wider text-xs block border-b border-neutral-100 pb-1">
              1. Dados Cadastrais da Empresa
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Razão Social *</label>
                <input
                  required
                  type="text"
                  placeholder="Ex: Prime Dental Center Ltda"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-neutral-900"
                />
              </div>
              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Nome Fantasia</label>
                <input
                  type="text"
                  placeholder="Ex: Prime Dental"
                  value={tradeName}
                  onChange={(e) => setTradeName(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-neutral-900"
                />
              </div>
              <div>
                <label className="font-semibold text-neutral-700 block mb-1">CNPJ / CPF / Tax ID</label>
                <input
                  type="text"
                  placeholder="Ex: 34.123.456/0001-89"
                  value={taxId}
                  onChange={(e) => setTaxId(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-neutral-900"
                />
              </div>
              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Nicho / Categoria</label>
                <input
                  type="text"
                  placeholder="Ex: Clínica Médica"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-neutral-900"
                />
              </div>
              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Website Oficial</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-neutral-900"
                />
              </div>
              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Cidade / Estado / País</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Cidade"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="flex-1 px-2.5 py-2 border border-neutral-200 rounded-lg text-neutral-900"
                  />
                  <input
                    type="text"
                    placeholder="País"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-24 px-2 py-2 border border-neutral-200 rounded-lg text-neutral-900"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Contato Decisor */}
          <div className="space-y-3">
            <span className="font-bold text-neutral-500 uppercase tracking-wider text-xs block border-b border-neutral-100 pb-1">
              2. Contato do Decisor Principal
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Nome Completo *</label>
                <input
                  required
                  type="text"
                  placeholder="Ex: Dra. Ana Paula"
                  value={primaryContactName}
                  onChange={(e) => setPrimaryContactName(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-neutral-900"
                />
              </div>
              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Cargo</label>
                <input
                  type="text"
                  value={primaryContactRole}
                  onChange={(e) => setPrimaryContactRole(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-neutral-900"
                />
              </div>
              <div>
                <label className="font-semibold text-neutral-700 block mb-1">E-mail</label>
                <input
                  type="email"
                  placeholder="contato@cliente.com"
                  value={primaryContactEmail}
                  onChange={(e) => setPrimaryContactEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-neutral-900"
                />
              </div>
              <div>
                <label className="font-semibold text-neutral-700 block mb-1">WhatsApp / Telefone</label>
                <input
                  type="text"
                  placeholder="+55 11 98888-0000"
                  value={primaryContactPhone}
                  onChange={(e) => setPrimaryContactPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-neutral-900"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Condições Comerciais */}
          <div className="space-y-3">
            <span className="font-bold text-neutral-500 uppercase tracking-wider text-xs block border-b border-neutral-100 pb-1">
              3. Contrato & Condições Financeiras
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Status do Cliente</label>
                <select
                  value={status}
                  onChange={(e: any) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg bg-white text-neutral-900"
                >
                  <option value="onboarding">Onboarding</option>
                  <option value="ativo">Ativo (Em Execução)</option>
                  <option value="pausado">Pausado</option>
                  <option value="churn">Encerrado / Churn</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Moeda Contratada</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrency('BRL')}
                    className={`flex-1 py-1.5 rounded-lg border font-bold text-center ${
                      currency === 'BRL'
                        ? 'bg-blue-900 text-white border-blue-900'
                        : 'bg-neutral-50 text-neutral-700 border-neutral-200'
                    }`}
                  >
                    BRL R$
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrency('USD')}
                    className={`flex-1 py-1.5 rounded-lg border font-bold text-center ${
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
                <label className="font-semibold text-neutral-700 block mb-1">Tipo de Faturamento</label>
                <select
                  value={billingType}
                  onChange={(e: any) => setBillingType(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg bg-white text-neutral-900"
                >
                  <option value="fixo">Fixo (Projeto)</option>
                  <option value="recorrente">Recorrente (MRR)</option>
                  <option value="hibrido">Híbrido</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Valor Contratado Total ({currency})</label>
                <input
                  type="number"
                  value={contractedValue}
                  onChange={(e) => setContractedValue(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-neutral-900 font-bold"
                />
              </div>

              {billingType !== 'fixo' && (
                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Recorrência Mensal ({currency})</label>
                  <input
                    type="number"
                    value={recurringAmount}
                    onChange={(e) => setRecurringAmount(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-neutral-900 font-bold text-emerald-700"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="font-semibold text-neutral-700 block mb-1.5">Soluções Contratadas</label>
              <div className="flex flex-wrap gap-2">
                {products.map((p) => {
                  const isChecked = selectedServices.includes(p.name);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleToggleService(p.name)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                        isChecked
                          ? 'bg-blue-900 text-white border-blue-900'
                          : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                      }`}
                    >
                      {isChecked ? '✓ ' : '+ '}
                      {p.name}
                    </button>
                  );
                })}
              </div>
            </div>
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
              className="px-5 py-2 bg-indigo-950 hover:bg-indigo-900 text-white font-bold rounded-lg shadow-sm"
            >
              Cadastrar Cliente
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
