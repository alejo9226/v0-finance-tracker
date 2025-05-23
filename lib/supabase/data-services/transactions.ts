import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Asset } from "@/lib/supabase/data-services/assets"
import { Category } from "@/lib/supabase/data-services/categories"
export interface Transaction {
  id: string
  amount: number
  type: "income" | "expense"
  description: string
  date: Date
  category: Omit<Category, 'type' | 'user_id'>
  asset: Pick<Asset, 'id' | 'name'>
}

const supabase = getSupabaseBrowserClient()

/**
 * Fetches all transactions from Supabase for a given type.
 * Supabase returns all transactions for a specific user, 
 * so we need to filter by type.
 *
 * @param {string} type - The type of transactions to fetch.
 * @returns {Promise<Transaction[]>} The transactions data.
 * @throws Will throw an error if the Supabase query fails.
 */
export async function fetchTransactions(type?: "income" | "expense"): Promise<Transaction[]> {
  let query = supabase
    .from("transactions")
    .select(`
      id,
      amount,
      type,
      description,
      date,
      category:category_id(id, name, icon, color),
      asset:asset_id(id, name)
    `)
    .order("date", { ascending: false })

  if (type) {
    query = query.eq("type", type)
  }

  const { data, error } = await query
  if (error) throw error

  // Transform to ensure category and asset always have the required shape
  return (data || []).map((t: any) => ({
    id: t.id,
    amount: Number(t.amount),
    type: t.type as "income" | "expense",
    description: t.description || "",
    date: t.date,
    category: t.category || {
      id: "uncategorized",
      name: "Uncategorized",
      icon: t.type === "income" ? "💰" : "💸",
      color: "#64748b"
    },
    asset: t.asset || {
      id: "no-account",
      name: "No account"
    }
  }))
}

/**
 * Fetches a transaction by its ID.
 *
 * @param {string} id - The ID of the transaction.
 * @returns {Promise<Transaction>} The transaction data.
 * @throws Will throw an error if the Supabase query fails.
 */
export async function fetchTransactionById(id: string): Promise<Transaction> {
  const { data, error } = await supabase
    .from("transactions")
    .select(`
      id,
      amount,
      type,
      description,
      date,
      category:category_id(id, name, icon, color),
      asset:asset_id(id, name)
    `)
    .eq("id", id)
    .single()
  if (error) throw error
  return data as unknown as Transaction
}

/**
 * Fetches the count of transactions for a given category.
 *
 * @param {string} categoryId - The ID of the category.
 * @returns {Promise<number>} The count of transactions.
 * @throws Will throw an error if the Supabase query fails.
 */
export async function fetchCountTransactionsByCategory(categoryId: string): Promise<number> {
  const { count, error } = await supabase
    .from("transactions")
    .select("id", { count: "exact" })
    .eq("category_id", categoryId)
  if (error) throw error
  return count || 0
}

export async function createTransaction(
  transaction: Omit<Transaction, 'id' | 'category' | 'asset'> & {
    category_id: string
    asset_id: string
    user_id: string
  }
): Promise<void> {
  const { error: transactionError } = await supabase
    .from("transactions")
    .insert(transaction)
    .select()

  if (transactionError) throw transactionError
}

/**
 * Updates a transaction in the database.
 * 
 * @param id - The ID of the transaction to update.
 * @param transaction - The data to update the transaction with.
 */
export async function updateTransaction(
  id: string, 
  transaction: Pick<
    Transaction, 
    'description' | 
    'amount' | 
    'date'
    // category_id: Uncomment if you add category selection
  >
): Promise<void> {
  const { error } = await supabase
    .from("transactions")
    .update(transaction)
    .eq("id", id)
  if (error) throw error
}

/**
 * Removes a category from all transactions that belong to
 * a specific category in the database.
 * 
 * @param transactionsCategoryId - The ID of the category to remove from transactions.
 */
export async function removeCategoryFromTransactions(
  transactionsCategoryId: string, 
): Promise<void> {
  const { error } = await supabase
    .from("transactions")
    .update({ category_id: null })
    .eq("category_id", transactionsCategoryId)
  if (error) throw error
}

/**
 * Deletes a transaction from the database.
 * 
 * @param id - The ID of the transaction to delete.
 */
export async function deleteTransaction(id: string): Promise<void> {
  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", id)
  if (error) throw error
}