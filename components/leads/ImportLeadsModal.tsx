'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { parseExcelOrCsv } from '@/lib/excelExport';
import { Lead } from '@/types';
import { UploadCloud, FileSpreadsheet, Check, AlertCircle, X, ArrowRight } from 'lucide-react';

interface ImportLeadsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ImportLeadsModal({ isOpen, onClose }: ImportLeadsModalProps) {
  const { importLeads, leads } = useApp();

  const [step, setStep] = useState<'upload' | 'mapping' | 'preview'>('upload');
  const [fileName, setFileName] = useState('');
  const [headers, setHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<Record<string, any>[]>([]);

  // Column Mappings
  const [mapping, setMapping] = useState({
    companyName: '',
    phone: '',
    whatsapp: '',
    email: '',
    category: '',
    city: '',
    state: '',
    country: '',
    estimatedValue: '',
    serviceOfInterest: '',
    googleMapsUrl: '',
    website: '',
  });

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    try {
      const { headers: parsedHeaders, rows: parsedRows } = await parseExcelOrCsv(file);
      if (parsedHeaders.length === 0 || parsedRows.length === 0) {
        alert('O arquivo selecionado parece estar vazio ou não contém dados legíveis.');
        return;
      }

      setHeaders(parsedHeaders);
      setRawRows(parsedRows);

      // Auto-match suggestions
      const newMapping = { ...mapping };
      parsedHeaders.forEach((h) => {
        const lower = h.toLowerCase();
        if (lower.includes('empresa') || lower.includes('nome') || lower.includes('company') || lower.includes('title')) {
          if (!newMapping.companyName) newMapping.companyName = h;
        } else if (lower.includes('whats') || lower.includes('celular')) {
          if (!newMapping.whatsapp) newMapping.whatsapp = h;
        } else if (lower.includes('telefone') || lower.includes('phone') || lower.includes('tel')) {
          if (!newMapping.phone) newMapping.phone = h;
        } else if (lower.includes('email') || lower.includes('e-mail') || lower.includes('mail')) {
          if (!newMapping.email) newMapping.email = h;
        } else if (lower.includes('nicho') || lower.includes('categoria') || lower.includes('category')) {
          if (!newMapping.category) newMapping.category = h;
        } else if (lower.includes('cidade') || lower.includes('city')) {
          if (!newMapping.city) newMapping.city = h;
        } else if (lower.includes('estado') || lower.includes('uf') || lower.includes('state')) {
          if (!newMapping.state) newMapping.state = h;
        } else if (lower.includes('país') || lower.includes('pais') || lower.includes('country')) {
          if (!newMapping.country) newMapping.country = h;
        } else if (lower.includes('valor') || lower.includes('preço') || lower.includes('value') || lower.includes('price')) {
          if (!newMapping.estimatedValue) newMapping.estimatedValue = h;
        } else if (lower.includes('maps') || lower.includes('google')) {
          if (!newMapping.googleMapsUrl) newMapping.googleMapsUrl = h;
        } else if (lower.includes('site') || lower.includes('web') || lower.includes('url')) {
          if (!newMapping.website) newMapping.website = h;
        }
      });

      setMapping(newMapping);
      setStep('mapping');
    } catch (err) {
      console.error(err);
      alert('Erro ao processar o arquivo. Certifique-se de enviar um arquivo .xlsx ou .csv válido.');
    }
  };

  // Convert raw rows to Lead objects
  const mappedLeads: Partial<Lead>[] = rawRows.map((r) => {
    return {
      companyName: r[mapping.companyName] ? String(r[mapping.companyName]).trim() : '',
      phone: r[mapping.phone] ? String(r[mapping.phone]).trim() : '',
      whatsapp: r[mapping.whatsapp] ? String(r[mapping.whatsapp]).trim() : r[mapping.phone] ? String(r[mapping.phone]).trim() : '',
      email: r[mapping.email] ? String(r[mapping.email]).trim() : '',
      category: r[mapping.category] ? String(r[mapping.category]).trim() : 'Prospecção Google Maps',
      city: r[mapping.city] ? String(r[mapping.city]).trim() : 'São Paulo',
      state: r[mapping.state] ? String(r[mapping.state]).trim() : 'SP',
      country: r[mapping.country] ? String(r[mapping.country]).trim() : 'Brasil',
      estimatedValue: r[mapping.estimatedValue] ? parseFloat(String(r[mapping.estimatedValue]).replace(/[^0-9.]/g, '')) || 2500 : 2500,
      googleMapsUrl: r[mapping.googleMapsUrl] ? String(r[mapping.googleMapsUrl]).trim() : '',
      website: r[mapping.website] ? String(r[mapping.website]).trim() : '',
      source: 'Google Maps',
      stageId: 'novo_lead',
      status: 'aberto',
      temperature: 'morno',
    };
  });

  const validLeads = mappedLeads.filter((l) => l.companyName);
  const invalidCount = mappedLeads.length - validLeads.length;

  const handleConfirmImport = () => {
    importLeads(validLeads);
    onClose();
  };

