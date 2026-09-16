'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { Product, ProductCategory } from '@/types';
import { formatCurrency } from '@/lib/formatters';
import {
  Package,
  Search,
  Plus,
  Copy,
  Clock,
  CheckCircle2,
  Layers,
  ArrowRight,
  FolderKanban,
  UserPlus,
} from 'lucide-react';
import { NewProductModal } from './NewProductModal';

interface ProductsViewProps {
  onOpenNewLeadWithProduct?: (product: Product) => void;
  onOpenNewProjectWithProduct?: (product: Product) => void;
}

export function ProductsView({
  onOpenNewLeadWithProduct,
  onOpenNewProjectWithProduct,
}: ProductsViewProps) {
  const { products, addProduct } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [showNewModal, setShowNewModal] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (categoryFilter !== 'ALL') {
        const catA = (p.category || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        const catB = categoryFilter.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (p.category !== categoryFilter && !catA.includes(catB) && !catB.includes(catA)) {
          return false;
        }
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = (p.name || '').toLowerCase().includes(q);
        const matchDesc = (p.description || p.shortDescription || p.fullDescription || '').toLowerCase().includes(q);
        if (!matchName && !matchDesc) return false;
      }
      return true;
    });
  }, [products, categoryFilter, searchQuery]);

  const handleDuplicate = (prod: Product) => {
    addProduct({
      ...prod,
      name: `${prod.name} (Cópia)`,
      status: 'ativo',
    });
  };

  return (
    <div id="products-view" className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-neutral-900 tracking-tight">
              Catálogo de Produtos & Serviços
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-900">
              {filteredProducts.length} soluções
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">
            Soluções estruturadas da FSM Company com precificação oficial, escopo de entrega e templates de projeto.
          </p>
        </div>

        <button
          onClick={() => {
            setProductToEdit(null);
            setShowNewModal(true);
          }}
          className="px-4 py-1.5 bg-indigo-950 hover:bg-indigo-900 text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Nova Solução</span>
        </button>
      </div>

      {/* Filter bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-neutral-200/80 shadow-2xs flex flex-wrap items-center gap-3 text-xs">
        <div className="flex-1 min-w-[220px] relative">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar por nome ou descrição do produto..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-neutral-200 rounded-lg text-neutral-900 placeholder-neutral-400 focus:outline-hidden"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-1.5 border border-neutral-200 rounded-lg bg-white text-neutral-700 font-medium"
        >
          <option value="ALL">Categoria: Todas</option>
          <option value="Websites">Websites & Landing Pages</option>
          <option value="Google Meu Negocio">Google Meu Negócio & GBP</option>
          <option value="Inteligencia Artificial">Inteligência Artificial & Automação</option>
          <option value="Trafego Pago">Tráfego Pago & Performance</option>
          <option value="Consultoria">Consultoria & Diagnóstico</option>
        </select>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-2xl p-5 border border-neutral-200/80 hover:border-indigo-400 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded uppercase tracking-wider">
                    {product.category.replace('_', ' ')}
                  </span>
                  <h3 className="font-bold text-sm text-neutral-900 mt-1.5 leading-snug">
                    {product.name}
                  </h3>
                </div>

                <button
                  title="Duplicar modelo"
                  onClick={() => handleDuplicate(product)}
                  className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="text-xs text-neutral-600 line-clamp-2">
                {product.description || product.shortDescription || product.fullDescription}
              </p>

              {/* Deliverables snippet */}
              <div className="space-y-1 pt-1">
                <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">
                  Entregáveis Principais
                </span>
                <div className="space-y-1 text-[11px] text-neutral-700">
                  {(product.deliverables || product.benefits || []).slice(0, 3).map((d, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                      <span className="truncate">{d}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Price & Execution time Footer */}
            <div className="pt-3 border-t border-neutral-100 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-neutral-400 block font-medium">Preço Brasil</span>
                  <span className="font-bold text-neutral-900 text-sm">
                    {formatCurrency(product.suggestedPriceBRL ?? product.priceBRL ?? 0, 'BRL')}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-neutral-400 block font-medium">Preço Exterior</span>
                  <span className="font-bold text-emerald-700 text-sm">
                    {formatCurrency(product.suggestedPriceUSD ?? product.priceUSD ?? 0, 'USD')}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-1 border-t border-dashed border-neutral-100">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Média: {product.avgDeliveryDays ?? product.estimatedDaysMin ?? 15} dias úteis
                </span>
                <span className="flex items-center gap-1">
                  <Layers className="w-3 h-3" />
                  {(product.templatePhases?.length ?? product.projectTemplatePhases?.length ?? 0)} fases prontas
                </span>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => {
                    setProductToEdit(product);
                    setShowNewModal(true);
                  }}
                  className="flex-1 py-1.5 border border-neutral-200 rounded-lg text-neutral-700 font-semibold text-center hover:bg-neutral-50 transition-colors"
                >
                  Editar Escopo
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredProducts.length === 0 && (
          <div className="col-span-full py-16 text-center text-neutral-400 bg-white rounded-2xl border border-dashed border-neutral-200">
            Nenhuma solução encontrada no catálogo.
          </div>
        )}
      </div>

      {showNewModal && (
        <NewProductModal
          isOpen={showNewModal}
          onClose={() => {
            setShowNewModal(false);
            setProductToEdit(null);
          }}
          productToEdit={productToEdit}
        />
      )}
    </div>
  );
}
