import { getAssetCurrentValue } from '@/application/useCases/assets/get'
import { updateAsset } from '@/application/useCases/assets/update'
import { fetchLiabilityById, updateLiability } from '@/lib/supabase/data-services/liabilities'
import { updateTransaction, fetchTransactionById } from '@/lib/supabase/data-services/transactions'

/**
 * Updates a transaction and adjusts the affected asset or liability value(s).
 *
 * @param id - The transaction ID to update.
 * @param newData - The new transaction data (description, amount, date).
 * @returns Promise<void>
 */
export async function updateTransactionAndBalance(
  id: string,
  newData: { description: string; amount: number; date: Date }
): Promise<void> {
  // Fetch the previous transaction
  const prevTx = await fetchTransactionById(id)
  const prevAmount = Number(prevTx.amount)
  const prevAssetId = prevTx.asset?.id
  const prevLiabilityId = prevTx.liability?.id

  // Update the transaction
  await updateTransaction(id, newData)

  // If asset, update asset value
  if (prevAssetId) {
    const asset = await getAssetCurrentValue(prevAssetId)
    if (!asset) return
    // asset.value = asset.value - prevAmount + newData.amount
    const newValue = Number(asset.value) - prevAmount + newData.amount
    await updateAsset(prevAssetId, { value: newValue })
    return
  }

  // If liability, update liability value
  if (prevLiabilityId) {
    const liability = await fetchLiabilityById(prevLiabilityId)
    if (!liability) return
    // For liabilities, subtract the old amount and add the new one
    const newValue = Number(liability.value) - prevAmount + newData.amount
    await updateLiability(prevLiabilityId, { ...liability, value: newValue })
    return
  }
} 