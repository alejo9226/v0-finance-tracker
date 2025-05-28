import React from 'react'

import { EntityListCard } from '@/components/dashboard/shared/EntityListCard'
import { Asset, CurrencyCode } from '@/lib/supabase/data-services/assets'
import { useI18n, useScopedI18n } from '@/locales/client'

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

  const t = useI18n()

  return (
    <EntityListCard
      entityType="asset"
      title={t('dashboard.balance-sheet.assets')}
      description={t('dashboard.balance-sheet.asset-explanation')}
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
