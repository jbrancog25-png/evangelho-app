import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? ''

export const supabaseConfigurada = Boolean(supabaseUrl && supabaseAnonKey)

/**
 * Se as envs não estiverem definidas, usamos valores de placeholder para o cliente
 * conseguir ser instanciado — o App detecta `supabaseConfigurada=false` e mostra
 * a tela de configuração em vez de deixar o app crashar na inicialização.
 */
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
)
