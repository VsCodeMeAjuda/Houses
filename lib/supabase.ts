import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/**
 * Supabase browser client.
 *
 * This is a Next.js project, so environment variables exposed to the browser
 * MUST be prefixed with `NEXT_PUBLIC_`. Add your real values to a `.env` file
 * (see `.env.example`) — until then the app runs on local seed data.
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

let client: SupabaseClient | null = null

/**
 * Returns a singleton Supabase client, or `null` when the environment
 * variables are not configured yet. Callers should fall back to local data
 * when this returns `null`.
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null
  if (!client) {
    client = createClient(supabaseUrl as string, supabaseAnonKey as string, {
      auth: { persistSession: false },
    })
  }
  return client
}
