import { transactionRepositoryImpl } from '@/domain/repositories/TransactionRepositoryImpl'

export async function getDescriptionSuggestions(): Promise<string[]> {
  return (await transactionRepositoryImpl.getTransactionsDescriptions()).filter(Boolean)
} 