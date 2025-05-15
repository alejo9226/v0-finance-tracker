import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export const CURRENCIES = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "COP", symbol: "$", name: "Colombian Peso" },
  { code: "ARS", symbol: "$", name: "Argentine Peso" },
  { code: "BRL", symbol: "R$", name: "Brazilian Real" },
] as const

export type CurrencyCode = typeof CURRENCIES[number]["code"]

export interface Asset {
  id: string
  type: string
  name: string
  value: number
  currency: CurrencyCode
  user_id: string
}

const supabase = getSupabaseBrowserClient()

/**
 * Fetches all assets from Supabase.
 *
 * @returns {Promise<Asset[]>} The assets data.
 * @throws Will throw an error if the Supabase query fails.
 */
export async function fetchAssets(): Promise<Asset[]> {
  const { data, error } = await supabase
    .from("assets")
    .select("*")
    .order("name")
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
  const { data, error } = await supabase
    .from("assets")
    .select("value")
    .eq("id", id)
    .single()

  if (error) throw error

  return data as unknown as Asset
}

/**
 * Creates a new asset in the database.
 * 
 * @param body - The data to create the asset with.
 */
export async function createAsset(body: Omit<Asset, "id">): Promise<void> {
  const { error } = await supabase
    .from("assets")
    .insert(body)
  if (error) throw error
}

/**
 * Creates multiple assets in the database.
 * 
 * @param body[] - The data array to create the assets with.
 */
export async function createMultipleAssets(
  body: Omit<Asset, "id" | "currency">[]
): Promise<void> {
  const { error } = await supabase
    .from("assets")
    .insert(body)

  if (error) throw error
}

/**
 * Updates an asset in the database.
 * 
 * @param id - The ID of the asset to update.
 * @param data - The data to update the asset with.
 */
export async function updateAsset(id: string, body: Partial<Omit<Asset, 'id' | 'user_id'>>): Promise<void> {
  const { error } = await supabase
    .from("assets")
    .update(body)
    .eq("id", id)

  if (error) {
    throw error
  }
}

/**
 * Deletes an asset from the database.
 * 
 * @param id - The ID of the asset to delete.
 */
export async function deleteAsset(id: string): Promise<void> {
  const { error } = await supabase
    .from("assets")
    .delete()
    .eq("id", id)
  if (error) throw error
}
