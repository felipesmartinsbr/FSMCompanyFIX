'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { TeamMember, Currency } from '@/types';
import { formatCurrency } from '@/lib/formatters';
import { Users, Plus, Mail, Phone, Briefcase, Trash2, MapPin, DollarSign } from 'lucide-react';

export function HRTeamView() {
  const { team, addTeamMember, deleteTeamMember } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [contractType, setContractType] = useState<'PJ' | 'CLT' | 'Freelance' | 'Socio'>('PJ');
  const [country, setCountry] = useState('Brasil');
  const [currency, setCurrency] = useState<Currency>('BRL');
  const [monthlyCost, setMonthlyCost] = useState<number>(3500);
  const [skillsInput, setSkillsInput] = useState('Operações, Marketing, Vendas');

  const totalPayrollBRL = team
    .filter((m) => (m.paymentCurrency || m.currency || 'BRL') === 'BRL')
    .reduce((s, m) => s + (m.monthlyCost || 0), 0);

  const totalPayrollUSD = team
    .filter((m) => (m.paymentCurrency || m.currency) === 'USD')
    .reduce((s, m) => s + (m.monthlyCost || 0), 0);

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !role.trim()) return;

    const skills = skillsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    addTeamMember({
      name: name.trim(),
      role: role.trim(),
      email: email.trim() || 'contato@fsmcompany.com',
      phone: phone.trim() || '-',
      country: country.trim() || 'Brasil',
      paymentCurrency: currency,
      currency: currency,
      contractType,
      type: contractType === 'Socio' ? 'fundador' : contractType === 'Freelance' ? 'freelancer' : 'pj',
      startDate: new Date().toISOString().split('T')[0],
      status: 'ativo',
      monthlyCost: Number(monthlyCost) || 0,
      skills: skills.length > 0 ? skills : ['Operação FSM'],
      assignedProjectsCount: 0,
    });

    setName('');
    setRole('');
    setEmail('');
    setPhone('');
    setSkillsInput('Operações, Marketing, Vendas');
    setShowAddModal(false);
  };

  const handleDelete = (id: string, memberName: string) => {
    if (confirm(`Remover ${memberName} da equipe?`)) {
      deleteTeamMember(id);
    }
  };

  return (
    <div id="hr-team-view" className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-neutral-900 tracking-tight">
              Recursos Humanos & Estrutura da Equipe
            </h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900">
              {team.length} {team.length === 1 ? 'membro' : 'membros'}
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">
            Especialistas operacionais, prestadores de serviço e folha de pagamentos da FSM Company.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue-950 hover:bg-blue-900 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Adicionar Membro</span>
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs text-neutral-500 font-semibold block">Folha Mensal (BRL)</span>
            <p className="text-2xl font-bold text-neutral-900 mt-1">
              {formatCurrency(totalPayrollBRL, 'BRL')}
              <span className="text-xs text-neutral-500 font-normal">/mês</span>
            </p>
            <span className="text-[11px] text-neutral-400 mt-0.5 block">Custos com sócios e prestadores PJ</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-900 flex items-center justify-center font-bold">
            <Briefcase className="w-6 h-6" />
          </div>
        </div>

        {totalPayrollUSD > 0 && (
          <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-xs text-neutral-500 font-semibold block">Folha Mensal (USD)</span>
              <p className="text-2xl font-bold text-emerald-700 mt-1">
                {formatCurrency(totalPayrollUSD, 'USD')}
                <span className="text-xs text-neutral-500 font-normal">/mês</span>
              </p>
              <span className="text-[11px] text-neutral-400 mt-0.5 block">Prestadores internacionais</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
        )}

        <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs text-neutral-500 font-semibold block">Total de Colaboradores</span>
            <p className="text-2xl font-bold text-neutral-900 mt-1">{team.length}</p>
            <span className="text-[11px] text-neutral-400 mt-0.5 block">
              {team.filter((m) => m.status === 'ativo').length} ativos no momento
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-900 flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Team Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {team.map((member) => {
          const memCurrency = member.paymentCurrency || member.currency || 'BRL';
          const badgeType = member.contractType || member.type || 'PJ';
          return (
            <div
              key={member.id}
              className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-2xs space-y-4 flex flex-col justify-between hover:border-neutral-300 transition-colors"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="truncate">
                    <h3 className="font-bold text-sm text-neutral-900 truncate">{member.name}</h3>
                    <p className="text-xs text-neutral-500 mt-0.5 truncate">{member.role}</p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className="px-2 py-0.5 bg-neutral-100 text-neutral-700 rounded text-[10px] font-bold uppercase">
                      {badgeType}
                    </span>
                    <button
                      onClick={() => handleDelete(member.id, member.name)}
                      title="Remover integrante"
                      className="text-neutral-400 hover:text-rose-600 p-1 rounded-md transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-neutral-100 space-y-1.5 text-xs text-neutral-600">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                    <span className="truncate">{member.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span>{member.phone}</span>
                  </div>
                  {member.country && (
                    <div className="flex items-center gap-2 text-neutral-500">
                      <MapPin className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
                      <span>{member.country}</span>
                    </div>
                  )}
                </div>

                {member.skills && member.skills.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {member.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
                <span className="text-neutral-500 font-medium">Custo Mensal:</span>
                <span className="font-bold text-neutral-900">
                  {formatCurrency(member.monthlyCost || 0, memCurrency)}
                  <span className="text-[11px] font-normal text-neutral-500">/mês</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 bg-neutral-950/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl border border-neutral-200 w-full max-w-md p-6 space-y-4 text-neutral-900"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-bold text-neutral-900">Adicionar Integrante à Equipe</h3>
            <form onSubmit={handleAddMember} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Nome Completo *</label>
                <input
                  required
                  type="text"
                  placeholder="Ex: João da Silva"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Cargo / Especialidade *</label>
                <input
                  required
                  type="text"
                  placeholder="Ex: Designer UI/UX & Web Developer"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">E-mail</label>
                  <input
                    type="email"
                    placeholder="joao@fsmcompany.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Telefone / WhatsApp</label>
                  <input
                    type="text"
                    placeholder="+55 11 99999-8888"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Vínculo</label>
                  <select
                    value={contractType}
                    onChange={(e: any) => setContractType(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg bg-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="PJ">Prestador PJ</option>
                    <option value="Freelance">Freelancer</option>
                    <option value="Socio">Sócio / Fundador</option>
                    <option value="CLT">CLT</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">País</label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Moeda de Pagamento</label>
                  <select
                    value={currency}
                    onChange={(e: any) => setCurrency(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg bg-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="BRL">Real Brasileiro (BRL R$)</option>
                    <option value="USD">Dólar Americano (USD $)</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Custo Mensal</label>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={monthlyCost}
                    onChange={(e) => setMonthlyCost(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg font-bold focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Habilidades (separadas por vírgula)</label>
                <input
                  type="text"
                  placeholder="Ex: Next.js, Figma, SEO, Ads"
                  value={skillsInput}
                  onChange={(e) => setSkillsInput(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-neutral-200 rounded-lg hover:bg-neutral-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-950 text-white font-bold rounded-lg hover:bg-blue-900 transition-colors"
                >
                  Salvar Integrante
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
