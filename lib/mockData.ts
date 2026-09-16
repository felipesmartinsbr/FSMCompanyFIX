import {
  Lead,
  LeadStage,
  Client,
  Project,
  FinancialTransaction,
  RecurringContract,
  TeamMember,
  SolutionProduct,
  CompanySettings,
} from '@/types';

export const DEFAULT_SETTINGS: CompanySettings = {
  companyName: 'FSM Company',
  tradeName: 'FSM Digital Solutions & Consulting',
  logoText: 'FSM',
  primaryCurrency: 'BRL',
  exchangeRateBRLtoUSD: 5.65,
  usdToBrlRate: 5.65,
  baseCountry: 'Brasil',
  operatingCities: ['São Paulo', 'Curitiba', 'Rio de Janeiro', 'Miami', 'Orlando'],
  timezone: 'America/Sao_Paulo (UTC-3)',
  ownerName: 'Diretoria Executiva',
  ownerEmail: 'operacao@fsmcompany.com',
};

export const DEFAULT_STAGES: LeadStage[] = [
  { id: 'novo_lead', name: 'Novo Lead', color: '#64748b', order: 1 },
  { id: 'pesquisa_qualificacao', name: 'Pesquisa / Qualificação', color: '#3b82f6', order: 2 },
  { id: 'primeiro_contato', name: 'Primeiro Contato', color: '#0ea5e9', order: 3 },
  { id: 'contato_realizado', name: 'Contato Realizado', color: '#06b6d4', order: 4 },
  { id: 'reuniao_agendada', name: 'Reunião Agendada', color: '#8b5cf6', order: 5 },
  { id: 'reuniao_realizada', name: 'Reunião Realizada', color: '#a855f7', order: 6 },
  { id: 'proposta_enviada', name: 'Proposta Enviada', color: '#f59e0b', order: 7 },
  { id: 'negociacao', name: 'Negociação', color: '#f97316', order: 8 },
  { id: 'aguardando_decisao', name: 'Aguardando Decisão', color: '#eab308', order: 9 },
  { id: 'ganho', name: 'Ganho (Fechado)', color: '#10b981', order: 10 },
  { id: 'perdido', name: 'Perdido', color: '#ef4444', order: 11 },
  { id: 'nutricao', name: 'Nutrição / Follow-up', color: '#94a3b8', order: 12 },
];

