import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { PostgrestSingleResponse } from "@supabase/supabase-js";

export interface Profile {
  id: string
  is_onboarded: boolean
}

const supabase = getSupabaseBrowserClient()

/**
 * Fetches the onboarding status of a user from the database.
 * 
 * @param id - The ID of the user to fetch the onboarding status for.
 * @returns {Promise<boolean>} The onboarding status of the user.
 */
export async function getProfileOnboardingStatus(
  id: string
): Promise<{
  data: { is_onboarded: boolean } | null
  error: unknown
}> {
  return await supabase
    .from("profiles")
    .select("is_onboarded")
    .eq("id", id)
    .single()
}

/**
 * Creates a new profile in the database.
 * 
 * @param id - The ID of the user to create the profile for.
 * @param name - The name of the user to create the profile for.
 */
export async function createProfile(
  id: string, 
  name: string
): Promise<{ error: unknown }> {
  const { error } = await supabase
    .from("profiles")
    .insert([{ id, name, is_onboarded: false }])

  return { error }
}

/**
 * Updates the onboarding status of a user in the database.
 * 
 * @param id - The ID of the user to update the onboarding status for.
 * @param is_onboarded - The new onboarding status of the user.
 */
export async function updateProfileOnboardingStatus(
  id: string, 
  is_onboarded: boolean
): Promise<void> {
  const { error } = await supabase
    .from("profiles")
    .update({ is_onboarded })
    .eq("id", id)

  if (error) throw error
}

