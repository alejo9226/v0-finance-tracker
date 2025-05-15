import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PencilIcon, PlusIcon, Trash2Icon } from "lucide-react"
import { Liability } from "@/lib/supabase/data-services/liabilities"
import { CurrencyCode } from "@/lib/supabase/data-services/assets"
import React from "react"
import { EntityListCard } from "@/components/dashboard/shared/EntityListCard"

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