  return (
    <div
      id="import-leads-modal-backdrop"
      className="fixed inset-0 z-50 bg-neutral-950/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="import-leads-modal"
        className="bg-white rounded-2xl shadow-2xl border border-neutral-200 w-full max-w-2xl max-h-[90vh] flex flex-col text-neutral-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <div>
            <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-blue-700" />
              Importar Leads (CSV ou Excel XLSX)
            </h2>
            <p className="text-xs text-neutral-500">
              {step === 'upload' && 'Selecione a planilha com a lista de empresas prospectadas.'}
              {step === 'mapping' && 'Mapeie as colunas da planilha para os campos do sistema FSM.'}
              {step === 'preview' && 'Pré-visualize os dados antes de gravar no banco de dados.'}
            </p>
          </div>
          <button
            id="close-import-modal"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 text-xs">
          {step === 'upload' && (
            <div className="border-2 border-dashed border-neutral-300 hover:border-blue-500 rounded-2xl p-8 text-center transition-colors">
              <UploadCloud className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
              <p className="text-sm font-semibold text-neutral-900">Arraste sua planilha aqui ou clique para selecionar</p>
              <p className="text-xs text-neutral-500 mt-1">Formatos aceitos: .xlsx, .xls ou .csv (compatível com Excel e Google Sheets)</p>
              <label
                htmlFor="import-file-input"
                className="mt-4 inline-block px-5 py-2.5 bg-blue-950 hover:bg-blue-900 text-white rounded-lg font-medium cursor-pointer transition-colors shadow-xs"
              >
                Selecionar Arquivo
              </label>
              <input
                id="import-file-input"
                type="file"
                accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          )}

          {step === 'mapping' && (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 flex items-center justify-between">
                <span className="font-semibold text-blue-950">Arquivo: {fileName} ({rawRows.length} linhas lidas)</span>
                <button
                  type="button"
                  onClick={() => setStep('upload')}
                  className="text-blue-700 text-xs hover:underline font-medium"
                >
                  Trocar arquivo
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Nome da Empresa *</label>
                  <select
                    id="map-company-name"
                    value={mapping.companyName}
                    onChange={(e) => setMapping({ ...mapping, companyName: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg bg-white"
                  >
                    <option value="">Selecione a coluna correspondente</option>
                    {headers.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Telefone / WhatsApp</label>
                  <select
                    id="map-phone"
                    value={mapping.phone}
                    onChange={(e) => setMapping({ ...mapping, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg bg-white"
                  >
                    <option value="">Selecione a coluna correspondente</option>
                    {headers.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">E-mail Comercial</label>
                  <select
                    id="map-email"
                    value={mapping.email}
                    onChange={(e) => setMapping({ ...mapping, email: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg bg-white"
                  >
                    <option value="">Selecione a coluna correspondente</option>
                    {headers.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Nicho / Categoria</label>
                  <select
                    id="map-category"
                    value={mapping.category}
                    onChange={(e) => setMapping({ ...mapping, category: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg bg-white"
                  >
                    <option value="">Selecione a coluna correspondente</option>
                    {headers.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Cidade</label>
                  <select
                    id="map-city"
                    value={mapping.city}
                    onChange={(e) => setMapping({ ...mapping, city: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg bg-white"
                  >
                    <option value="">Selecione a coluna correspondente</option>
                    {headers.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Link do Google Maps</label>
                  <select
                    id="map-maps-url"
                    value={mapping.googleMapsUrl}
                    onChange={(e) => setMapping({ ...mapping, googleMapsUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg bg-white"
                  >
                    <option value="">Selecione a coluna correspondente</option>
                    {headers.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {step === 'preview' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-neutral-800">
                  Total de registros válidos para importar: <strong>{validLeads.length}</strong>
                </span>
                {invalidCount > 0 && (
                  <span className="text-amber-700 font-medium">
                    ⚠️ {invalidCount} linhas ignoradas por falta de nome da empresa
                  </span>
                )}
              </div>

              <div className="border border-neutral-200 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-neutral-100 font-semibold text-neutral-700 sticky top-0">
                    <tr>
                      <th className="p-2.5">Empresa</th>
                      <th className="p-2.5">Nicho</th>
                      <th className="p-2.5">Cidade</th>
                      <th className="p-2.5">Telefone</th>
                      <th className="p-2.5">E-mail</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {validLeads.slice(0, 10).map((l, i) => (
                      <tr key={i} className="hover:bg-neutral-50">
                        <td className="p-2.5 font-medium text-neutral-900">{l.companyName}</td>
                        <td className="p-2.5 text-neutral-600">{l.category}</td>
                        <td className="p-2.5 text-neutral-600">{l.city}</td>
                        <td className="p-2.5 text-neutral-600">{l.phone || l.whatsapp || '-'}</td>
                        <td className="p-2.5 text-neutral-600">{l.email || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {validLeads.length > 10 && (
                <p className="text-[11px] text-neutral-400 text-center">
                  Exibindo 10 de {validLeads.length} linhas a serem inseridas.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-100 bg-neutral-50/50">
          <button
            id="cancel-import-modal-btn"
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-neutral-200 rounded-lg text-neutral-700 hover:bg-neutral-100 font-medium text-xs"
          >
            Cancelar
          </button>

          <div className="flex gap-2">
            {step === 'mapping' && (
              <button
                id="next-to-preview-btn"
                type="button"
                disabled={!mapping.companyName}
                onClick={() => setStep('preview')}
                className="px-5 py-2 bg-blue-950 hover:bg-blue-900 disabled:opacity-50 text-white rounded-lg font-semibold text-xs transition-colors flex items-center gap-1.5"
              >
                <span>Avançar para Prévia</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {step === 'preview' && (
              <>
                <button
                  type="button"
                  onClick={() => setStep('mapping')}
                  className="px-4 py-2 border border-neutral-200 rounded-lg text-neutral-700 hover:bg-neutral-100 font-medium text-xs"
                >
                  Voltar Mapeamento
                </button>
                <button
                  id="confirm-import-btn"
                  type="button"
                  onClick={handleConfirmImport}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow-sm transition-colors flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  Confirmar Importação de {validLeads.length} Leads
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
