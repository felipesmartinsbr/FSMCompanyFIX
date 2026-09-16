-- ==============================================================================
-- FSM COMPANY - SISTEMA DE GESTÃO EMPRESARIAL & CRM
-- SCRIPT DE CRIAÇÃO E MIGRAÇÃO COMPLETA PARA BANCO DE DADOS SUPABASE (POSTGRESQL)
-- ==============================================================================
-- Instruções:
-- 1. Acesse seu projeto no Supabase (https://supabase.com/dashboard)
-- 2. No menu lateral, clique em "SQL Editor" e depois em "New query"
-- 3. Cole este script completo e clique em "Run" (Executar)
-- 4. Todas as tabelas, índices, triggers e políticas RLS serão criadas com sucesso!
-- ==============================================================================

-- Habilita extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Função utilitária para atualizar a coluna updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ==============================================================================
-- 1. TABELA: company_settings (Configurações da Empresa e Parâmetros do Sistema)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS company_settings (
    id VARCHAR(50) PRIMARY KEY DEFAULT 'default',
    company_name VARCHAR(255) NOT NULL DEFAULT 'FSM Company',
    trade_name VARCHAR(255) DEFAULT 'FSM Digital Solutions & Consulting',
    legal_name VARCHAR(255) DEFAULT 'FSM Soluções Digitais & Consultoria Ltda.',
    logo_text VARCHAR(50) DEFAULT 'FSM',
    tax_id VARCHAR(50) DEFAULT '',
    email VARCHAR(255) DEFAULT 'operacao@fsmcompany.com',
    phone VARCHAR(50) DEFAULT '',
    primary_currency VARCHAR(10) NOT NULL DEFAULT 'BRL',
    exchange_rate_brl_to_usd NUMERIC(10, 4) NOT NULL DEFAULT 5.65,
    usd_to_brl_rate NUMERIC(10, 4) NOT NULL DEFAULT 5.65,
    base_country VARCHAR(100) DEFAULT 'Brasil',
    operating_cities JSONB DEFAULT '["São Paulo", "Curitiba", "Rio de Janeiro", "Miami", "Orlando"]'::jsonb,
    timezone VARCHAR(100) DEFAULT 'America/Sao_Paulo (UTC-3)',
    owner_name VARCHAR(255) DEFAULT 'Diretoria Executiva',
    owner_email VARCHAR(255) DEFAULT 'operacao@fsmcompany.com',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 2. TABELA: lead_stages (Etapas do Pipeline de Vendas / Kanban)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS lead_stages (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    color VARCHAR(50) NOT NULL,
    "order" INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inserir estágios padrão se não existirem
INSERT INTO lead_stages (id, name, color, "order") VALUES
('novo_lead', 'Novo Lead', '#64748b', 1),
('pesquisa_qualificacao', 'Pesquisa / Qualificação', '#3b82f6', 2),
('primeiro_contato', 'Primeiro Contato', '#0ea5e9', 3),
('contato_realizado', 'Contato Realizado', '#06b6d4', 4),
('reuniao_agendada', 'Reunião Agendada', '#8b5cf6', 5),
('reuniao_realizada', 'Reunião Realizada', '#a855f7', 6),
('proposta_enviada', 'Proposta Enviada', '#f59e0b', 7),
('negociacao', 'Negociação', '#f97316', 8),
('aguardando_decisao', 'Aguardando Decisão', '#eab308', 9),
('ganho', 'Ganho (Fechado)', '#10b981', 10),
('perdido', 'Perdido', '#ef4444', 11),
('nutricao', 'Nutrição / Follow-up', '#94a3b8', 12)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    color = EXCLUDED.color,
    "order" = EXCLUDED."order";

-- ==============================================================================
-- 3. TABELA: solution_products (Catálogo de Soluções e Serviços)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS solution_products (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    short_description TEXT,
    full_description TEXT,
    status VARCHAR(50) DEFAULT 'ativo',
    target_audience TEXT,
    recommended_niched JSONB DEFAULT '[]'::jsonb,
    problem_solved TEXT,
    benefits JSONB DEFAULT '[]'::jsonb,
    price_brl NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    price_usd NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    billing_type VARCHAR(50) NOT NULL DEFAULT 'fixo',
    default_currency VARCHAR(10) NOT NULL DEFAULT 'BRL',
    estimated_days_min INTEGER DEFAULT 7,
    estimated_days_max INTEGER DEFAULT 15,
    responsible_name VARCHAR(255),
    sales_count INTEGER DEFAULT 0,
    total_revenue_brl NUMERIC(12, 2) DEFAULT 0.00,
    total_revenue_usd NUMERIC(12, 2) DEFAULT 0.00,
    components JSONB DEFAULT '[]'::jsonb,
    project_template_phases JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 4. TABELA: clients (Clientes Cadastrados e Contratos Ativos)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS clients (
    id VARCHAR(100) PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    trade_name VARCHAR(255),
    legal_name VARCHAR(255),
    cnpj_cpf VARCHAR(50),
    contact_name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    whatsapp VARCHAR(50),
    address VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(50),
    country VARCHAR(100) NOT NULL DEFAULT 'Brasil',
    postal_code VARCHAR(50),
    status VARCHAR(50) NOT NULL DEFAULT 'ativo',
    source VARCHAR(100),
    lead_id VARCHAR(100),
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    account_manager VARCHAR(255),
    currency VARCHAR(10) NOT NULL DEFAULT 'BRL',
    billing_day INTEGER DEFAULT 10,
    total_paid_brl NUMERIC(12, 2) DEFAULT 0.00,
    total_paid_usd NUMERIC(12, 2) DEFAULT 0.00,
    outstanding_balance_brl NUMERIC(12, 2) DEFAULT 0.00,
    outstanding_balance_usd NUMERIC(12, 2) DEFAULT 0.00,
    monthly_contract_value NUMERIC(12, 2) DEFAULT 0.00,
    notes TEXT,
    contacts JSONB DEFAULT '[]'::jsonb,
    documents JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 5. TABELA: leads (Oportunidades Comerciais e Pipeline de Vendas)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS leads (
    id VARCHAR(100) PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    trade_name VARCHAR(255),
    category VARCHAR(100),
    description TEXT,
    website VARCHAR(255),
    google_maps_url TEXT,
    gbp_status VARCHAR(100),
    google_rating NUMERIC(3, 2),
    review_count INTEGER DEFAULT 0,
    phone VARCHAR(50),
    whatsapp VARCHAR(50),
    email VARCHAR(255),
    address VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(50),
    country VARCHAR(100) NOT NULL DEFAULT 'Brasil',
    postal_code VARCHAR(50),
    responsible_name VARCHAR(255),
    source VARCHAR(100) NOT NULL DEFAULT 'Outro',
    stage_id VARCHAR(100) REFERENCES lead_stages(id) ON DELETE SET NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'aberto',
    temperature VARCHAR(50) NOT NULL DEFAULT 'morno',
    service_of_interest VARCHAR(255),
    estimated_value NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(10) NOT NULL DEFAULT 'BRL',
    closing_probability INTEGER DEFAULT 50,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_contact_date TIMESTAMPTZ,
    next_meeting_date TIMESTAMPTZ,
    next_follow_up_date TIMESTAMPTZ,
    loss_reason TEXT,
    loss_custom_note TEXT,
    notes TEXT,
    contacts JSONB DEFAULT '[]'::jsonb,
    activities JSONB DEFAULT '[]'::jsonb
);

-- ==============================================================================
-- 6. TABELA: lead_activities (Histórico de Interações Comerciais)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS lead_activities (
    id VARCHAR(100) PRIMARY KEY,
    lead_id VARCHAR(100) REFERENCES leads(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    date TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    result TEXT,
    responsible_name VARCHAR(255)
);

-- ==============================================================================
-- 7. TABELA: projects (Projetos em Execução, Fases e Cronogramas)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS projects (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    client_id VARCHAR(100) REFERENCES clients(id) ON DELETE SET NULL,
    client_name VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'planejamento',
    service_type VARCHAR(100),
    product_id VARCHAR(100) REFERENCES solution_products(id) ON DELETE SET NULL,
    responsible_name VARCHAR(255),
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    actual_start_date DATE,
    due_date DATE NOT NULL,
    completed_date DATE,
    progress_percentage INTEGER NOT NULL DEFAULT 0,
    currency VARCHAR(10) NOT NULL DEFAULT 'BRL',
    contract_value NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    is_released BOOLEAN NOT NULL DEFAULT TRUE,
    released_at TIMESTAMPTZ,
    financial_transaction_id VARCHAR(100),
    google_drive_url TEXT,
    figma_url TEXT,
    live_url TEXT,
    notes TEXT,
    phases JSONB DEFAULT '[]'::jsonb,
    comments JSONB DEFAULT '[]'::jsonb,
    files JSONB DEFAULT '[]'::jsonb,
    meetings JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 8. TABELA: financial_transactions (Contas a Receber, Pagar e Fluxo de Caixa)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS financial_transactions (
    id VARCHAR(100) PRIMARY KEY,
    type VARCHAR(50) NOT NULL, -- 'receita' ou 'despesa'
    category VARCHAR(100) NOT NULL,
    description VARCHAR(255) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'BRL',
    amount_in_primary_currency NUMERIC(12, 2),
    exchange_rate_applied NUMERIC(10, 4),
    status VARCHAR(50) NOT NULL DEFAULT 'pendente', -- 'pendente', 'pago', 'vencido', 'cancelado'
    due_date DATE NOT NULL,
    payment_date DATE,
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    client_id VARCHAR(100) REFERENCES clients(id) ON DELETE SET NULL,
    client_name VARCHAR(255),
    project_id VARCHAR(100) REFERENCES projects(id) ON DELETE SET NULL,
    project_name VARCHAR(255),
    payment_method VARCHAR(100) NOT NULL,
    payment_link TEXT,
    invoice_number VARCHAR(100),
    installment_number INTEGER DEFAULT 1,
    total_installments INTEGER DEFAULT 1,
    cost_center VARCHAR(100),
    supplier_name VARCHAR(255),
    recurring_contract_id VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 9. TABELA: recurring_contracts (Contratos de Receita Recorrente - MRR)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS recurring_contracts (
    id VARCHAR(100) PRIMARY KEY,
    client_id VARCHAR(100) REFERENCES clients(id) ON DELETE CASCADE,
    client_name VARCHAR(255) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    recurring_amount NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'BRL',
    billing_interval VARCHAR(50) NOT NULL DEFAULT 'mensal', -- 'mensal', 'trimestral', 'semestral', 'anual'
    billing_day INTEGER NOT NULL DEFAULT 10,
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    next_billing_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'ativo', -- 'ativo', 'pausado', 'cancelado'
    payment_method VARCHAR(100) NOT NULL DEFAULT 'Boleto',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 10. TABELA: team_members (Equipe Operacional e Recursos Humanos)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS team_members (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    department VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    whatsapp VARCHAR(50),
    country VARCHAR(100) NOT NULL DEFAULT 'Brasil',
    city VARCHAR(100),
    contract_type VARCHAR(50) NOT NULL DEFAULT 'pj', -- 'pj', 'clt', 'freelancer', 'socio'
    monthly_cost NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(10) NOT NULL DEFAULT 'BRL',
    status VARCHAR(50) NOT NULL DEFAULT 'ativo',
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    skills JSONB DEFAULT '[]'::jsonb,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- CRIAÇÃO DE ÍNDICES DE PERFORMANCE PARA CONSULTAS RÁPIDAS
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_leads_stage_id ON leads(stage_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_currency ON leads(currency);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_client_id ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_due_date ON projects(due_date);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON financial_transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON financial_transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_due_date ON financial_transactions(due_date);
CREATE INDEX IF NOT EXISTS idx_transactions_client_id ON financial_transactions(client_id);
CREATE INDEX IF NOT EXISTS idx_transactions_project_id ON financial_transactions(project_id);
CREATE INDEX IF NOT EXISTS idx_recurring_client_id ON recurring_contracts(client_id);
CREATE INDEX IF NOT EXISTS idx_recurring_status ON recurring_contracts(status);

-- ==============================================================================
-- TRIGGERS PARA ATUALIZAÇÃO AUTOMÁTICA DE updated_at
-- ==============================================================================
DROP TRIGGER IF EXISTS trigger_company_settings_updated_at ON company_settings;
CREATE TRIGGER trigger_company_settings_updated_at BEFORE UPDATE ON company_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_solution_products_updated_at ON solution_products;
CREATE TRIGGER trigger_solution_products_updated_at BEFORE UPDATE ON solution_products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_clients_updated_at ON clients;
CREATE TRIGGER trigger_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_leads_updated_at ON leads;
CREATE TRIGGER trigger_leads_updated_at BEFORE UPDATE ON leads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_projects_updated_at ON projects;
CREATE TRIGGER trigger_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_financial_transactions_updated_at ON financial_transactions;
CREATE TRIGGER trigger_financial_transactions_updated_at BEFORE UPDATE ON financial_transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_recurring_contracts_updated_at ON recurring_contracts;
CREATE TRIGGER trigger_recurring_contracts_updated_at BEFORE UPDATE ON recurring_contracts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_team_members_updated_at ON team_members;
CREATE TRIGGER trigger_team_members_updated_at BEFORE UPDATE ON team_members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) - POLÍTICAS DE ACESSO
-- Permite leitura e escrita seguras tanto para anon quanto authenticated
-- ==============================================================================
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE solution_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso público/autenticado para a aplicação
DO $$
BEGIN
    -- company_settings
    DROP POLICY IF EXISTS "Permissao geral company_settings" ON company_settings;
    CREATE POLICY "Permissao geral company_settings" ON company_settings FOR ALL USING (true) WITH CHECK (true);

    -- lead_stages
    DROP POLICY IF EXISTS "Permissao geral lead_stages" ON lead_stages;
    CREATE POLICY "Permissao geral lead_stages" ON lead_stages FOR ALL USING (true) WITH CHECK (true);

    -- solution_products
    DROP POLICY IF EXISTS "Permissao geral solution_products" ON solution_products;
    CREATE POLICY "Permissao geral solution_products" ON solution_products FOR ALL USING (true) WITH CHECK (true);

    -- clients
    DROP POLICY IF EXISTS "Permissao geral clients" ON clients;
    CREATE POLICY "Permissao geral clients" ON clients FOR ALL USING (true) WITH CHECK (true);

    -- leads
    DROP POLICY IF EXISTS "Permissao geral leads" ON leads;
    CREATE POLICY "Permissao geral leads" ON leads FOR ALL USING (true) WITH CHECK (true);

    -- lead_activities
    DROP POLICY IF EXISTS "Permissao geral lead_activities" ON lead_activities;
    CREATE POLICY "Permissao geral lead_activities" ON lead_activities FOR ALL USING (true) WITH CHECK (true);

    -- projects
    DROP POLICY IF EXISTS "Permissao geral projects" ON projects;
    CREATE POLICY "Permissao geral projects" ON projects FOR ALL USING (true) WITH CHECK (true);

    -- financial_transactions
    DROP POLICY IF EXISTS "Permissao geral financial_transactions" ON financial_transactions;
    CREATE POLICY "Permissao geral financial_transactions" ON financial_transactions FOR ALL USING (true) WITH CHECK (true);

    -- recurring_contracts
    DROP POLICY IF EXISTS "Permissao geral recurring_contracts" ON recurring_contracts;
    CREATE POLICY "Permissao geral recurring_contracts" ON recurring_contracts FOR ALL USING (true) WITH CHECK (true);

    -- team_members
    DROP POLICY IF EXISTS "Permissao geral team_members" ON team_members;
    CREATE POLICY "Permissao geral team_members" ON team_members FOR ALL USING (true) WITH CHECK (true);
END $$;

-- ==============================================================================
-- INSERÇÃO DA CONFIGURAÇÃO INICIAL PADRÃO DA EMPRESA (SE NÃO EXISTIR)
-- ==============================================================================
INSERT INTO company_settings (
    id, company_name, trade_name, primary_currency,
    exchange_rate_brl_to_usd, usd_to_brl_rate, base_country,
    timezone, owner_name, owner_email
) VALUES (
    'default', 'FSM Company', 'FSM Digital Solutions & Consulting', 'BRL',
    5.65, 5.65, 'Brasil',
    'America/Sao_Paulo (UTC-3)', 'Diretoria Executiva', 'operacao@fsmcompany.com'
) ON CONFLICT (id) DO NOTHING;
