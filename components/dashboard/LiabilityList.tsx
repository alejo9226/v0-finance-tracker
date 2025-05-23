import { PencilIcon, PlusIcon, Trash2Icon } from "lucide-react"
import React from "react"

import { EntityListCard } from "@/components/dashboard/shared/EntityListCard"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { CurrencyCode } from "@/lib/supabase/data-services/assets"
import { Liability } from "@/lib/supabase/data-services/liabilities"

type LiabilityListProps = {
  liabilities: Liability[]
  displayCurrency: CurrencyCode | ""
  formatCurrency: (amount: number, currency: CurrencyCode | "") => string
  convertCurrency: (amount: number, from: CurrencyCode, to: CurrencyCode | "") => number
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
  return (
    <EntityListCard
      entityType="liability"
      title="Liabilities"
      description="What you owe"
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