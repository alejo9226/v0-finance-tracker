import React from 'react'

import { EntityListCard } from '@/components/dashboard/shared/EntityListCard'
import { CurrencyCode } from '@/lib/supabase/data-services/assets'
import { Liability } from '@/lib/supabase/data-services/liabilities'
import { useI18n } from '@/locales/client'

type LiabilityListProps = {
  liabilities: Liability[]
  displayCurrency: CurrencyCode | ''
  formatCurrency: (amount: number, currency: CurrencyCode | '') => string
  convertCurrency: (amount: number, from: CurrencyCode, to: CurrencyCode | '') => number
  onAdd: () => void
  onEdit: (liability: Liability) => void
  onDelete: (id: string) => void
  getLiabilityIcon: (type: string) => React.ReactNode
}

export function LiabilityList({
  liabilities,
  displayCurrency,
  formatCurrency,
  convertCurrency,
  onAdd,
  onEdit,
  onDelete,
  getLiabilityIcon,
}: LiabilityListProps) {

  const t = useI18n()

  return (
    <EntityListCard
      entityType="liability"
      title={t('dashboard.balance-sheet.liabilities')}
      description={t('dashboard.balance-sheet.liability-explanation')}
      displayCurrency={displayCurrency}
      formatCurrency={formatCurrency}
      convertCurrency={convertCurrency}
      onAdd={onAdd}
      onEdit={onEdit}
      onDelete={onDelete}
      entities={liabilities}
      getEntityIcon={getLiabilityIcon}
    />
  )
}
