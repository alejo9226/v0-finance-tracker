import { getSupabaseBrowserClient } from "@/lib/supabase/client";

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
export async function getProfileOnboardingStatus(id: string): Promise<Profile> {
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("is_onboarded")
    .eq("id", id)
    .single()

  if (error) throw error

  return profile as Profile
}

export async function updateProfileOnboardingStatus(
  id: string, is_onboarded: boolean
): Promise<void> {
  const { error } = await supabase
    .from("profiles")
    .update({ is_onboarded })
    .eq("id", id)

  if (error) throw error
}

