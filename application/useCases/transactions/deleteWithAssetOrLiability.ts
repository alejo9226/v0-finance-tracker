import { getAssetCurrentValue } from '@/application/useCases/assets/get'
import { updateAsset } from '@/application/useCases/assets/update'
import { fetchLiabilityById, updateLiability } from '@/lib/supabase/data-services/liabilities'
import { deleteTransaction, fetchTransactionById } from '@/lib/supabase/data-services/transactions'

/**
 * Deletes a transaction and updates the associated asset or liability value accordingly.
 *
 * @param id - The transaction ID to delete.
 * @returns Promise<void>
 */
export async function deleteTransactionAndUpdateBalance(id: string): Promise<void> {
  // Fetch the transaction
  const tx = await fetchTransactionById(id)

  // Delete the transaction
  await deleteTransaction(id)

  // Update the associated asset or liability value
  if (tx.asset && tx.asset.id) {
    const asset = await getAssetCurrentValue(tx.asset.id)
    if (asset) {
      let newValue = asset.value
      if (tx.type === 'income') {
        newValue -= tx.amount // Remove the income
      } else if (tx.type === 'expense') {
        newValue += tx.amount // Add back the expense
      }
      await updateAsset(tx.asset.id, { value: newValue })
    }
  } else if (tx.liability && tx.liability.id) {
    const liability = await fetchLiabilityById(tx.liability.id)
    if (liability) {
      let newValue = liability.value
      if (tx.type === 'expense') {
        newValue -= tx.amount // Remove the expense from liability
      } else if (tx.type === 'income') {
        newValue += tx.amount // Add back the income
      }
      await updateLiability(liability.id, { ...liability, value: newValue })
    }
  }
} 