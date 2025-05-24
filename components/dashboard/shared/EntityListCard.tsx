import { PencilIcon, PlusIcon, Trash2Icon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CurrencyCode } from '@/lib/supabase/data-services/assets'
import { Asset } from '@/lib/supabase/data-services/assets'
import { Liability } from '@/lib/supabase/data-services/liabilities'

export function EntityListCard({
  entityType,
  title,
  description,
  displayCurrency,
  formatCurrency,
  convertCurrency,
  onAdd,
  onEdit,
  onDelete,
  entities,
  getEntityIcon,
}: {
  entityType: 'asset' | 'liability'
  title: string
  description: string
  displayCurrency: CurrencyCode | ''
  formatCurrency: (amount: number, currency: CurrencyCode | '') => string
  convertCurrency: (amount: number, from: CurrencyCode, to: CurrencyCode | '') => number
  onAdd: () => void
  onEdit: (entity: Asset | Liability) => void
  onDelete: (id: string) => void
  entities: Asset[] | Liability[]
  getEntityIcon: (entityType: 'asset' | 'liability') => React.ReactNode
}) {
  return (
    <Card>
      <CardHeader className="relative group">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl sm:text-2xl">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <div className="block sm:hidden group-hover:block transition-opacity">
            <Button variant="ghost" size="icon" onClick={onAdd}>
              <PlusIcon className="h-4 w-4" />
              <span className="sr-only">Add {entityType}</span>
            </Button>
          </div>
        </div>
        {displayCurrency && (
          <p className="text-sm text-muted-foreground mt-1">Showing values in {displayCurrency}</p>
        )}
      </CardHeader>
      <CardContent>
        {entities.length > 0 ? (
          <div className="space-y-4">
            {entities.map((entity) => (
              <div
                key={entity.id}
                className="flex items-center justify-between p-3 sm:p-4 rounded-lg border group hover:bg-accent hover:text-accent-foreground"
              >
                <div className="flex items-center sm:gap-3 gap-2">
                  <div
                    className={`flex h-7 w-7 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-${entityType === 'asset' ? 'green' : 'amber'}-100 text-${entityType === 'asset' ? 'green' : 'amber'}-600`}
                  >
                    {getEntityIcon(entityType)}
                  </div>
                  <div>
                    <p className="text-sm sm:text-md font-medium whitespace-nowrap text-ellipsis sm:text-ellipsis-none overflow-hidden w-36 sm:w-48">
                      {entity.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {entity.type.charAt(0).toUpperCase() + entity.type.slice(1)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <p className="text-sm sm:text-md font-medium whitespace-nowrap transition-transform sm:group-hover:-translate-x-1">
                    {displayCurrency
                      ? formatCurrency(
                          convertCurrency(
                            Number(entity.value),
                            entity.currency as CurrencyCode,
                            displayCurrency,
                          ),
                          displayCurrency,
                        )
                      : formatCurrency(Number(entity.value), entity.currency as CurrencyCode)}
                  </p>
                  <div
                    className={`flex flex-col sm:flex-row sm:hidden sm:group-hover:flex ml-2 transition-all duration-200 ${entityType === 'asset' ? 'sm:flex' : 'sm:hidden'}`}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="sm:h-8 sm:w-8 h-6 w-6"
                      onClick={() => onEdit(entity)}
                    >
                      <PencilIcon className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="sm:h-8 sm:w-8 h-6 w-6 text-red-600"
                      onClick={() => onDelete(entity.id)}
                    >
                      <Trash2Icon className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-muted-foreground">No {entityType} added yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
