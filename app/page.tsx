'use client';

import React, { useState } from 'react';
import { AppProvider, useApp } from '@/context/AppContext';
import { Sidebar } from '@/components/Sidebar';
import { Navbar } from '@/components/Navbar';
import { CommandPalette } from '@/components/CommandPalette';
import { ToastContainer } from '@/components/ToastContainer';

// Dashboard
import { DashboardView } from '@/components/dashboard/DashboardView';

// Commercial / Leads
import { LeadsView } from '@/components/leads/LeadsView';
import { ActivitiesView } from '@/components/leads/ActivitiesView';
import { NewLeadModal } from '@/components/leads/NewLeadModal';
import { LeadDetailModal } from '@/components/leads/LeadDetailModal';
import { ConvertLeadModal } from '@/components/leads/ConvertLeadModal';
import { ImportLeadsModal } from '@/components/leads/ImportLeadsModal';

// Clients
import { ClientsView } from '@/components/clients/ClientsView';
import { NewClientModal } from '@/components/clients/NewClientModal';
import { ClientDetailModal } from '@/components/clients/ClientDetailModal';

// Projects
import { ProjectsView } from '@/components/projects/ProjectsView';
import { NewProjectModal } from '@/components/projects/NewProjectModal';
import { ProjectDetailModal } from '@/components/projects/ProjectDetailModal';

// Finance
import { ReceivablesView } from '@/components/finance/ReceivablesView';
import { PayablesView } from '@/components/finance/PayablesView';
import { CashFlowView } from '@/components/finance/CashFlowView';
import { RecurringContractsView } from '@/components/finance/RecurringContractsView';
import { NewTransactionModal } from '@/components/finance/NewTransactionModal';
import { HRTeamView } from '@/components/finance/HRTeamView';

// Products / Solutions
import { ProductsView } from '@/components/products/ProductsView';
import { NewProductModal } from '@/components/products/NewProductModal';

// Reports & Settings
import { ReportsView } from '@/components/reports/ReportsView';
import { SettingsView } from '@/components/settings/SettingsView';

import { Lead, Client, SolutionProduct, TransactionType } from '@/types';

