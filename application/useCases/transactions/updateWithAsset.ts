import { getAssetCurrentValue } from '@/application/useCases/assets/get'
import { updateAsset } from '@/application/useCases/assets/update'
import { updateTransaction, fetchTransactionById } from '@/lib/supabase/data-services/transactions'

/**
 * Updates a transaction and adjusts the affected asset value(s).
 *
 * @param id - The transaction ID to update.
 * @param newData - The new transaction data (description, amount, date).
 * @returns Promise<void>
 */
export async function updateTransactionAndAssetBalance(
  id: string,
  newData: { description: string; amount: number; date: Date }
): Promise<void> {
  // Fetch the previous transaction
  const prevTx = await fetchTransactionById(id)
  const prevAmount = Number(prevTx.amount)
  const prevAssetId = prevTx.asset?.id

  // Update the transaction
  await updateTransaction(id, newData)

  // If no asset, nothing to update
  if (!prevAssetId) return

  // Fetch the asset
  const asset = await getAssetCurrentValue(prevAssetId)
  if (!asset) return

  // Calculate the adjustment
  // asset.value = asset.value - prevAmount + newData.amount
  const newValue = Number(asset.value) - prevAmount + newData.amount
  await updateAsset(prevAssetId, { value: newValue })
} 