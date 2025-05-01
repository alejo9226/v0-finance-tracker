"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { ArrowLeft, CalendarIcon } from "lucide-react"

import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { AuthCheck } from "@/components/auth-check"
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

type Category = {
  id: string
  name: string
  type: "income" | "expense"
  icon: string
  color: string
}

type Asset = {
  id: string
  name: string
  value: number
}

export default function NewTransactionPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [transactionType, setTransactionType] = useState<"income" | "expense">("expense")
  const [categories, setCategories] = useState<Category[]>([])
  const [assets, setAssets] = useState<Asset[]>([])
  const [date, setDate] = useState<Date>(new Date())
  const [formData, setFormData] = useState({
    amount: "",
    categoryId: "",
    assetId: "",
    description: "",
  })
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    fetchCategories()
    fetchAssets()
  }, [transactionType])

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase.from("categories").select("*").eq("type", transactionType).order("name")

      if (error) throw error

      setCategories(data || [])
      // Reset category selection when type changes
      setFormData((prev) => ({ ...prev, categoryId: "" }))
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load categories",
        variant: "destructive",
      })
    }
  }

  const fetchAssets = async () => {
    try {
      const { data, error } = await supabase.from("assets").select("*").order("name")

      if (error) throw error

      setAssets(data || [])
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load accounts",
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

    console.log('submitting transaction', e)

    try {
      if (!formData.amount || !formData.assetId) {
        throw new Error("Amount and account are required")
      }

      const amount = Number.parseFloat(formData.amount)
      if (isNaN(amount) || amount <= 0) {
        throw new Error("Please enter a valid amount")
      }

      // First, insert the transaction
      const { data: transactionData, error: transactionError } = await supabase
        .from("transactions")
        .insert({
          amount: transactionType === "expense" ? -amount : amount,
          type: transactionType,
          category_id: formData.categoryId || null,
          asset_id: formData.assetId,
          description: formData.description,
          date,
          user_id: user?.id
        })
        .select()

      console.log('trans error', transactionError)

      if (transactionError) throw transactionError

      // Then, update the asset balance
      const { data: assetData, error: assetError } = await supabase
        .from("assets")
        .select("value")
        .eq("id", formData.assetId)
        .single()

      if (assetError) throw assetError

      const newValue = Number.parseFloat(assetData.value) + (transactionType === "expense" ? -amount : amount)

      const { error: updateError } = await supabase
        .from("assets")
        .update({ value: newValue })
        .eq("id", formData.assetId)

      if (updateError) throw updateError

      toast({
        title: "Transaction added",
        description: `Your ${transactionType} has been recorded successfully`,
      })

      router.push("/transactions")
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
    <AuthCheck>
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
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2">$</span>
                  <Input
                    id="amount"
                    name="amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    className="pl-8"
                    value={formData.amount}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={formData.categoryId} onValueChange={(value) => handleSelectChange("categoryId", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.length === 0 ? (
                      <SelectItem value="none" disabled>
                        No categories found
                      </SelectItem>
                    ) : (
                      categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          <div className="flex items-center">
                            <span className="mr-2">{category.icon}</span>
                            {category.name}
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="account">Account</Label>
                <Select
                  value={formData.assetId}
                  onValueChange={(value) => handleSelectChange("assetId", value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an account" />
                  </SelectTrigger>
                  <SelectContent>
                    {assets.length === 0 ? (
                      <SelectItem value="none" disabled>
                        No accounts found
                      </SelectItem>
                    ) : (
                      assets.map((asset) => (
                        <SelectItem key={asset.id} value={asset.id}>
                          {asset.name} (${Number(asset.value).toLocaleString()})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={date} onSelect={(date) => date && setDate(date)} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Enter a description"
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Transaction"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </AuthCheck>
  )
}