export const INITIAL_PRODUCTS: SolutionProduct[] = [
  {
    id: 'prod_site_conversao',
    name: 'Criação de Website de Alta Conversão',
    category: 'Websites',
    shortDescription: 'Website institucional veloz, responsivo e projetado para converter visitantes em clientes.',
    fullDescription: 'Desenvolvimento completo de website com arquitetura comercial, design exclusivo em Next.js/Tailwind, otimização de velocidade 90+ no Google PageSpeed, copywriting persuasivo, integração com WhatsApp e formulários analíticos.',
    status: 'ativo',
    targetAudience: 'Clínicas, escritórios de advocacia, imobiliárias, empresas de serviços locais e B2B.',
    recommendedNiched: ['Saúde & Odonto', 'Direito', 'Engenharia & Arquitetura', 'Imobiliárias', 'B2B'],
    problemSolved: 'Sites lentos, desatualizados ou ausência de presença digital moderna que causa perda de clientes para concorrentes.',
    benefits: [
      'Visual moderno e autoridade imediata',
      'Carregamento ultra rápido mobile-first',
      'Botões de WhatsApp e captura de leads integrados',
      'SEO técnico on-page nativo'
    ],
    priceBRL: 4800,
    priceUSD: 1400,
    billingType: 'fixo',
    defaultCurrency: 'BRL',
    estimatedDaysMin: 14,
    estimatedDaysMax: 21,
    responsibleName: 'Felipe Martins',
    salesCount: 0,
    totalRevenueBRL: 0,
    totalRevenueUSD: 0,
    components: [
      { id: 'comp_1', name: 'Briefing e Arquitetura de Conversão', description: 'Mapeamento das personas, funil de conversão e estrutura de páginas', order: 1, isRequired: true, estimatedHours: 6 },
      { id: 'comp_2', name: 'Wireframe e Design UI/UX', description: 'Design moderno focado em conversão e usabilidade desktop/mobile', order: 2, isRequired: true, estimatedHours: 16 },
      { id: 'comp_3', name: 'Desenvolvimento Front-end e CMS', description: 'Codificação limpa, responsiva com suporte a gestão de conteúdo', order: 3, isRequired: true, estimatedHours: 28 },
      { id: 'comp_4', name: 'SEO Inicial e Tags de Rastreamento', description: 'Google Analytics 4, Meta Pixel, Tag Manager e Meta tags', order: 4, isRequired: true, estimatedHours: 6 },
      { id: 'comp_5', name: 'Publicação, Domínio e Testes', description: 'Configuração de DNS, SSL seguro e testes de formulários', order: 5, isRequired: true, estimatedHours: 4 },
    ],
    projectTemplatePhases: [
      {
        name: 'Fase 1: Onboarding e Briefing Comercial',
        order: 1,
        tasks: [
          { title: 'Enviar formulário de briefing e agendar alinhamento', estimatedDays: 2, checklist: ['Formulário enviado', 'Reunião de alinhamento feita', 'Acessos a domínio coletados'] },
          { title: 'Estruturação de mapa do site e proposta de copy', estimatedDays: 3, checklist: ['Estrutura validada', 'Textos das seções redigidos'] },
        ]
      },
      {
        name: 'Fase 2: Design e Aprovação Visual',
        order: 2,
        tasks: [
          { title: 'Criação do layout das páginas chave (Home + Serviços)', estimatedDays: 5, checklist: ['Design desktop pronto', 'Versão mobile revisada', 'Apresentação ao cliente feita'] },
          { title: 'Coleta de feedbacks e ajustes finos', estimatedDays: 2, checklist: ['Ajustes aplicados', 'Aprovação final formalizada'] },
        ]
      },
      {
        name: 'Fase 3: Desenvolvimento e Integrações',
        order: 3,
        tasks: [
          { title: 'Desenvolvimento responsivo e animações', estimatedDays: 6, checklist: ['Implementação do código', 'Formulários testados', 'Responsividade conferida em 3 telas'] },
          { title: 'Otimização de velocidade e SEO on-page', estimatedDays: 2, checklist: ['PageSpeed > 90', 'OpenGraph e Schema aplicados'] },
        ]
      },
      {
        name: 'Fase 4: Publicação e Entrega',
        order: 4,
        tasks: [
          { title: 'Apontamento de DNS e certificado SSL', estimatedDays: 1, checklist: ['DNS propagado', 'HTTPS ativo'] },
          { title: 'Homologação final e gravação de vídeo de instrução', estimatedDays: 2, checklist: ['Vídeo enviado', 'Termo de aceite assinado'] },
        ]
      }
    ]
  },
  {
    id: 'prod_gmn_seo_local',
    name: 'Gestão & Otimização Google Meu Negócio (GBP) + SEO Local',
    category: 'Google Meu Negocio',
    shortDescription: 'Coloque a empresa no topo do Google Maps quando clientes locais procurarem pelos seus serviços.',
    fullDescription: 'Otimização completa da ficha no Google Maps, geolocalização de imagens, enriquecimento de categorias, produtos, postagens semanais, estratégia de avaliações 5 estrelas e relatório mensal de chamadas e rotas.',
    status: 'ativo',
    targetAudience: 'Negócios com atendimento local ou regional (clínicas, restaurantes, lojas, mecânicas, advogados).',
    recommendedNiched: ['Clínicas & Médicos', 'Restaurantes', 'Comércio Local', 'Academias', 'Prestadores de Serviços'],
    problemSolved: 'Ficha invisível ou mal pontuada que não atrai chamadas telefônicas ou rotas de clientes próximos.',
    benefits: [
      'Apareça no "Local Pack" (3 primeiros no mapa)',
      'Aumento imediato em ligações e pedidos de rota',
      'Gestão ativa de avaliações e reputação',
      'Relatórios mensais transparentes de performance'
    ],
    priceBRL: 1450,
    priceUSD: 450,
    billingType: 'recorrente',
    defaultCurrency: 'BRL',
    estimatedDaysMin: 7,
    estimatedDaysMax: 10,
    responsibleName: 'Lucas Lima',
    salesCount: 0,
    totalRevenueBRL: 0,
    totalRevenueUSD: 0,
    components: [
      { id: 'comp_g1', name: 'Auditoria e Diagnóstico GBP', description: 'Análise de concorrentes e posicionamento atual de palavras-chave', order: 1, isRequired: true, estimatedHours: 4 },
      { id: 'comp_g2', name: 'Otimização Estrutural da Ficha', description: 'Categorias principais/secundárias, catálogo de produtos, bio SEO', order: 2, isRequired: true, estimatedHours: 8 },
      { id: 'comp_g3', name: 'Estratégia de Avaliações e QR Code', description: 'Sistema de incentivo e resposta profissional de reviews', order: 3, isRequired: true, estimatedHours: 3 },
      { id: 'comp_g4', name: 'Postagens Semanais e Fotos Geo-marcadas', description: 'Manutenção da relevância algorítmica com conteúdo semanal', order: 4, isRequired: true, estimatedHours: 8 },
    ],
    projectTemplatePhases: [
      {
        name: 'Mês 1: Setup & Otimização Profunda',
        order: 1,
        tasks: [
          { title: 'Reivindicação de acesso e auditoria completa', estimatedDays: 2, checklist: ['Acesso concedido', 'Auditoria salva'] },
          { title: 'Otimização de dados essenciais (NAP, Horários, Categorias)', estimatedDays: 2, checklist: ['Nome padronizado', 'Categorias exatas', 'Serviços cadastrados'] },
          { title: 'Upload de lote de fotos geolocalizadas', estimatedDays: 3, checklist: ['15 fotos com metadados EXIF', 'Fotos de equipe e ambiente'] },
          { title: 'Criação de link de avaliação rápida com QR Code', estimatedDays: 1, checklist: ['Material enviado ao cliente'] },
        ]
      },
      {
        name: 'Rotina Recorrente Mensal',
        order: 2,
        tasks: [
          { title: 'Publicação de 4 posts promocionais no perfil', estimatedDays: 7, checklist: ['Post semana 1', 'Post semana 2', 'Post semana 3', 'Post semana 4'] },
          { title: 'Resposta a todas as avaliações recebidas', estimatedDays: 14, checklist: ['Monitoramento ativo de reviews'] },
          { title: 'Emissão e apresentação do relatório mensal', estimatedDays: 28, checklist: ['Métricas de rotas e chamadas', 'Evolução no ranking local'] },
        ]
      }
    ]
  },
  {
    id: 'prod_secretaria_ia',
    name: 'Secretária Virtual com Inteligência Artificial',
    category: 'Inteligencia Artificial',
    shortDescription: 'Atendimento e agendamento 24/7 no WhatsApp que nunca deixa um lead esperando.',
    fullDescription: 'Agente de IA customizado para responder dúvidas sobre serviços, qualificar o orçamento, coletar dados do lead e realizar agendamentos diretamente na agenda da empresa, funcionando 24 horas por dia com linguagem humanizada.',
    status: 'ativo',
    targetAudience: 'Clínicas, consultórios, imobiliárias, empresas de serviços com alto volume de mensagens no WhatsApp.',
    recommendedNiched: ['Clínicas Médicas e Dentárias', 'Imobiliárias', 'Estética', 'Escolas e Cursos'],
    problemSolved: 'Leads que entram à noite ou fins de semana e esfriam antes de o atendente responder.',
    benefits: [
      'Resposta em menos de 10 segundos 24/7',
      'Agendamento autônomo sincronizado com Google Calendar',
      'Transição suave para atendente humano quando necessário',
      'Qualificação prévia de orçamento'
    ],
    priceBRL: 2900,
    priceUSD: 850,
    billingType: 'hibrido',
    defaultCurrency: 'BRL',
    estimatedDaysMin: 10,
    estimatedDaysMax: 15,
    responsibleName: 'Felipe Martins',
    salesCount: 0,
    totalRevenueBRL: 0,
    totalRevenueUSD: 0,
    components: [
      { id: 'comp_ia1', name: 'Mapeamento de Fluxos e FAQ da Empresa', description: 'Levantamento de dúvidas frequentes, serviços, preços e tom de voz', order: 1, isRequired: true, estimatedHours: 6 },
      { id: 'comp_ia2', name: 'Configuração do Modelo de IA e Prompt Base', description: 'Criação do System Prompt com regras restritas e persona corporativa', order: 2, isRequired: true, estimatedHours: 10 },
      { id: 'comp_ia3', name: 'Integração com API WhatsApp & Agenda', description: 'Conexão segura com número oficial e Google Calendar', order: 3, isRequired: true, estimatedHours: 12 },
      { id: 'comp_ia4', name: 'Bateria de Testes e Ajustes Finos', description: 'Simulação de 50+ cenários de clientes e validação com o cliente', order: 4, isRequired: true, estimatedHours: 8 },
    ],
    projectTemplatePhases: [
      {
        name: 'Fase 1: Base de Conhecimento e Persona',
        order: 1,
        tasks: [
          { title: 'Coleta da planilha de perguntas frequentes e preços', estimatedDays: 3, checklist: ['Material recebido', 'Dúvidas validadas'] },
          { title: 'Elaboração do roteiro de atendimento e tom de voz', estimatedDays: 3, checklist: ['Roteiro aprovado'] },
        ]
      },
      {
        name: 'Fase 2: Integração e Testes Internos',
        order: 2,
        tasks: [
          { title: 'Conexão da linha de WhatsApp e webhook', estimatedDays: 2, checklist: ['QR Code conectado', 'Webhook respondendo'] },
          { title: 'Testes de agendamento automático', estimatedDays: 3, checklist: ['Horário bloqueado na agenda', 'Notificação enviada'] },
        ]
      },
      {
        name: 'Fase 3: Piloto e Entrada em Operação',
        order: 3,
        tasks: [
          { title: 'Acompanhamento do primeiro dia com tráfego real', estimatedDays: 1, checklist: ['Logs de conversas monitorados', 'Intervenção humana ajustada'] },
          { title: 'Treinamento da equipe do cliente', estimatedDays: 1, checklist: ['Sessão de treinamento gravada'] },
        ]
      }
    ]
  },
  {
    id: 'prod_trafego_pago',
    name: 'Gestão de Tráfego Pago (Google Ads & Meta Ads)',
    category: 'Trafego Pago',
    shortDescription: 'Campanhas de busca e redes sociais focadas em geração direta de leads qualificados.',
    fullDescription: 'Estratégia completa de anúncios pagos no Google Pesquisa (fundo de funil com alta intenção de compra) e Meta Ads (Instagram/Facebook para remarketing e público alvo local), com criativos, landing page de alta conversão e otimização semanal de ROAS.',
    status: 'ativo',
    targetAudience: 'Empresas que já têm capacidade de atendimento e precisam de fluxo constante de orçamentos.',
    recommendedNiched: ['Serviços Especializados', 'E-commerce Local', 'Saúde & Estética', 'B2B'],
    problemSolved: 'Dependência de indicações esporádicas e falta de previsibilidade de novos clientes.',
    benefits: [
      'Volume previsível de novos contatos semanais',
      'Segmentação cirúrgica por raio de km e intenção de busca',
      'Painel de controle com custo por lead (CPL)',
      'Otimização contínua do orçamento'
    ],
    priceBRL: 1800,
    priceUSD: 600,
    billingType: 'recorrente',
    defaultCurrency: 'BRL',
    estimatedDaysMin: 7,
    estimatedDaysMax: 10,
    responsibleName: 'Bruno Ribeiro',
    salesCount: 0,
    totalRevenueBRL: 0,
    totalRevenueUSD: 0,
    components: [
      { id: 'comp_tp1', name: 'Planejamento de Palavras-Chave e Concorrentes', description: 'Pesquisa profunda de termos com alta intenção de contratação', order: 1, isRequired: true, estimatedHours: 5 },
      { id: 'comp_tp2', name: 'Criação de Anúncios e Copywriting', description: 'Textos de anúncios, extensões de chamada e criativos', order: 2, isRequired: true, estimatedHours: 8 },
      { id: 'comp_tp3', name: 'Configuração de Conversões no GA4 e Pixel', description: 'Rastreamento exato de cliques no WhatsApp e envio de formulários', order: 3, isRequired: true, estimatedHours: 6 },
    ],
    projectTemplatePhases: [
      {
        name: 'Fase 1: Setup Técnico e Campanhas',
        order: 1,
        tasks: [
          { title: 'Conexão de contas de anúncios e faturamento', estimatedDays: 1, checklist: ['Contas vinculadas', 'Forma de pagamento ativa'] },
          { title: 'Instalação e teste de tags de conversão', estimatedDays: 2, checklist: ['Tag do Google verificada', 'Pixel testado'] },
          { title: 'Criação de campanhas de pesquisa e extensões', estimatedDays: 3, checklist: ['3 grupos de anúncios criados', 'Extensões de chamada ativas'] },
        ]
      },
      {
        name: 'Fase 2: Gestão Semanal e Otimização de Custo',
        order: 2,
        tasks: [
          { title: 'Negativação de termos irrelevantes (limpeza de verba)', estimatedDays: 7, checklist: ['Termos negativos adicionados'] },
          { title: 'Ajustes de lances e testes A/B de anúncios', estimatedDays: 14, checklist: ['Anúncios com melhor CTR mantidos'] },
        ]
      }
    ]
  }
];

// Dados iniciais limpos e reais (sem dados fictícios)
export const INITIAL_LEADS: Lead[] = [];
export const INITIAL_CLIENTS: Client[] = [];
export const INITIAL_PROJECTS: Project[] = [];
export const INITIAL_TRANSACTIONS: FinancialTransaction[] = [];
export const INITIAL_RECURRING: RecurringContract[] = [];
export const INITIAL_TEAM: TeamMember[] = [];
