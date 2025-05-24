import React from 'react'

import { EntityListCard } from '@/components/dashboard/shared/EntityListCard'
import { Asset, CurrencyCode } from '@/lib/supabase/data-services/assets'

type AssetListProps = {
  assets: Asset[]
  displayCurrency: CurrencyCode | ''
  formatCurrency: (amount: number, currency: CurrencyCode | '') => string
  convertCurrency: (amount: number, from: CurrencyCode, to: CurrencyCode | '') => number
  onAdd: () => void
  onEdit: (asset: Asset) => void
  onDelete: (id: string) => void
  getAssetIcon: (type: string) => React.ReactNode
}

export function AssetList({
  assets,
  displayCurrency,
  formatCurrency,
  convertCurrency,
  onAdd,
  onEdit,
  onDelete,
  getAssetIcon,
}: AssetListProps) {
  return (
    <EntityListCard
      entityType="asset"
      title="Assets"
      description="What you own"
      displayCurrency={displayCurrency}
      formatCurrency={formatCurrency}
      convertCurrency={convertCurrency}
      onAdd={onAdd}
      onEdit={(entity) => {
        if ('type' in entity) {
          // Type guard to ensure it's an Asset
          onEdit(entity as Asset)
        }
      }}
      onDelete={onDelete}
      entities={assets}
      getEntityIcon={getAssetIcon}
    />
  )
}
