import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL as string
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string

export const getSupabaseServerClient = () => {
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
