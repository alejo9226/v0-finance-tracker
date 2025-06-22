'use client'

import { format } from 'date-fns'
import { PencilIcon, Trash2Icon, Loader2 } from 'lucide-react'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

import { deleteTransactionAndUpdateBalance } from '@/application/useCases/transactions/deleteWithAssetOrLiability'
import { updateTransactionAndBalance } from '@/application/useCases/transactions/updateWithBalance'
import { EditTransactionDialog } from '@/components/EditTransactionDialog'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import {
  fetchTransactionById,
  Transaction,
} from '@/lib/supabase/data-services/transactions'
import { useI18n } from '@/locales/client'

export default function TransactionDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [transaction, setTransaction] = useState<Transaction | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [editTxId, setEditTxId] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const t = useI18n()

  useEffect(() => {
    fetchTransaction()
    // eslint-disable-next-line
  }, [params['tx-id']])

  async function fetchTransaction() {
    try {
      setLoading(true)
      setError('')
      const id = params['tx-id']
      const data = await fetchTransactionById(id as string)
      setTransaction(data)
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      setTransaction(null)
      setError(errorMessage || 'Transaction not found.')
    } finally {
      setLoading(false)
    }
  }

  const openEdit = () => {
    setEditTxId(transaction?.id || null)
    setIsEditOpen(true)
  }

  const handleEditSubmit = async (values: {
    description: string
    amount: string
    date: string
    category_id: string
    type: 'income' | 'expense'
  }) => {
    if (!transaction) return
    try {
      await updateTransactionAndBalance(transaction.id, {
        description: values.description,
        amount: Number(values.amount),
        date: new Date(values.date),
        category_id: values.category_id,
        type: values.type,
      })
      toast({
        title: 'Transaction updated',
        description: 'The transaction was updated successfully.',
      })
      setIsEditOpen(false)
      fetchTransaction()
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      toast({
        title: 'Error',
        description: errorMessage || 'Failed to update transaction',
        variant: 'destructive',
      })
    }
  }

  const handleDelete = async () => {
    if (!transaction) return
    setDeleteLoading(true)
    try {
      await deleteTransactionAndUpdateBalance(transaction.id)
      toast({
        title: 'Transaction deleted',
        description: 'The transaction was deleted successfully.',
      })
      setIsDeleteOpen(false)
      router.push('/dashboard/transactions')
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      toast({
        title: 'Error',
        description: errorMessage || 'Failed to delete transaction',
        variant: 'destructive',
      })
    } finally {
      setDeleteLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />
      </div>
    )
  }
  if (error) {
    return (
      <div className="flex h-96 items-center justify-center text-destructive font-semibold">
        {error}
      </div>
    )
  }

  return (
    <div className="py-8 max-w-4xl mx-auto">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl">{t('common.transactions.view.title')}</CardTitle>
            <CardDescription>{t('common.transactions.view.subtitle')}</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={openEdit}>
              <PencilIcon className="h-5 w-5" />
              <span className="sr-only">Edit</span>
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setIsDeleteOpen(true)}>
              <Trash2Icon className="h-5 w-5 text-red-600" />
              <span className="sr-only">Delete</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <span className="font-semibold">{t('common.description')}:</span> {transaction?.description}
          </div>
          <div>
            <span className="font-semibold">{t('common.amount')}:</span>{' '}
            {transaction?.type === 'income' ? '+' : '-'}$
            {Math.abs(Number(transaction?.amount)).toLocaleString()}
          </div>
          <div>
            <span className="font-semibold">{t('common.date')}:</span>{' '}
            {format(new Date(transaction?.date || ''), 'MMM d, yyyy')}
          </div>
          <div>
            <span className="font-semibold">{t('common.category')}:</span>{' '}
            {transaction?.category?.name || 'Uncategorized'}
          </div>
          {transaction?.asset?.name && (
            <div>
              <span className="font-semibold">{t('common.asset')}:</span>{' '}
              {transaction?.asset?.name}
            </div>
          )}
          {transaction?.liability?.name && (
            <div>
              <span className="font-semibold">{t('common.liability')}:</span>{' '}
              {transaction?.liability?.name}
            </div>
          )}
          <div>
            <span className="font-semibold">{t('common.type.translation')}:</span>{' '}
            {`${transaction?.type?.charAt(0).toUpperCase()}${transaction?.type?.slice(1)}`}
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <EditTransactionDialog
        open={isEditOpen}
        txId={editTxId}
        onOpenChange={setIsEditOpen}
        onSubmit={handleEditSubmit}
      />

      {/* Delete AlertDialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('common.delete.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('common.delete.subtitle', { type: t('common.transaction').toLowerCase() })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading}>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleteLoading}>
              {deleteLoading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
              {t('common.delete.translation')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
