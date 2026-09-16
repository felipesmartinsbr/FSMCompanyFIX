'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Currency, LeadTemperature, LeadSource, LeadStageId } from '@/types';
import { X, Building2, User, DollarSign, MapPin, Globe, Sparkles } from 'lucide-react';

interface NewLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewLeadModal({ isOpen, onClose }: NewLeadModalProps) {
  const { addLead, stages, products, settings } = useApp();

  const [companyName, setCompanyName] = useState('');
  const [tradeName, setTradeName] = useState('');
  const [category, setCategory] = useState('');
  const [website, setWebsite] = useState('');
  const [googleMapsUrl, setGoogleMapsUrl] = useState('');
  const [gbpStatus, setGbpStatus] = useState<'Nao reivindicado' | 'Incompleto' | 'Otimizado' | 'Sem presenca' | 'Excelente'>('Incompleto');
  const [googleRating, setGoogleRating] = useState<number>(4.5);
  const [reviewCount, setReviewCount] = useState<number>(15);
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('São Paulo');
  const [state, setState] = useState('SP');
  const [country, setCountry] = useState('Brasil');
  const [postalCode, setPostalCode] = useState('');

  // Commercial
  const [responsibleName, setResponsibleName] = useState(settings.ownerName);
  const [source, setSource] = useState<LeadSource>('Google Maps');
  const [stageId, setStageId] = useState<string>('novo_lead');
  const [temperature, setTemperature] = useState<LeadTemperature>('morno');
  const [serviceOfInterest, setServiceOfInterest] = useState('Criação de Website de Alta Conversão');
  const [estimatedValue, setEstimatedValue] = useState<number>(3500);
  const [currency, setCurrency] = useState<Currency>('BRL');
  const [closingProbability, setClosingProbability] = useState<number>(50);
  const [nextFollowUpDate, setNextFollowUpDate] = useState('');
  const [notes, setNotes] = useState('');

