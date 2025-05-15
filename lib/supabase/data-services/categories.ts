import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Transaction } from "@/lib/supabase/data-services/transactions"

export interface Category {
  id: string
  name: string
  type: "income" | "expense"
  icon: string
  color: string
  user_id: string
}

const supabase = getSupabaseBrowserClient()

/**
 * Fetches all categories from Supabase for a given type.
 *
 * @param {string} transactionType - The type of transactions to fetch.
 * @returns {Promise<Category[]>} The categories data.
 * @throws Will throw an error if the Supabase query fails.
 */
export async function fetchCategories(
  transactionType: "income" | "expense"
): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("type", transactionType)
    .order("name")
    .returns<Category[]>()

  if (error) throw error
  return data as unknown as Category[]
}

/**
 * Creates a new category in the database.
 * 
 * @param body - The data to create the category with.
 */
export async function createCategory(
  body: Omit<Category, "id">
): Promise<void> {
  const { error } = await supabase
    .from("categories")
    .insert(body)
  if (error) throw error
}

/**
 * Updates an category in the database.
 * 
 * @param id - The ID of the category to update.
 * @param data - The data to update the category with.
 */
export async function updateCategory(
  id: string, body: Pick<Category, "name" | "icon" | "color">
): Promise<void> {
  const { error } = await supabase
    .from("categories")
    .update(body as Record<string, unknown>)
    .eq("id", id)

  if (error) {
    throw error
  }
}

/**
 * Deletes a category from the database.
 * 
 * @param id - The ID of the category to delete.
 */
export async function deleteCategory(id: string): Promise<void> {
  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", id)
  if (error) throw error
}