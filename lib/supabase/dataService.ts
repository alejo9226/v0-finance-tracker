import { getSupabaseBrowserClient } from "./client"

// Types should be imported or defined elsewhere in a real app
export type Asset = {
  id: string
  type: string
  name: string
  value: number
  currency: string
}

export type Liability = {
  id: string
  type: string
  name: string
  value: number
  currency: string
}

export type Transaction = {
  id: string
  amount: number
  type: "income" | "expense"
  description: string
  date: string
  category: {
    id: string
    name: string
    icon: string
    color: string
  }
  asset: {
    id: string
    name: string
  }
}

const supabase = getSupabaseBrowserClient()

export async function fetchAssets(userId: string): Promise<Asset[]> {
  const { data, error } = await supabase
    .from("assets")
    .select("*")
    .order("name")
    .eq("user_id", userId)
  if (error) throw error
  return data as Asset[]
}

export async function fetchLiabilities(userId: string): Promise<Liability[]> {
  const { data, error } = await supabase
    .from("liabilities")
    .select("*")
    .order("name")
    .eq("user_id", userId)
  if (error) throw error
  return data as Liability[]
}

export async function fetchTransactions(userId: string, type?: "income" | "expense"): Promise<Transaction[]> {
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
    .eq("user_id", userId)
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