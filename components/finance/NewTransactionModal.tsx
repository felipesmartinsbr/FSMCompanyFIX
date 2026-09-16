'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Currency, TransactionType, TransactionStatus, PaymentMethod } from '@/types';
import { X, ArrowDownLeft, ArrowUpRight, DollarSign, Building2 } from 'lucide-react';

interface NewTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: TransactionType;
}

export function NewTransactionModal({
  isOpen,
  onClose,
  defaultType = 'receita',
}: NewTransactionModalProps) {
  const { addTransaction, clients, projects } = useApp();

  const [type, setType] = useState<TransactionType>(defaultType);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(defaultType === 'receita' ? 'Serviço Prestado' : 'Software / Ferramentas');
  const [amount, setAmount] = useState<number>(1500);
  const [currency, setCurrency] = useState<Currency>('BRL');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<TransactionStatus>('pendente');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Pix');
  const [clientId, setClientId] = useState<string>('');
  const [supplier, setSupplier] = useState<string>('');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !amount) return;

    const selectedClient = clients.find((c) => c.id === clientId);

    addTransaction({
      type,
      category,
      title,
      amount: Number(amount) || 0,
      currency,
      dueDate,
      paymentDate: status === 'pago' ? new Date().toISOString().split('T')[0] : undefined,
      status,
      clientId: selectedClient?.id,
      clientName: selectedClient?.companyName,
      supplier: type === 'despesa' ? supplier : undefined,
      paymentMethod,
      notes,
    });

    onClose();
  };

  return (
    <div
      id="new-transaction-modal-backdrop"
      className="fixed inset-0 z-50 bg-neutral-950/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in"
      onClick={onClose}
    >
      <div
        id="new-transaction-modal"
        className="bg-white rounded-2xl shadow-2xl border border-neutral-200 w-full max-w-lg flex flex-col text-neutral-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <div>
            <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2">
              {type === 'receita' ? (
                <ArrowDownLeft className="w-5 h-5 text-emerald-600" />
              ) : (
                <ArrowUpRight className="w-5 h-5 text-rose-600" />
              )}
              Novo Lançamento Financeiro
            </h2>
            <p className="text-xs text-neutral-500">Registre entradas a receber ou despesas operacionais.</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Type Selector */}
          <div>
            <label className="font-semibold text-neutral-700 block mb-1">Tipo de Operação</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setType('receita');
                  setCategory('Serviço Prestado');
                }}
                className={`flex-1 py-2 rounded-lg border font-bold text-center flex items-center justify-center gap-1.5 transition-colors ${
                  type === 'receita'
                    ? 'bg-emerald-700 text-white border-emerald-700'
                    : 'bg-neutral-50 text-neutral-700 border-neutral-200'
                }`}
              >
                <ArrowDownLeft className="w-4 h-4" />
                <span>Receita (A Receber)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setType('despesa');
                  setCategory('Software / Ferramentas');
                }}
                className={`flex-1 py-2 rounded-lg border font-bold text-center flex items-center justify-center gap-1.5 transition-colors ${
                  type === 'despesa'
                    ? 'bg-rose-700 text-white border-rose-700'
                    : 'bg-neutral-50 text-neutral-700 border-neutral-200'
                }`}
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>Despesa (A Pagar)</span>
              </button>
            </div>
          </div>

          <div>
            <label className="font-semibold text-neutral-700 block mb-1">Título / Descrição *</label>
            <input
              required
              type="text"
              placeholder={type === 'receita' ? 'Ex: Parcela 1/2 Website' : 'Ex: Hospedagem AWS / Servidor'}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-neutral-900 font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-neutral-700 block mb-1">Moeda da Operação</label>
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
              <label className="font-semibold text-neutral-700 block mb-1">Valor ({currency}) *</label>
              <input
                required
                type="number"
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg font-bold text-neutral-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-neutral-700 block mb-1">Vencimento *</label>
              <input
                required
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-neutral-900"
              />
            </div>

            <div>
              <label className="font-semibold text-neutral-700 block mb-1">Status Inicial</label>
              <select
                value={status}
                onChange={(e: any) => setStatus(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg bg-white text-neutral-900"
              >
                <option value="pendente">Pendente</option>
                <option value="pago">Pago / Liquidado</option>
                <option value="vencido">Vencido</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-neutral-700 block mb-1">Categoria Financeira</label>
              <input
                type="text"
                placeholder={type === 'receita' ? 'Serviço Prestado' : 'Software, Servidores, etc'}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-neutral-900"
              />
            </div>

            <div>
              <label className="font-semibold text-neutral-700 block mb-1">Forma de Pagamento</label>
              <select
                value={paymentMethod}
                onChange={(e: any) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg bg-white text-neutral-900"
              >
                <option value="Pix">Pix</option>
                <option value="Boleto">Boleto</option>
                <option value="Cartao de Credito">Cartão de Crédito</option>
                <option value="Transferencia">Transferência</option>
                <option value="Wire / Stripe">Wire / Stripe (USD)</option>
                <option value="PayPal">PayPal</option>
                <option value="Outro">Outro</option>
              </select>
            </div>
          </div>

          {type === 'receita' ? (
            <div>
              <label className="font-semibold text-neutral-700 block mb-1">Cliente Vinculado</label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg bg-white text-neutral-900"
              >
                <option value="">Sem vínculo específico</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.companyName}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="font-semibold text-neutral-700 block mb-1">Fornecedor / Plataforma</label>
              <input
                type="text"
                placeholder="Ex: Google Cloud, OpenAI, Figma, AWS"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-neutral-900"
              />
            </div>
          )}

          <div>
            <label className="font-semibold text-neutral-700 block mb-1">Observações Adicionais</label>
            <textarea
              rows={2}
              placeholder="Número de nota fiscal, detalhes do comprovante..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-neutral-900 resize-none"
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
              className={`px-5 py-2 font-bold text-white rounded-lg shadow-xs ${
                type === 'receita' ? 'bg-emerald-700 hover:bg-emerald-800' : 'bg-rose-700 hover:bg-rose-800'
              }`}
            >
              Confirmar Lançamento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
