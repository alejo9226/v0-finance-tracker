import { Asset } from '@/domain/entities/Asset'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

const supabase = getSupabaseBrowserClient()

/**
 * Fetches all assets from Supabase.
 *
 * @returns {Promise<Asset[]>} The assets data.
 * @throws Will throw an error if the Supabase query fails.
 */
export async function fetchAssets(): Promise<Asset[]> {
  const { data, error } = await supabase.from('assets').select('*').order('name')
  if (error) throw error
  return data as unknown as Asset[]
}

/**
 * Fetches the current value of an asset from Supabase.
 *
 * @param id - The ID of the asset to fetch.
 * @returns {Promise<Asset>} The asset data.
 * @throws Will throw an error if the Supabase query fails.
 */
export async function fetchAssetCurrentValue(id: string): Promise<Asset> {
  const { data, error } = await supabase.from('assets').select('value').eq('id', id).single()

  if (error) throw error

  return data as unknown as Asset
}

/**
 * Creates a new asset in the database.
 *
 * @param body - The data to create the asset with.
 */
export async function createAsset(body: Omit<Asset, 'id'>): Promise<void> {
  const { error } = await supabase.from('assets').insert(body)
  if (error) throw error
}

/**
 * Creates multiple assets in the database.
 *
 * @param body[] - The data array to create the assets with.
 */
export async function createMultipleAssets(body: Omit<Asset, 'id' | 'currency'>[]): Promise<void> {
  const { error } = await supabase.from('assets').insert(body)

  if (error) throw error
}

/**
 * Deletes an asset from the database.
 *
 * @param id - The ID of the asset to delete.
 */
export async function deleteAsset(id: string): Promise<void> {
  const { error } = await supabase.from('assets').delete().eq('id', id)
  if (error) throw error
}
