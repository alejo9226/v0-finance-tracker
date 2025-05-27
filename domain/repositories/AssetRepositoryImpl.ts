// Infrastructure layer
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { Asset } from '@/domain/entities/Asset'
import { AssetRepository } from '@/domain/repositories/AssetRepository'

const supabase = getSupabaseBrowserClient()

export const assetRepositoryImpl: AssetRepository = {
  /**
   * Fetches all assets from Supabase.
   *
   * @returns {Promise<Asset[]>} The assets data.
   * @throws Will throw an error if the Supabase query fails.
   */
  async fetchAssets(): Promise<Asset[]> {
    const { data, error } = await supabase.from('assets').select('*').order('name')

    if (error) throw error

    return data as unknown as Asset[]
  },

  /**
   * Fetches the current value of an asset from Supabase.
   *
   * @param id - The ID of the asset to fetch.
   * @returns {Promise<Asset>} The asset data.
   * @throws Will throw an error if the Supabase query fails.
   */
  async fetchAssetCurrentValue(id: string): Promise<Asset> {
    const { data, error } = await supabase.from('assets').select('value').eq('id', id).single()

    if (error) throw error

    return data as unknown as Asset
  },

  /**
   * Creates a new asset in the database.
   *
   * @param body - The data to create the asset with.
   */
  createAsset: async (body: Omit<Asset, 'id'>): Promise<void> => {
    const { error } = await supabase.from('assets').insert(body)

    if (error) throw error
  },

  /**
   * Creates multiple assets in the database.
   *
   * @param body[] - The data array to create the assets with.
   */
  createMultipleAssets: async (body: Omit<Asset, 'id' | 'currency'>[]): Promise<void> => {
    const { error } = await supabase.from('assets').insert(body)

    if (error) throw error
  },

  /**
   * Updates an asset in the database.
   *
   * @param id - The ID of the asset to update.
   * @param data - The data to update the asset with.
   */
  updateAsset: async (id: string, body: Partial<Omit<Asset, 'id' | 'user_id'>>): Promise<void> => {
    const { error } = await supabase.from('assets').update(body).eq('id', id)

    if (error) throw error
  },

  /**
   * Deletes an asset from the database.
   *
   * @param id - The ID of the asset to delete.
   */
  deleteAsset: async (id: string): Promise<void> => {
    const { error } = await supabase.from('assets').delete().eq('id', id)

    if (error) throw error
  },
}