  // Primary Contact
  const [contactName, setContactName] = useState('');
  const [contactRole, setContactRole] = useState('Proprietário / Decisor');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) return;

    addLead({
      companyName,
      tradeName: tradeName || companyName,
      category: category || 'Geral',
      website,
      googleMapsUrl,
      gbpStatus,
      googleRating,
      reviewCount,
      phone: phone || whatsapp,
      whatsapp: whatsapp || phone,
      email,
      address,
      city,
      state,
      country,
      postalCode,
      responsibleName,
      source,
      stageId,
      status: stageId === 'ganho' ? 'ganho' : stageId === 'perdido' ? 'perdido' : 'aberto',
      temperature,
      serviceOfInterest,
      estimatedValue: Number(estimatedValue) || 0,
      currency,
      closingProbability: Number(closingProbability) || 0,
      nextFollowUpDate: nextFollowUpDate || undefined,
      notes,
      contacts: contactName
        ? [
            {
              id: `cont_${Date.now()}`,
              name: contactName,
              role: contactRole,
              email: contactEmail || email,
              phone: contactPhone || phone,
              whatsapp: whatsapp || phone,
              preferredChannel: 'whatsapp',
            },
          ]
        : [],
    });

    onClose();
  };

  return (
    <div
      id="new-lead-modal-backdrop"
      className="fixed inset-0 z-50 bg-neutral-950/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="new-lead-modal"
        className="bg-white rounded-2xl shadow-2xl border border-neutral-200 w-full max-w-2xl max-h-[90vh] flex flex-col text-neutral-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <div>
            <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-700" />
              Novo Lead de Prospecção
            </h2>
            <p className="text-xs text-neutral-500">Cadastre a empresa, contato decisor e oportunidade comercial.</p>
          </div>
          <button
            id="close-new-lead-modal"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          {/* SECTION 1: EMPRESA */}
          <div className="space-y-3">
            <h3 className="font-bold text-neutral-900 text-xs uppercase tracking-wider text-blue-950 border-b border-neutral-100 pb-1">
              1. Dados da Empresa Prospectada
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Razão Social / Nome Oficial *</label>
                <input
                  id="lead-company-name-input"
                  required
                  type="text"
                  placeholder="Ex: Clínica Odontológica Sorriso Perfeito"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-neutral-900 focus:outline-hidden focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Nome Fantasia (Comercial)</label>
                <input
                  id="lead-trade-name-input"
                  type="text"
                  placeholder="Ex: Odonto Sorriso"
                  value={tradeName}
                  onChange={(e) => setTradeName(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-neutral-900 focus:outline-hidden focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Nicho / Categoria *</label>
                <input
                  id="lead-category-input"
                  type="text"
                  placeholder="Ex: Odontologia, Restaurante, Imobiliária"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-neutral-900 focus:outline-hidden focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Website Atual</label>
                <input
                  id="lead-website-input"
                  type="url"
                  placeholder="https://..."
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-neutral-900 focus:outline-hidden focus:ring-1 focus:ring-blue-600"
                />
              </div>
            </div>

            {/* Google Maps / GBP Data */}
            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/80 space-y-3">
              <span className="font-semibold text-neutral-800 block text-[11px]">Presença no Google Maps & Avaliações</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-neutral-600 block mb-1">Status da Ficha GBP</label>
                  <select
                    id="lead-gbp-status-select"
                    value={gbpStatus}
                    onChange={(e: any) => setGbpStatus(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-neutral-200 bg-white rounded-lg text-neutral-900 focus:outline-hidden"
                  >
                    <option value="Incompleto">Incompleto</option>
                    <option value="Nao reivindicado">Não Reivindicado</option>
                    <option value="Sem presenca">Sem Presença</option>
                    <option value="Otimizado">Otimizado</option>
                    <option value="Excelente">Excelente</option>
                  </select>
                </div>
                <div>
                  <label className="text-neutral-600 block mb-1">Nota Google (0 a 5)</label>
                  <input
                    id="lead-google-rating-input"
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={googleRating}
                    onChange={(e) => setGoogleRating(parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 border border-neutral-200 bg-white rounded-lg text-neutral-900 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="text-neutral-600 block mb-1">Qtd Avaliações</label>
                  <input
                    id="lead-review-count-input"
                    type="number"
                    value={reviewCount}
                    onChange={(e) => setReviewCount(parseInt(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 border border-neutral-200 bg-white rounded-lg text-neutral-900 focus:outline-hidden"
                  />
                </div>
              </div>
              <div>
                <label className="text-neutral-600 block mb-1">Link do Google Maps</label>
                <input
                  id="lead-maps-url-input"
                  type="url"
                  placeholder="https://maps.google.com/?cid=..."
                  value={googleMapsUrl}
                  onChange={(e) => setGoogleMapsUrl(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-neutral-200 bg-white rounded-lg text-neutral-900 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Localização */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="font-semibold text-neutral-700 block mb-1">País</label>
                <input
                  id="lead-country-input"
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-neutral-900"
                />
              </div>
              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Estado / UF</label>
                <input
                  id="lead-state-input"
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-neutral-900"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="font-semibold text-neutral-700 block mb-1">Cidade</label>
                <input
                  id="lead-city-input"
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-neutral-900"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: COMERCIAL */}
          <div className="space-y-3">
            <h3 className="font-bold text-neutral-900 text-xs uppercase tracking-wider text-blue-950 border-b border-neutral-100 pb-1">
              2. Dados Comerciais & Oportunidade
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Origem do Lead</label>
                <select
                  id="lead-source-select"
                  value={source}
                  onChange={(e: any) => setSource(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-neutral-900 bg-white"
                >
                  <option value="Google Maps">Google Maps</option>
                  <option value="Google Business Profile">Google Business Profile</option>
                  <option value="LinkedIn">LinkedIn</option>
                  <option value="Instagram">Instagram</option>
                  <option value="Indicação">Indicação</option>
                  <option value="Outbound E-mail">Outbound E-mail</option>
                  <option value="Cold Call / WhatsApp">Cold Call / WhatsApp</option>
                  <option value="Site Orgânico">Site Orgânico</option>
                  <option value="Tráfego Pago">Tráfego Pago</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Etapa Inicial do Funil</label>
                <select
                  id="lead-stage-select"
                  value={stageId}
                  onChange={(e) => setStageId(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-neutral-900 bg-white"
                >
                  {stages.map((stg) => (
                    <option key={stg.id} value={stg.id}>
                      {stg.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Temperatura</label>
                <select
                  id="lead-temp-select"
                  value={temperature}
                  onChange={(e: any) => setTemperature(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-neutral-900 bg-white"
                >
                  <option value="frio">❄️ Frio (Prospecção Inicial)</option>
                  <option value="morno">🌤️ Morno (Interagiu / Respondeu)</option>
                  <option value="quente">🔥 Quente (Pediu Proposta / Reunião)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Moeda</label>
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
                <label className="font-semibold text-neutral-700 block mb-1">Valor Estimado ({currency})</label>
                <input
                  id="lead-estimated-value-input"
                  type="number"
                  value={estimatedValue}
                  onChange={(e) => setEstimatedValue(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-neutral-900"
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Probabilidade (%)</label>
                <input
                  id="lead-prob-input"
                  type="number"
                  min="0"
                  max="100"
                  value={closingProbability}
                  onChange={(e) => setClosingProbability(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-neutral-900"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-neutral-700 block mb-1">Serviço / Solução de Interesse</label>
              <select
                id="lead-service-select"
                value={serviceOfInterest}
                onChange={(e) => setServiceOfInterest(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-neutral-900 bg-white"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.name}>
                    {p.name}
                  </option>
                ))}
                <option value="Outro / Pacote Personalizado">Outro / Pacote Personalizado</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Data do Próximo Follow-up</label>
                <input
                  id="lead-followup-input"
                  type="date"
                  value={nextFollowUpDate}
                  onChange={(e) => setNextFollowUpDate(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-neutral-900"
                />
              </div>
              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Responsável Comercial</label>
                <input
                  id="lead-responsible-input"
                  type="text"
                  value={responsibleName}
                  onChange={(e) => setResponsibleName(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-neutral-900"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: CONTATO PRINCIPAL */}
          <div className="space-y-3">
            <h3 className="font-bold text-neutral-900 text-xs uppercase tracking-wider text-blue-950 border-b border-neutral-100 pb-1">
              3. Pessoa de Contato / Decisor
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Nome do Decisor</label>
                <input
                  id="lead-contact-name-input"
                  type="text"
                  placeholder="Ex: Dr. Carlos Mendes"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-neutral-900"
                />
              </div>
              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Cargo / Função</label>
                <input
                  id="lead-contact-role-input"
                  type="text"
                  placeholder="Ex: Sócio Diretor / Proprietário"
                  value={contactRole}
                  onChange={(e) => setContactRole(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-neutral-900"
                />
              </div>
              <div>
                <label className="font-semibold text-neutral-700 block mb-1">WhatsApp de Contato</label>
                <input
                  id="lead-whatsapp-input"
                  type="text"
                  placeholder="+55 11 98888-7777"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-neutral-900"
                />
              </div>
              <div>
                <label className="font-semibold text-neutral-700 block mb-1">E-mail Comercial</label>
                <input
                  id="lead-email-input"
                  type="email"
                  placeholder="contato@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-neutral-900"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-neutral-700 block mb-1">Observações de Prospecção</label>
              <textarea
                id="lead-notes-input"
                rows={2}
                placeholder="Detalhes sobre a abordagem, dores do cliente, concorrentes ou pontos observados na ficha do Google Maps..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-neutral-900 resize-none"
              />
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100">
            <button
              id="cancel-new-lead-btn"
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-neutral-200 rounded-lg text-neutral-700 hover:bg-neutral-50 font-medium"
            >
              Cancelar
            </button>
            <button
              id="submit-new-lead-btn"
              type="submit"
              className="px-5 py-2 bg-blue-950 hover:bg-blue-900 text-white rounded-lg font-semibold shadow-sm transition-colors"
            >
              Cadastrar Lead no Pipeline
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
