import { getAssetCurrentValue } from '@/application/useCases/assets/get'
import { updateAsset } from '@/application/useCases/assets/update'
import { createTransaction } from '@/lib/supabase/data-services/transactions'

export async function transferBetweenAssets({
  fromAssetId,
  toAssetId,
  fromAmount,
  toAmount,
  exchangeRate,
  fee,
  description,
  date,
  userId,
}: {
  fromAssetId: string
  toAssetId: string
  fromAmount: number
  toAmount: number
  exchangeRate: number
  fee?: number
  description: string
  date: Date
  userId: string
}) {
  // 1. Create the transfer transaction
  await createTransaction({
    type: 'transfer',
    amount: fromAmount,
    destination_amount: toAmount,
    exchange_rate: exchangeRate,
    from_asset_id: fromAssetId,
    to_asset_id: toAssetId,
    description,
    date,
    user_id: userId,
  })

  // 2. Update asset balances
  const fromAsset = await getAssetCurrentValue(fromAssetId)
  const toAsset = await getAssetCurrentValue(toAssetId)
  await updateAsset(fromAssetId, { value: Number(fromAsset.value) - fromAmount - (fee || 0) })
  await updateAsset(toAssetId, { value: Number(toAsset.value) + toAmount })

  // 3. If there is a fee/spread, create a financial cost transaction
  // if (fee && fee > 0) {
  //   await createTransaction({
  //     type: 'expense',
  //     amount: fee,
  //     asset_id: fromAssetId,
  //     category_id: FINANCIAL_COSTS_CATEGORY_ID, // Ensure this exists in your categories
  //     description: 'Transfer fee/spread',
  //     date,
  //     user_id: userId,
  //   })
  // }
} 