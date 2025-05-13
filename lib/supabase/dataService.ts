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

export interface Transaction {
  id: string
  amount: number
  type: "income" | "expense"
  description: string
  date: string
  category: Category
  asset: {
    id: string
    name: string
  }
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
