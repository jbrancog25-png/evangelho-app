import { createClient } from '@supabase/supabase-js'

/**
 * Cliente Supabase separado, sem persistência de sessão.
 * Usado quando o super_admin precisa criar outro usuário via signUp sem que
 * isso derrube a própria sessão (o cliente principal reagiria à nova sessão).
 */
const url = import.meta.env.VITE_SUPABASE_URL ?? 'https://placeholder.supabase.co'
const key = import.meta.env.VITE_SUPABASE_ANON_KEY ?? 'placeholder-anon-key'

export const supabaseEphemeral = createClient(url, key, {
  auth: {
    storageKey: 'evangelho-ephemeral',
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
})
