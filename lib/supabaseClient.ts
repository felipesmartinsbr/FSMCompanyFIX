import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Cache do cliente singleton
let supabaseInstance: SupabaseClient | null = null;

/**
 * Verifica se as variáveis de ambiente do Supabase estão devidamente informadas
 */
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return !!(
    url &&
    anonKey &&
    url.trim() !== '' &&
    anonKey.trim() !== '' &&
    !url.includes('YOUR_') &&
    !anonKey.includes('YOUR_')
  );
}

/**
 * Retorna o cliente Supabase inicializado ou nulo caso não esteja configurado
 */
export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }

  if (!supabaseInstance) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    const isBrowser = typeof window !== 'undefined';
    supabaseInstance = createClient(url, anonKey, {
      auth: {
        persistSession: isBrowser,
        autoRefreshToken: isBrowser,
      },
      global: {
        fetch: (...args) => fetch(...args),
      },
    });
  }

  return supabaseInstance;
}

/**
 * Testa a conexão ativa com o Supabase realizando uma query simples na tabela company_settings ou lead_stages
 */
export async function testSupabaseConnection(): Promise<{
  success: boolean;
  message: string;
  url?: string;
  tablesCount?: number;
}> {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      message: 'As variáveis NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY não estão configuradas.',
    };
  }

  try {
    const client = getSupabase();
    if (!client) {
      return { success: false, message: 'Não foi possível instanciar o cliente Supabase.' };
    }

    const { data, error } = await client.from('company_settings').select('id, company_name').limit(1);

    if (error) {
      // Se a tabela company_settings não foi criada ainda
      if (error.code === '42P01') {
        return {
          success: false,
          message: 'Conectado ao Supabase, mas o Schema SQL ainda não foi executado! Execute o arquivo supabase/schema.sql no SQL Editor.',
          url: process.env.NEXT_PUBLIC_SUPABASE_URL,
        };
      }
      return {
        success: false,
        message: `Erro ao conectar: ${error.message} (Código: ${error.code || 'desconhecido'})`,
        url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      };
    }

    return {
      success: true,
      message: 'Conexão com Supabase estabelecida com sucesso! Tabelas verificadas e prontas para operação.',
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      tablesCount: data ? 1 : 0,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Falha na conexão: ${err?.message || 'Erro de rede ou URL inválida'}`,
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    };
  }
}
