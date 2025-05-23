import { Session, AuthError, User, AuthResponse } from '@supabase/supabase-js'

import { getSupabaseBrowserClient } from '@/lib/supabase/client'

const supabase = getSupabaseBrowserClient()

/**
 * Signs up a new user in the database.
 *
 * @param email - The email of the user to sign up.
 * @param password - The password of the user to sign up.
 * @param options - The options to sign up.
 */
export async function signUpWrapper(
  email: string,
  password: string,
  options: { data: { name: string } },
): Promise<AuthResponse> {
  return await supabase.auth.signUp({
    email,
    password,
    options,
  })
}

/**
 * Signs in a user with password.
 *
 * @param email - The email of the user to sign in.
 * @param password - The password of the user to sign in.
 */
export async function signInWithPasswordWrapper(
  email: string,
  password: string,
): Promise<{
  data: {
    user: User | null
    session: Session | null
  }
  error: AuthError | null
}> {
  return await supabase.auth.signInWithPassword({ email, password })
}

/**
 * Signs out a user.
 */
export async function signOutWrapper() {
  return supabase.auth.signOut()
}

/**
 * Gets the session of a user.
 */
export async function getSessionWrapper() {
  return supabase.auth.getSession()
}

/**
 * Listens for auth state changes.
 *
 * @param callback - The callback to listen for auth state changes.
 */
export function onAuthStateChangeWrapper(callback: (event: any, session: any) => void) {
  return supabase.auth.onAuthStateChange(callback)
}

/**
 * Tests connectivity to Supabase.
 */
export async function testConnectivityToSupabase() {
  return await supabase.from('profiles').select('count').limit(1)
}
