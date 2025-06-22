import { TransactionRepository } from '@/domain/repositories/TransactionRepository'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'


const supabase = getSupabaseBrowserClient()

export const transactionRepositoryImpl: TransactionRepository = {
  /**
   * Fetches the description of the last 100 transactions.
   *
   * @returns {Promise<string[]>} The description of the last 100 transactions.
   * @throws Will throw an error if the Supabase query fails.
   */
  async getTransactionsDescriptions(): Promise<string[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select('description')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error || !data) return []

    return data.map((tx) => tx.description as string)
  }
} 