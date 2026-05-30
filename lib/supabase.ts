import { createClient, SupabaseClient } from '@supabase/supabase-js'

let _supabase: SupabaseClient | null = null
let _supabaseAdmin: SupabaseClient | null = null

export function getSupabaseClient() {
  if (!_supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !key) {
      throw new Error('Missing Supabase environment variables')
    }
    _supabase = createClient(url, key)
  }
  return _supabase
}

export function getSupabaseAdmin() {
  if (!_supabaseAdmin) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !key) {
      throw new Error('Missing Supabase environment variables')
    }
    _supabaseAdmin = createClient(url, key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  }
  return _supabaseAdmin
}

// For backward compatibility - but these require env vars at import time
// Use getSupabaseClient() and getSupabaseAdmin() instead
export const supabase = {
  get auth() { return getSupabaseClient().auth },
  from: (table: string) => getSupabaseClient().from(table),
  rpc: (fn: string, args?: Record<string, unknown>) => getSupabaseClient().rpc(fn, args),
  storage: { from: (bucket: string) => getSupabaseClient().storage.from(bucket) },
}

export const supabaseAdmin = {
  get auth() { return getSupabaseAdmin().auth },
  from: (table: string) => getSupabaseAdmin().from(table),
  rpc: (fn: string, args?: Record<string, unknown>) => getSupabaseAdmin().rpc(fn, args),
}
