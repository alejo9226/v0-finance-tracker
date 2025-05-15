"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { ArrowLeft, CalendarIcon, PlusIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { createTransaction, Transaction } from "@/lib/supabase/data-services/transactions"
import { Asset, fetchAssetCurrentValue, fetchAssets, updateAsset } from "@/lib/supabase/data-services/assets"
import { fetchCategories } from "@/lib/supabase/data-services/categories"


export default function NewTransactionPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [transactionType, setTransactionType] = useState<"income" | "expense">("expense")
  const [categories, setCategories] = useState<Transaction["category"][]>([])
  const [assets, setAssets] = useState<Asset[]>([])
  const [date, setDate] = useState<Date>(new Date())
  const [formData, setFormData] = useState({
    amount: "",
    categoryId: "",
    assetId: "",
    description: "",
  })

  useEffect(() => {
    fetchData()
  }, [transactionType])

  const fetchData = async () => {
    try {
      const assetsData = await fetchAssets()

      const categoriesData = await fetchCategories(transactionType)

      setCategories(categoriesData || [])
      // Reset category selection when type changes
      setFormData((prev) => ({ ...prev, categoryId: "" }))

      setAssets(assetsData as Asset[] || [])
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load data",
        variant: "destructive",
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
      if (!formData.amount || !formData.assetId || !formData.categoryId) {
        throw new Error("Amount, account and category are required")
      }

      const amount = Number.parseFloat(formData.amount)
      if (isNaN(amount) || amount <= 0) {
        throw new Error("Please enter a valid amount")
      }

      // First, insert the transaction
      await createTransaction({
        amount: transactionType === "expense" ? -amount : amount,
        type: transactionType,
        category_id: formData.categoryId!,
        asset_id: formData.assetId,
        description: formData.description,
        date: date,
        user_id: user?.id!,
      })

      // Then, update the asset balance
      const assetData: Asset = await fetchAssetCurrentValue(formData.assetId)

      const newValue = Number.parseFloat(`${assetData.value}`) + (transactionType === "expense" ? -amount : amount)

      await updateAsset(formData.assetId, { value: newValue })

      toast({
        title: "Transaction added",
        description: `Your ${transactionType} has been recorded successfully`,
      })

      router.push("/dashboard/transactions")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add transaction",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container max-w-2xl py-10 mx-auto">
      <Button variant="ghost" className="mb-6" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>New Transaction</CardTitle>
          <CardDescription>Record a new income or expense</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Transaction Type</Label>
              <RadioGroup
                defaultValue="expense"
                value={transactionType}
                onValueChange={(value) => setTransactionType(value as "income" | "expense")}
                className="flex"
              >
                <div className="flex items-center space-x-2 mr-6">
                  <RadioGroupItem value="expense" id="expense" />
                  <Label htmlFor="expense" className="cursor-pointer">
                    Expense
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="income" id="income" />
                  <Label htmlFor="income" className="cursor-pointer">
                    Income
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
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
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(date, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={date} onSelect={(date) => date && setDate(date)} initialFocus />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={formData.categoryId} onValueChange={(value) => handleSelectChange("categoryId", value)}>
                {categories.length === 0 ? (
                  <div className="flex items-center space-x-2">
                    <Input
                      id="category"
                      name="category"
                      type="text"
                      placeholder="No categories found"
                      value={""}
                      disabled
                    />
                    <Button variant="secondary" size="icon" onClick={() => router.push("/dashboard/categories")}>
                      <PlusIcon className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
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
                      <span className="text-muted-foreground">No categories found</span>
                    )}
                  </>
                )}
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Account</Label>
              {assets.length === 0 ? (
                <div className="flex items-center space-x-2">
                  <Input
                    id="asset"
                    name="asset"
                    type="text"
                    placeholder="No accounts found"
                    value={""}
                    disabled
                  />
                  <Button variant="secondary" size="icon" onClick={() => router.push("/dashboard")}>
                    <PlusIcon className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Select value={formData.assetId} onValueChange={(value) => handleSelectChange("assetId", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an account" />
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
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Add a note about this transaction"
                value={formData.description}
                onChange={handleChange}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Adding..." : "Add Transaction"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
} 