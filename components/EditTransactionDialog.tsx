import { Loader2 } from 'lucide-react'
import React, { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Category } from '@/lib/supabase/data-services/categories'
import { fetchCategories } from '@/lib/supabase/data-services/categories'
import { fetchTransactionById } from '@/lib/supabase/data-services/transactions'
import { useI18n } from '@/locales/client'


interface EditTransactionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  txId: string | null
  onSubmit: (values: {
    description: string
    amount: string
    date: string
    category_id: string
    type: 'income' | 'expense'
  }) => void
}

export const EditTransactionDialog: React.FC<EditTransactionDialogProps> = ({
  open,
  onOpenChange,
  txId,
  onSubmit,
}) => {
  const [form, setForm] = useState({
    description: '',
    amount: '',
    date: '',
    category_id: '',
    type: 'expense' as 'income' | 'expense',
  })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])

  const t = useI18n()

  // Fetch all data when dialog opens or txId changes
  useEffect(() => {
    const fetchData = async () => {
      if (!open || !txId) return
      setLoading(true)
      setError(null)
      try {
        const tx = await fetchTransactionById(txId)

        if (!tx) {
          setError('Transaction not found')
          setLoading(false)
          return
        }

        setForm({
          description: tx.description,
          amount: Math.abs(Number(tx.amount)).toString(),
          date: tx.date.toString().slice(0, 10),
          category_id: tx.category?.id || '',
          type: (tx.type === 'income' || tx.type === 'expense') ? tx.type : 'expense',
        })
        const cats = await fetchCategories(tx.type as 'income' | 'expense')
        setCategories(cats)
        setLoading(false)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load transaction data')
        setLoading(false)
      }
    }
    fetchData()
  }, [open, txId])

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setForm({
        description: '',
        amount: '',
        date: '',
        category_id: '',
        type: 'expense',
      })
      setCategories([])
      setError(null)
      setLoading(false)
    }
  }, [open])

  const handleSubmit = () => {
    setError(null)
    onSubmit({
      ...form,
      amount: form.type === 'income' ? form.amount : `-${form.amount}`,
    })
  }

  if (!open || !txId) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('common.transactions.edit.title')}</DialogTitle>
          <DialogDescription>{t('common.transactions.edit.subtitle')}</DialogDescription>
        </DialogHeader>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="animate-spin h-6 w-6 text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="text-red-600 text-sm font-medium py-4">{error}</div>
        ) : (
          <>
            {error && (
              <div className="text-red-600 text-sm font-medium">{error}</div>
            )}
            <div className="space-y-2">
              <label htmlFor="tx-description" className="block text-sm font-medium">
                {t('common.description')}
              </label>
              <Input
                id="tx-description"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="tx-amount" className="block text-sm font-medium">
                {t('common.amount')}
              </label>
              <Input
                id="tx-amount"
                type="number"
                value={Math.abs(Number(form.amount)).toString()}
                onChange={(e) => setForm((f) => ({ ...f, amount: Math.abs(Number(e.target.value)).toString() }))}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="tx-date" className="block text-sm font-medium">
                {t('common.date')}
              </label>
              <Input
                id="tx-date"
                type="date"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="tx-category" className="block text-sm font-medium">
                {t('common.category')}
              </label>
              <Select
                value={form.category_id}
                onValueChange={(value) => setForm((f) => ({ ...f, category_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('common.transactions.add.category-placeholder')} />
                </SelectTrigger>
                <SelectContent>
                  {categories.length === 0 ? (
                    <SelectItem value="__none__" disabled>{t('common.transactions.add.no-categories')}</SelectItem>
                  ) : (
                    <>
                      <SelectItem value="__none__">None</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          <span className="mr-2">{category.icon}</span>
                          {category.name}
                        </SelectItem>
                      ))}
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                {t('common.cancel')}
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!!loading}
              >
                {loading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
                {t('common.save')}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
} 