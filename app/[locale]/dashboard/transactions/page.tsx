'use client'

import { format } from 'date-fns'
import { PlusIcon, FilterIcon } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { fetchTransactions, Transaction } from '@/lib/supabase/data-services/transactions'
import { useI18n } from '@/locales/client'

export default function TransactionsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const t = useI18n()

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab])

  const fetchData = async () => {
    try {
      setLoading(true)

      const transactionsData = await fetchTransactions(
        activeTab === 'all' ? undefined : (activeTab as 'income' | 'expense'),
      )

      setTransactions(transactionsData || [])
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      toast({
        title: 'Error',
        description: errorMessage || 'Failed to load transactions',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredTransactions = transactions.filter((transaction) => {
    if (!searchQuery) return true

    const searchLower = searchQuery.toLowerCase()
    return (
      transaction.description?.toLowerCase().includes(searchLower) ||
      transaction.category?.name.toLowerCase().includes(searchLower) ||
      transaction.asset?.name.toLowerCase().includes(searchLower)
    )
  })

  return (
    <div className="py-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">{t('common.transactions.translation')}</h1>
        <Button onClick={() => router.push('/dashboard/transactions/new')}>
          <PlusIcon className="h-5 w-5 md:mr-2" />
          <span
            className="hidden md:inline"
          >
            {t('transactions.buttons.new-transaction')}
          </span>
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            {transactions.length > 0 && (
              <>
                <Input
                  placeholder={t('transactions.search.placeholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
                <FilterIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </>
            )}
          </div>
        </div>
        <div>
          <Link href="/dashboard/categories">
            <Button variant="outline">{t('transactions.search.buttons.manage-categories')}</Button>
          </Link>
        </div>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">{t('transactions.filters.all')}</TabsTrigger>
          <TabsTrigger value="income">{t('transactions.filters.income')}</TabsTrigger>
          <TabsTrigger value="expense">{t('transactions.filters.expense')}</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          <Card>
            <CardHeader>
              <CardTitle>
                {activeTab === 'all'
                  ? t('transactions.transactions.all')
                  : activeTab === 'income'
                    ? t('transactions.filters.income')
                    : t('transactions.filters.expense')}
              </CardTitle>
              <CardDescription>
                {filteredTransactions.length}{' '}
                {filteredTransactions.length === 1 ?
                  t('common.transaction').toLowerCase() :
                  t('common.transactions.translation').toLowerCase()} {t('transactions.transactions.found')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="text-center">
                    <p className="text-muted-foreground">{t('common.loading')} transactions...</p>
                  </div>
                </div>
              ) : filteredTransactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <p
                    className="text-muted-foreground mb-4"
                  >
                    {t('transactions.transactions.no-transactions')}
                  </p>
                  <Button onClick={() => router.push('/dashboard/transactions/new')}>
                    {t('transactions.transactions.add-transaction')}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 rounded-lg border"
                      onClick={() => router.push(`/dashboard/transactions/${transaction.id}`)}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className="flex h-10 w-10 items-center justify-center rounded-full"
                          style={{
                            backgroundColor: transaction.category?.color
                              ? `${transaction.category.color}20`
                              : '#e2e8f0',
                            color: transaction.category?.color || '#64748b',
                          }}
                        >
                          <span className="text-lg">
                            {transaction.category?.icon ||
                              (transaction.type === 'income' ? '💰' : '💸')}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">
                            {transaction.description ||
                              (transaction.type === 'income' ? 'Income' : 'Expense')}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {transaction.category?.name || 'Uncategorized'} •{' '}
                            {transaction.asset?.name || transaction.liability?.name || 'No account'} •{' '}
                            {format(new Date(transaction.date), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                      <div
                        className={`font-medium ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}
                      >
                        {transaction.type === 'income' ? '+' : '-'}$
                        {Math.abs(Number(transaction.amount)).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
