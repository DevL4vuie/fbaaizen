import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  // This only warns in the console — it won't crash the build.
  // Copy .env.example to .env and add your Supabase project keys.
  console.warn(
    '[Supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. ' +
    'Copy .env.example to .env and fill in your project keys.'
  )
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '')