function MainApp() {
  const {
    currentTab,
    setCurrentTab,
    selectedLeadId,
    setSelectedLeadId,
    selectedClientId,
    setSelectedClientId,
    selectedProjectId,
    setSelectedProjectId,
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
  } = useApp();

  // Modal states
  const [isNewLeadModalOpen, setIsNewLeadModalOpen] = useState(false);
  const [leadToConvert, setLeadToConvert] = useState<Lead | null>(null);
  const [isImportLeadsOpen, setIsImportLeadsOpen] = useState(false);

  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [projectPreselectedClient, setProjectPreselectedClient] = useState<Client | null>(null);

  const [isNewTransactionModalOpen, setIsNewTransactionModalOpen] = useState(false);
  const [transactionDefaultType, setTransactionDefaultType] = useState<TransactionType>('receita');

  const [isNewProductModalOpen, setIsNewProductModalOpen] = useState(false);

  // Lead Conversion handler
  const handleOpenConvertLead = (lead: Lead) => {
    setLeadToConvert(lead);
  };

  // Create Project for a specific Client handler
  const handleOpenNewProjectForClient = (client: Client) => {
    setProjectPreselectedClient(client);
    setIsNewProjectModalOpen(true);
  };

  return (
    <div id="fsm-app-root" className="flex h-screen w-screen overflow-hidden bg-neutral-100 text-neutral-900">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Navbar */}
        <Navbar
          onOpenNewLeadModal={() => setIsNewLeadModalOpen(true)}
          onOpenNewClientModal={() => setIsNewClientModalOpen(true)}
          onOpenNewProjectModal={() => {
            setProjectPreselectedClient(null);
            setIsNewProjectModalOpen(true);
          }}
          onOpenNewTransactionModal={() => {
            setTransactionDefaultType('receita');
            setIsNewTransactionModalOpen(true);
          }}
          onOpenNewProductModal={() => setIsNewProductModalOpen(true)}
        />

        {/* Dynamic View Router */}
        <main className="flex-1 overflow-y-auto bg-neutral-100/60 pb-12">
          {currentTab === 'dashboard' && (
            <DashboardView
              onOpenNewLead={() => setIsNewLeadModalOpen(true)}
              onOpenNewClient={() => setIsNewClientModalOpen(true)}
              onOpenNewProject={() => {
                setProjectPreselectedClient(null);
                setIsNewProjectModalOpen(true);
              }}
              onOpenNewTransaction={() => {
                setTransactionDefaultType('receita');
                setIsNewTransactionModalOpen(true);
              }}
            />
          )}

          {currentTab === 'leads' && (
            <LeadsView
              initialViewMode="list"
              onOpenNewLead={() => setIsNewLeadModalOpen(true)}
              onOpenImportLeads={() => setIsImportLeadsOpen(true)}
              onOpenConvertLead={handleOpenConvertLead}
            />
          )}

          {currentTab === 'pipeline' && (
            <LeadsView
              initialViewMode="kanban"
              onOpenNewLead={() => setIsNewLeadModalOpen(true)}
              onOpenImportLeads={() => setIsImportLeadsOpen(true)}
              onOpenConvertLead={handleOpenConvertLead}
            />
          )}

          {currentTab === 'activities' && (
            <ActivitiesView onOpenNewLead={() => setIsNewLeadModalOpen(true)} />
          )}

          {currentTab === 'clients' && (
            <ClientsView onOpenNewClient={() => setIsNewClientModalOpen(true)} />
          )}

          {currentTab === 'projects' && (
            <ProjectsView
              onOpenNewProject={() => {
                setProjectPreselectedClient(null);
                setIsNewProjectModalOpen(true);
              }}
            />
          )}

          {currentTab === 'finance_overview' && (
            <div className="space-y-8">
              <CashFlowView />
              <div className="px-4 md:px-8 max-w-7xl mx-auto -mt-6">
                <RecurringContractsView />
              </div>
            </div>
          )}

          {currentTab === 'finance_receivables' && (
            <ReceivablesView
              onOpenNewTransaction={() => {
                setTransactionDefaultType('receita');
                setIsNewTransactionModalOpen(true);
              }}
            />
          )}

          {currentTab === 'finance_payables' && (
            <PayablesView
              onOpenNewTransaction={() => {
                setTransactionDefaultType('despesa');
                setIsNewTransactionModalOpen(true);
              }}
            />
          )}

          {currentTab === 'finance_cashflow' && <CashFlowView />}

          {currentTab === 'finance_expenses' && (
            <PayablesView
              onOpenNewTransaction={() => {
                setTransactionDefaultType('despesa');
                setIsNewTransactionModalOpen(true);
              }}
            />
          )}

          {currentTab === 'finance_hr' && <HRTeamView />}

          {currentTab === 'products' && <ProductsView />}

          {currentTab === 'reports' && <ReportsView />}

          {currentTab === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Global Command Palette */}
      <CommandPalette
        onOpenNewLead={() => setIsNewLeadModalOpen(true)}
        onOpenNewClient={() => setIsNewClientModalOpen(true)}
        onOpenNewProject={() => {
          setProjectPreselectedClient(null);
          setIsNewProjectModalOpen(true);
        }}
        onOpenNewTransaction={() => {
          setTransactionDefaultType('receita');
          setIsNewTransactionModalOpen(true);
        }}
        onOpenNewProduct={() => setIsNewProductModalOpen(true)}
      />

      {/* Global Modals */}
      <NewLeadModal
        isOpen={isNewLeadModalOpen}
        onClose={() => setIsNewLeadModalOpen(false)}
      />

      <LeadDetailModal
        leadId={selectedLeadId}
        isOpen={!!selectedLeadId}
        onClose={() => setSelectedLeadId(null)}
        onOpenConvertLead={handleOpenConvertLead}
      />

      <ConvertLeadModal
        lead={leadToConvert}
        isOpen={!!leadToConvert}
        onClose={() => setLeadToConvert(null)}
      />

      <ImportLeadsModal
        isOpen={isImportLeadsOpen}
        onClose={() => setIsImportLeadsOpen(false)}
      />

      <NewClientModal
        isOpen={isNewClientModalOpen}
        onClose={() => setIsNewClientModalOpen(false)}
      />

      <ClientDetailModal
        clientId={selectedClientId}
        isOpen={!!selectedClientId}
        onClose={() => setSelectedClientId(null)}
        onOpenNewProjectForClient={handleOpenNewProjectForClient}
      />

      <NewProjectModal
        isOpen={isNewProjectModalOpen}
        onClose={() => {
          setIsNewProjectModalOpen(false);
          setProjectPreselectedClient(null);
        }}
        preselectedClientId={projectPreselectedClient?.id}
      />

      <ProjectDetailModal
        projectId={selectedProjectId}
        isOpen={!!selectedProjectId}
        onClose={() => setSelectedProjectId(null)}
      />

      <NewTransactionModal
        isOpen={isNewTransactionModalOpen}
        onClose={() => setIsNewTransactionModalOpen(false)}
        defaultType={transactionDefaultType}
      />

      <NewProductModal
        isOpen={isNewProductModalOpen}
        onClose={() => setIsNewProductModalOpen(false)}
      />

      {/* Real-time Toast Notifications */}
      <ToastContainer />
    </div>
  );
}

export default function Page() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
