import { Transaction } from "@/lib/supabase/data-services/transactions.types"
import { getSupabaseBrowserClient } from "./client"

// Types should be imported or defined elsewhere in a real app
export interface Asset {
  id: string
  type: string
  name: string
  value: number
  currency: string
}

export interface Liability {
  id: string
  type: string
  name: string
  value: number
  currency: string
}

export interface Category {
  id: string
  name: string
  type: "income" | "expense"
  icon: string
  color: string
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
 * Fetches all liabilities from Supabase.
 *
 * @returns {Promise<Liability[]>} The liabilities data.
 * @throws Will throw an error if the Supabase query fails.
 */
export async function fetchLiabilities(): Promise<Liability[]> {
  const { data, error } = await supabase
    .from("liabilities")
    .select("*")
    .order("name")
  if (error) throw error
  return data as unknown as Liability[]
}

/**
 * Fetches all categories from Supabase for a given type.
 *
 * @param {string} transactionType - The type of transactions to fetch.
 * @returns {Promise<Transaction["category"][]>} The categories data.
 * @throws Will throw an error if the Supabase query fails.
 */
export async function fetchCategories(transactionType: "income" | "expense"): Promise<Transaction["category"][]> {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("type", transactionType)
    .order("name")
  if (error) throw error
  return data as unknown as Transaction["category"][]
}

