'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Product, ProductCategory, ProductPricingModel, ProductStatus } from '@/types';
import { X, Package, Sparkles, Plus, Trash2 } from 'lucide-react';

interface NewProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: Product | null;
}

export function NewProductModal({
  isOpen,
  onClose,
  productToEdit,
}: NewProductModalProps) {
  const { addProduct, updateProduct } = useApp();

  const [name, setName] = useState(productToEdit?.name || '');
  const [category, setCategory] = useState<string>(productToEdit?.category || 'Websites');
  const [description, setDescription] = useState(productToEdit?.description || productToEdit?.shortDescription || '');
  const [suggestedPriceBRL, setSuggestedPriceBRL] = useState<number>(productToEdit?.suggestedPriceBRL ?? productToEdit?.priceBRL ?? 3500);
  const [suggestedPriceUSD, setSuggestedPriceUSD] = useState<number>(productToEdit?.suggestedPriceUSD ?? productToEdit?.priceUSD ?? 1200);
  const [pricingModel, setPricingModel] = useState<string>(
    productToEdit?.pricingModel || (productToEdit?.billingType === 'recorrente' ? 'mensal' : productToEdit?.billingType === 'hibrido' ? 'setup_mensal' : 'unico')
  );
  const [avgDeliveryDays, setAvgDeliveryDays] = useState<number>(productToEdit?.avgDeliveryDays ?? productToEdit?.estimatedDaysMin ?? 15);
  const [deliverablesInput, setDeliverablesInput] = useState<string>(
    productToEdit?.deliverables ? productToEdit.deliverables.join('\n') : 'Layout UX/UI exclusivo no Figma\nDesenvolvimento responsivo\nIntegração WhatsApp e Analytics'
  );
  const [status, setStatus] = useState<ProductStatus>(productToEdit?.status || 'ativo');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const deliverables = deliverablesInput
      .split('\n')
      .map((d) => d.trim())
      .filter(Boolean);

    const priceBRL = Number(suggestedPriceBRL) || 0;
    const priceUSD = Number(suggestedPriceUSD) || 0;
    const billingType: 'fixo' | 'recorrente' | 'hibrido' =
      pricingModel === 'mensal' ? 'recorrente' : pricingModel === 'setup_mensal' ? 'hibrido' : 'fixo';

    const defaultPhases = [
      {
        name: 'Fase 1: Onboarding e Coleta',
        order: 1,
        tasks: [
          {
            title: 'Reunião de alinhamento e briefing',
            checklist: ['Acessos concedidos', 'Identidade visual recebida'],
          },
        ],
      },
      {
        name: 'Fase 2: Desenvolvimento & Execução',
        order: 2,
        tasks: [
          {
            title: 'Estruturação da solução',
            checklist: ['Desenvolvimento', 'Testes de responsividade'],
          },
        ],
      },
      {
        name: 'Fase 3: Entrega & Go-Live',
        order: 3,
        tasks: [
          {
            title: 'Homologação e Publicação',
            checklist: ['Aprovação do cliente', 'Publicação oficial'],
          },
        ],
      },
    ];

    const phases = productToEdit?.projectTemplatePhases || productToEdit?.templatePhases || defaultPhases;

    const productPayload = {
      name: name.trim(),
      category,
      description,
      shortDescription: description,
      suggestedPriceBRL: priceBRL,
      priceBRL: priceBRL,
      suggestedPriceUSD: priceUSD,
      priceUSD: priceUSD,
      pricingModel,
      billingType,
      defaultCurrency: 'BRL' as const,
      deliverables,
      avgDeliveryDays: Number(avgDeliveryDays) || 10,
      estimatedDaysMin: Number(avgDeliveryDays) || 10,
      estimatedDaysMax: (Number(avgDeliveryDays) || 10) + 7,
      status,
      templatePhases: phases,
      projectTemplatePhases: phases,
    };

    if (productToEdit) {
      updateProduct(productToEdit.id, productPayload);
    } else {
      addProduct(productPayload);
    }

    onClose();
  };

  return (
    <div
      id="new-product-modal-backdrop"
      className="fixed inset-0 z-50 bg-neutral-950/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in"
      onClick={onClose}
    >
      <div
        id="new-product-modal"
        className="bg-white rounded-2xl shadow-2xl border border-neutral-200 w-full max-w-xl max-h-[90vh] flex flex-col text-neutral-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <div>
            <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2">
              <Package className="w-5 h-5 text-indigo-700" />
              {productToEdit ? 'Editar Produto / Serviço' : 'Novo Produto ou Solução'}
            </h2>
            <p className="text-xs text-neutral-500">
              Defina proposta de valor, precificação em BRL/USD e modelo padrão de fases.
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          <div>
            <label className="font-semibold text-neutral-700 block mb-1">Nome da Solução / Serviço *</label>
            <input
              required
              type="text"
              placeholder="Ex: Landing Page de Alta Conversão"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-neutral-900 font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-neutral-700 block mb-1">Categoria *</label>
              <select
                value={category}
                onChange={(e: any) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg bg-white text-neutral-900"
              >
                <option value="Websites">Websites & Landing Pages</option>
                <option value="Google Meu Negocio">Google Meu Negócio & GBP</option>
                <option value="Inteligencia Artificial">Inteligência Artificial & Automação</option>
                <option value="Trafego Pago">Tráfego Pago & Performance</option>
                <option value="Consultoria">Consultoria & Diagnóstico</option>
                <option value="Manutencao">Manutenção / Retainer</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-neutral-700 block mb-1">Modelo de Cobrança</label>
              <select
                value={pricingModel}
                onChange={(e: any) => setPricingModel(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg bg-white text-neutral-900"
              >
                <option value="unico">Valor Único (Projeto Fechado)</option>
                <option value="mensal">Mensal Recorrente (Retainer)</option>
                <option value="setup_mensal">Setup + Mensal</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-neutral-700 block mb-1">Preço Sugerido (BRL R$)</label>
              <input
                required
                type="number"
                value={suggestedPriceBRL}
                onChange={(e) => setSuggestedPriceBRL(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg font-bold text-neutral-900"
              />
            </div>

            <div>
              <label className="font-semibold text-neutral-700 block mb-1">Preço Sugerido (USD $)</label>
              <input
                required
                type="number"
                value={suggestedPriceUSD}
                onChange={(e) => setSuggestedPriceUSD(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg font-bold text-emerald-700"
              />
            </div>

            <div>
              <label className="font-semibold text-neutral-700 block mb-1">Prazo Médio (Dias Úteis)</label>
              <input
                required
                type="number"
                value={avgDeliveryDays}
                onChange={(e) => setAvgDeliveryDays(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-neutral-900"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-neutral-700 block mb-1">Proposta de Valor / Descrição Comercial</label>
            <textarea
              rows={3}
              placeholder="Explique o diferencial e os benefícios diretos para o cliente..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-neutral-900 resize-none"
            />
          </div>

          <div>
            <label className="font-semibold text-neutral-700 block mb-1">
              Entregáveis Inclusos (um por linha)
            </label>
            <textarea
              rows={4}
              placeholder="Layout Figma&#10;Código responsivo&#10;Google Analytics instalado&#10;Treinamento de uso"
              value={deliverablesInput}
              onChange={(e) => setDeliverablesInput(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-neutral-900 font-mono text-xs resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-neutral-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-neutral-200 rounded-lg hover:bg-neutral-50 text-neutral-700"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-950 hover:bg-indigo-900 text-white font-bold rounded-lg shadow-xs"
            >
              {productToEdit ? 'Salvar Alterações' : 'Cadastrar Solução'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
