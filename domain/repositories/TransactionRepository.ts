export interface TransactionRepository {
  getTransactionsDescriptions(): Promise<string[]>
} 