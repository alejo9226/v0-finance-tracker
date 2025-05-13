import { Category } from "@/lib/supabase/dataService"

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