import { getAssetCurrentValue } from '@/application/useCases/assets/get'
import { updateAsset } from '@/application/useCases/assets/update'
import { createTransaction } from '@/lib/supabase/data-services/transactions'

export async function transferBetweenAssets({
  fromAssetId,
  toAssetId,
  amount,
  description,
  date,
  userId,
}: {
  fromAssetId: string
  toAssetId: string
  amount: number
  description: string
  date: Date
  userId: string
}) {
  // 1. Create the transfer transaction
  await createTransaction({
    type: 'transfer',
    amount,
    from_asset_id: fromAssetId,
    to_asset_id: toAssetId,
    description,
    date,
    user_id: userId,
  })

  // 2. Update asset balances
  const fromAsset = await getAssetCurrentValue(fromAssetId)
  const toAsset = await getAssetCurrentValue(toAssetId)
  await updateAsset(fromAssetId, { value: Number(fromAsset.value) - amount })
  await updateAsset(toAssetId, { value: Number(toAsset.value) + amount })
} 