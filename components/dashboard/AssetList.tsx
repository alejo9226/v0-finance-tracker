import React from 'react'

import { EntityListCard } from '@/components/dashboard/shared/EntityListCard'
import { Asset, CurrencyCode } from '@/domain/entities/Asset'
import { useI18n } from '@/locales/client'
import { DollarSign, Wallet } from 'lucide-react'
import { Landmark } from 'lucide-react'

type AssetListProps = {
  assets: Asset[]
  displayCurrency: CurrencyCode | ''
  formatCurrency: (amount: number, currency: CurrencyCode | '') => string
  convertCurrency: (amount: number, from: CurrencyCode, to: CurrencyCode | '') => number
  onAdd: () => void
  onEdit: (asset: Asset) => void
  onDelete: (id: string) => void
}

export function AssetList({
  assets,
  displayCurrency,
  formatCurrency,
  convertCurrency,
  onAdd,
  onEdit,
  onDelete,
}: AssetListProps) {

  const t = useI18n()

  const getAssetIcon = (type: string) => {
    switch (type) {
      case "bank":
        return <Landmark className="h-5 w-5" />
      case "investment":
        return <DollarSign className="h-5 w-5" />
      case "cash":
        return <Wallet className="h-5 w-5" />
      default:
        return <DollarSign className="h-5 w-5" />
    }
  }

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
