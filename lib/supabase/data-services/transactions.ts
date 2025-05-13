import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Transaction } from "@/lib/supabase/data-services/transactions.types"

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