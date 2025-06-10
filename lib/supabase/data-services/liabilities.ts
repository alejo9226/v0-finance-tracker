import { CurrencyCode } from '@/domain/entities/Asset'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

export interface Liability {
  id: string
  type: string
  name: string
  value: number
  currency: CurrencyCode
  user_id: string
}

const supabase = getSupabaseBrowserClient()

/**
 * Fetches all liabilities from Supabase.
 *
 * @returns {Promise<Liability[]>} The liabilities data.
 * @throws Will throw an error if the Supabase query fails.
 */
export async function fetchLiabilities(): Promise<Liability[]> {
  const { data, error } = await supabase.from('liabilities').select('*').order('name')
  if (error) throw error
  return data as unknown as Liability[]
}

/**
 * Creates a new liability in the database.
 *
 * @param body - The data to create the liability with.
 */
export async function createLiability(body: Omit<Liability, 'id'>): Promise<void> {
  const { error } = await supabase.from('liabilities').insert(body)
  if (error) throw error
}

/**
 * Creates multiple liabilities in the database.
 *
 * @param body[] - The data array to create the liabilities with.
 */
export async function createMultipleLiabilities(
  body: Omit<Liability, 'id' | 'currency'>[],
): Promise<void> {
  const { error } = await supabase.from('liabilities').insert(body)

  if (error) throw error
}

/**
 * Updates an liability in the database.
 *
 * @param id - The ID of the liability to update.
 * @param data - The data to update the liability with.
 */
export async function updateLiability(
  id: string,
  body: Omit<Liability, 'id' | 'user_id'>,
): Promise<void> {
  const { error } = await supabase
    .from('liabilities')
    .update(body as Record<string, unknown>)
    .eq('id', id)

  if (error) {
    throw error
  }
}

/**
 * Deletes a liability from the database.
 *
 * @param id - The ID of the liability to delete.
 */
export async function deleteLiability(id: string): Promise<void> {
  const { error } = await supabase.from('liabilities').delete().eq('id', id)
  if (error) throw error
}

/**
 * Fetches a single liability by ID from Supabase.
 *
 * @param id - The ID of the liability to fetch.
 * @returns {Promise<Liability>} The liability data.
 * @throws Will throw an error if the Supabase query fails or no liability is found.
 */
export async function fetchLiabilityById(id: string): Promise<Liability> {
  const { data, error } = await supabase.from('liabilities').select('*').eq('id', id).single()
  if (error) throw error
  return data as unknown as Liability
}
