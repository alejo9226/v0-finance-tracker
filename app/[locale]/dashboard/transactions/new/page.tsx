'use client'

import { format } from 'date-fns'
import { ArrowLeft, CalendarIcon, PlusIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import type React from 'react'

import { getAssetCurrentValue, getAssets } from '@/application/useCases/assets/get'
import { updateAsset } from '@/application/useCases/assets/update'
import { transferBetweenAssets } from '@/application/useCases/transactions/transfer'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/contexts/auth-context'
import { Asset } from '@/domain/entities/Asset'
import { useToast } from '@/hooks/use-toast'
import { fetchCategories } from '@/lib/supabase/data-services/categories'
import { createTransaction, Transaction } from '@/lib/supabase/data-services/transactions'
import { useI18n } from '@/locales/client'

export default function NewTransactionPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [transactionType, setTransactionType] = useState<'income' | 'expense' | 'transfer'>('expense')
  const [categories, setCategories] = useState<Transaction['category'][]>([])
  const [assets, setAssets] = useState<Asset[]>([])
  const [date, setDate] = useState<Date>(new Date())
  const [formData, setFormData] = useState({
    amount: '',
    categoryId: '',
    assetId: '',
    description: '',
    fromAssetId: '',
    toAssetId: '',
    exchangeRate: '',
    destinationAmount: '',
    fee: '',
  })
  const t = useI18n()

  useEffect(() => {
    if (transactionType === 'income' || transactionType === 'expense') {
      fetchData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactionType])

  const fetchData = async () => {
    try {
      const assetsData = await getAssets()

      let categoriesData: Transaction['category'][] = []
      if (transactionType === 'income' || transactionType === 'expense') {
        categoriesData = await fetchCategories(transactionType)
      }

      setCategories(categoriesData || [])
      // Reset category selection when type changes
      setFormData((prev) => ({ ...prev, categoryId: '' }))

      setAssets((assetsData as Asset[]) || [])
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      toast({
        title: 'Error',
        description: errorMessage || 'Failed to load data',
        variant: 'destructive',
      })
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (transactionType === 'transfer') {
        if (!formData.amount || !formData.fromAssetId || !formData.toAssetId) {
          throw new Error('Amount, from and to accounts are required')
        }
        const fromAsset = assets.find(a => a.id === formData.fromAssetId)
        const toAsset = assets.find(a => a.id === formData.toAssetId)
        if (!fromAsset || !toAsset) throw new Error('Invalid asset selection')
        const fromAmount = Number(formData.amount)
        let toAmount = fromAmount
        let exchangeRate = 1
        if (fromAsset.currency !== toAsset.currency) {
          exchangeRate = Number(formData.exchangeRate)
          toAmount = Number(formData.destinationAmount)
          if (!exchangeRate || !toAmount) throw new Error('Exchange rate and destination amount are required')
        }
        const fee = formData.fee ? Number(formData.fee) : 0
        await transferBetweenAssets({
          fromAssetId: fromAsset.id,
          toAssetId: toAsset.id,
          fromAmount,
          toAmount,
          exchangeRate,
          fee,
          description: formData.description,
          date,
          userId: user?.id || '',
        })
        toast({
          title: 'Transfer added',
          description: 'Your transfer has been recorded successfully',
        })
        router.push('/dashboard/transactions')
        return
      }
      if (!formData.amount || !formData.assetId || !formData.categoryId) {
        throw new Error('Amount, account and category are required')
      }

      const amount = Number.parseFloat(formData.amount)
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Please enter a valid amount')
      }

      // First, insert the transaction
      await createTransaction({
        amount: transactionType === 'expense' ? -amount : amount,
        type: transactionType,
        category_id: formData.categoryId!,
        asset_id: formData.assetId,
        description: formData.description,
        date: date,
        user_id: user?.id || '',
      })

      // Then, update the asset balance
      const assetData: Asset = await getAssetCurrentValue(formData.assetId)

      const newValue =
        Number.parseFloat(`${assetData.value}`) + (transactionType === 'expense' ? -amount : amount)

      await updateAsset(formData.assetId, { value: newValue })

      toast({
        title: 'Transaction added',
        description: `Your ${transactionType} has been recorded successfully`,
      })

      router.push('/dashboard/transactions')
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      toast({
        title: 'Error',
        description: errorMessage || 'Failed to add transaction',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container max-w-2xl py-10 mx-auto">
      <Button variant="ghost" className="mb-6" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        {t('common.back')}
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>{t('common.transactions.add.title-v2')}</CardTitle>
          <CardDescription>{t('common.transactions.add.subtitle-v2')}</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>{t('common.transactions.add.type.translation')}</Label>
              <RadioGroup
                defaultValue="expense"
                value={transactionType}
                onValueChange={(value) => setTransactionType(value as 'income' | 'expense' | 'transfer')}
                className="flex"
              >
                <div className="flex items-center space-x-2 mr-6">
                  <RadioGroupItem value="expense" id="expense" />
                  <Label htmlFor="expense" className="cursor-pointer">
                    {t('common.transactions.add.type.expense')}
                  </Label>
                </div>
                <div className="flex items-center space-x-2 mr-6">
                  <RadioGroupItem value="income" id="income" />
                  <Label htmlFor="income" className="cursor-pointer">
                    {t('common.transactions.add.type.income')}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="transfer" id="transfer" />
                  <Label htmlFor="transfer" className="cursor-pointer">
                    {t('common.transactions.add.type.transfer')}
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {transactionType === 'transfer' ? (
              <>
                <div className="space-y-2">
                  <Label>{t('common.transactions.add.from-asset')}</Label>
                  <Select
                    value={formData.fromAssetId}
                    onValueChange={(value) => setFormData(f => ({ ...f, fromAssetId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('common.transactions.add.from-asset-placeholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      {assets.map((asset) => (
                        <SelectItem key={asset.id} value={asset.id}>
                          {asset.name} ({asset.currency})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t('common.transactions.add.to-asset')}</Label>
                  <Select
                    value={formData.toAssetId}
                    onValueChange={(value) => setFormData(f => ({ ...f, toAssetId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('common.transactions.add.to-asset-placeholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      {assets
                        .filter(a => a.id !== formData.fromAssetId)
                        .map((asset) => (
                          <SelectItem key={asset.id} value={asset.id}>
                            {asset.name} ({asset.currency})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t('common.amount')} {assets.find(a => a.id === formData.fromAssetId)?.currency || ''}</Label>
                  <Input
                    id="amount"
                    name="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={handleChange}
                  />
                </div>
                {(() => {
                  const fromAsset = assets.find(a => a.id === formData.fromAssetId)
                  const toAsset = assets.find(a => a.id === formData.toAssetId)
                  if (fromAsset && toAsset && fromAsset.currency !== toAsset.currency) {
                    return (
                      <>
                        <div className="space-y-2">
                          <Label>{t('common.transactions.add.exchange-rate')} ({fromAsset.currency} → {toAsset.currency})</Label>
                          <Input
                            id="exchangeRate"
                            name="exchangeRate"
                            type="number"
                            step="0.0001"
                            min="0"
                            placeholder="e.g. 4000"
                            value={formData.exchangeRate}
                            onChange={e => setFormData(f => ({ ...f, exchangeRate: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>{t('common.transactions.add.destination-amount')} ({toAsset.currency})</Label>
                          <Input
                            id="destinationAmount"
                            name="destinationAmount"
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            value={formData.destinationAmount}
                            onChange={e => setFormData(f => ({ ...f, destinationAmount: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>{t('common.transactions.add.fee')} ({fromAsset.currency})</Label>
                          <Input
                            id="fee"
                            name="fee"
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            value={formData.fee}
                            onChange={e => setFormData(f => ({ ...f, fee: e.target.value }))}
                          />
                        </div>
                      </>
                    )
                  }
                  return null
                })()}
                <div className="space-y-2">
                  <Label>{t('common.date')}</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(date, 'PPP')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={(date) => date && setDate(date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">{t('common.description')}</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder={t('common.transactions.add.description-placeholder')}
                    value={formData.description}
                    onChange={handleChange}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="amount">{t('common.amount')}</Label>
                  <Input
                    id="amount"
                    name="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t('common.date')}</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(date, 'PPP')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={(date) => date && setDate(date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>{t('common.category')}</Label>
                  <Select
                    value={formData.categoryId}
                    onValueChange={(value) => handleSelectChange('categoryId', value)}
                  >
                    {categories.length === 0 ? (
                      <div className="flex items-center space-x-2">
                        <Input
                          id="category"
                          name="category"
                          type="text"
                          placeholder={t('common.transactions.add.no-categories')}
                          value={''}
                          disabled
                        />
                        <Button
                          variant="secondary"
                          size="icon"
                          onClick={() => router.push('/dashboard/categories')}
                        >
                          <PlusIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <SelectTrigger>
                          <SelectValue placeholder={t('common.transactions.add.category-placeholder')} />
                        </SelectTrigger>
                        {categories.length > 0 ? (
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                <span className="mr-2">{category.icon}</span>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        ) : (
                          <span className="text-muted-foreground">{t('common.transactions.add.no-categories')}</span>
                        )}
                      </>
                    )}
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{t('common.asset')}</Label>
                  {assets.length === 0 ? (
                    <div className="flex items-center space-x-2">
                      <Input
                        id="asset"
                        name="asset"
                        type="text"
                        placeholder={t('common.transactions.add.no-assets-found')}
                        value={''}
                        disabled
                      />
                      <Button variant="secondary" size="icon" onClick={() => router.push('/dashboard')}>
                        <PlusIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <Select
                      value={formData.assetId}
                      onValueChange={(value) => handleSelectChange('assetId', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('common.transactions.add.asset-placeholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        {assets.map((asset) => (
                          <SelectItem key={asset.id} value={asset.id}>
                            {asset.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">{t('common.description')}</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder={t('common.transactions.add.description-placeholder')}
                    value={formData.description}
                    onChange={handleChange}
                  />
                </div>
              </>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? t('common.transactions.add.loading') : t('common.transactions.add.submit')}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
