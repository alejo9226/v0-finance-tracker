"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { ArrowDown, ArrowUp, CreditCard, DollarSign, Landmark, PlusIcon, Wallet, PencilIcon, Trash2Icon } from "lucide-react"
import currency from 'currency.js'

import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const CURRENCIES = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "CHF", symbol: "CHF", name: "Swiss Franc" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
  { code: "MXN", symbol: "$", name: "Mexican Peso" },
  { code: "COP", symbol: "$", name: "Colombian Peso" },
] as const

type CurrencyCode = typeof CURRENCIES[number]["code"]

type Asset = {
  id: string
  type: string
  name: string
  value: number
  currency: CurrencyCode
}

type Liability = {
  id: string
  type: string
  name: string
  value: number
  currency: CurrencyCode
}

type Transaction = {
  id: string
  amount: number
  type: "income" | "expense"
  description: string
  date: string
  category: {
    id: string
    name: string
    icon: string
    color: string
  }
  asset: {
    id: string
    name: string
  }
}

type UserCurrencyPreference = {
  code: CurrencyCode
  isPreferred: boolean
}

const EXCHANGE_RATES: Record<CurrencyCode, number> = {
  USD: 1,
  EUR: 0.91,
  GBP: 0.79,
  JPY: 151.45,
  CAD: 1.35,
  AUD: 1.52,
  CHF: 0.89,
  CNY: 7.23,
  MXN: 16.75,
  COP: 3927.50
}

// Add new types and state for per-currency totals
type CurrencyTotals = {
  [key in CurrencyCode]: {
    assets: number;
    liabilities: number;
  }
}

export default function DashboardPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const [assets, setAssets] = useState<Asset[]>([])
  const [liabilities, setLiabilities] = useState<Liability[]>([])
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(false)
  const [totalAssets, setTotalAssets] = useState(0)
  const [totalLiabilities, setTotalLiabilities] = useState(0)
  const [equity, setEquity] = useState(0)
  const [isEditAssetOpen, setIsEditAssetOpen] = useState(false)
  const [isEditLiabilityOpen, setIsEditLiabilityOpen] = useState(false)
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  const [selectedLiability, setSelectedLiability] = useState<Liability | null>(null)
  const [editForm, setEditForm] = useState({
    name: "",
    type: "",
    value: "",
    currency: "USD" as CurrencyCode,
  })
  const [isAddAssetOpen, setIsAddAssetOpen] = useState(false)
  const [isAddLiabilityOpen, setIsAddLiabilityOpen] = useState(false)
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<{ id: string; type: "asset" | "liability" } | null>(null)
  const [displayCurrency, setDisplayCurrency] = useState<CurrencyCode | "">("")
  const [activeCurrencies, setActiveCurrencies] = useState<Set<CurrencyCode>>(new Set())
  const [userCurrencies, setUserCurrencies] = useState<UserCurrencyPreference[]>([])
  const [currencyTotals, setCurrencyTotals] = useState<CurrencyTotals>({} as CurrencyTotals)
  const supabase = getSupabaseBrowserClient()

  const fetchData = useCallback(async () => {
    try {
      if (!user) {
        router.push("/login")
        return
      }

      setLoading(true)

      // Fetch assets
      const { data: assetsData, error: assetsError } = await supabase.from("assets").select("*").order("name").eq("user_id", user.id)

      if (assetsError) throw assetsError

      // Fetch liabilities
      const { data: liabilitiesData, error: liabilitiesError } = await supabase
        .from("liabilities")
        .select("*")
        .order("name")
        .eq("user_id", user.id)
      if (liabilitiesError) throw liabilitiesError

      // Fetch recent transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from("transactions")
        .select(`
          id,
          amount,
          type,
          description,
          date,
          category:category_id(id, name, icon, color),
          asset:asset_id(id, name)
        `)
        .order("date", { ascending: false })
        .limit(5)

      if (transactionsError) throw transactionsError

      // Set state with type assertions and transformations
      setAssets(assetsData as Asset[] || [])
      setLiabilities(liabilitiesData as Liability[] || [])
      
      // Transform transactions data to ensure required fields
      const transformedTransactions = (transactionsData || []).map((t: any) => ({
        id: t.id,
        amount: Number(t.amount),
        type: t.type as "income" | "expense",
        description: t.description || "",
        date: t.date,
        category: t.category || {
          id: "uncategorized",
          name: "Uncategorized",
          icon: t.type === "income" ? "💰" : "💸",
          color: "#64748b"
        },
        asset: t.asset || {
          id: "no-account",
          name: "No account"
        }
      }))
      
      setRecentTransactions(transformedTransactions)

      // Calculate per-currency totals
      const newCurrencyTotals: CurrencyTotals = {} as CurrencyTotals

      // Initialize totals for each currency
      CURRENCIES.forEach(currency => {
        newCurrencyTotals[currency.code] = {
          assets: 0,
          liabilities: 0
        }
      })

      // Calculate assets per currency with proper type assertion
      const typedAssetsData = assetsData as Asset[] || []
      typedAssetsData.forEach((asset) => {
        newCurrencyTotals[asset.currency].assets += Number(asset.value)
      })

      // Calculate liabilities per currency with proper type assertion
      const typedLiabilitiesData = liabilitiesData as Liability[] || []
      typedLiabilitiesData.forEach((liability) => {
        newCurrencyTotals[liability.currency].liabilities += Number(liability.value)
      })

      setCurrencyTotals(newCurrencyTotals)

      // Calculate converted totals
      const assetsTotal = typedAssetsData.reduce((sum, asset) => {
        if (displayCurrency) {
          return sum + convertCurrency(Number(asset.value), asset.currency, displayCurrency)
        }
        return sum + Number(asset.value)
      }, 0)

      const liabilitiesTotal = typedLiabilitiesData.reduce((sum, liability) => {
        if (displayCurrency) {
          return sum + convertCurrency(Number(liability.value), liability.currency, displayCurrency)
        }
        return sum + Number(liability.value)
      }, 0)

      setTotalAssets(assetsTotal)
      setTotalLiabilities(liabilitiesTotal)
      setEquity(assetsTotal - liabilitiesTotal)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load financial data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [router, supabase, user])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    // Calculate converted totals when display currency changes
    const assetsTotal = assets.reduce((sum, asset) => {
      if (displayCurrency) {
        return sum + convertCurrency(Number(asset.value), asset.currency, displayCurrency)
      }
      return sum + Number(asset.value)
    }, 0)

    const liabilitiesTotal = liabilities.reduce((sum, liability) => {
      if (displayCurrency) {
        return sum + convertCurrency(Number(liability.value), liability.currency, displayCurrency)
      }
      return sum + Number(liability.value)
    }, 0)

    setTotalAssets(assetsTotal)
    setTotalLiabilities(liabilitiesTotal)
    setEquity(assetsTotal - liabilitiesTotal)
  }, [displayCurrency, assets, liabilities])

  useEffect(() => {
    // Get unique currencies from assets and liabilities
    const currencySet = new Set<CurrencyCode>()
    assets.forEach(asset => currencySet.add(asset.currency))
    liabilities.forEach(liability => currencySet.add(liability.currency))
    setActiveCurrencies(currencySet)

    // Create user currencies array with preference
    const currencies = Array.from(currencySet).map(code => ({
      code,
      isPreferred: code === displayCurrency
    }))
    setUserCurrencies(currencies)
  }, [assets, liabilities, displayCurrency])

  const getAssetIcon = (type: string) => {
    switch (type) {
      case "bank":
        return <Landmark className="h-5 w-5" />
      case "investment":
        return <DollarSign className="h-5 w-5" />
      case "cash":
        return <Wallet className="h-5 w-5" />
      default:
        return <DollarSign className="h-5 w-5" />
    }
  }

  const getLiabilityIcon = (type: string) => {
    switch (type) {
      case "credit":
        return <CreditCard className="h-5 w-5" />
      case "loan":
        return <Landmark className="h-5 w-5" />
      default:
        return <CreditCard className="h-5 w-5" />
    }
  }

  const formatCurrency = (amount: number, currencyCode: CurrencyCode | "") => {
    if (currencyCode === "") return `${amount.toLocaleString()}`
    const currencyInfo = CURRENCIES.find(c => c.code === currencyCode)
    if (!currencyInfo) return `${amount.toLocaleString()}`
    
    return currency(amount, {
      symbol: currencyInfo.symbol,
      precision: 0,
      pattern: '! #',
      separator: ',',
      decimal: '.'
    }).format()
  }

  const convertCurrency = (amount: number, fromCurrency: CurrencyCode, toCurrency: CurrencyCode | ""): number => {
    if (toCurrency === "") return amount
    if (fromCurrency === toCurrency) return amount
    
    // Convert through USD as the base currency
    const amountInUsd = currency(amount).divide(EXCHANGE_RATES[fromCurrency])
    return amountInUsd.multiply(EXCHANGE_RATES[toCurrency]).value
  }

  const handleEditAsset = async () => {
    try {
      if (!selectedAsset || !editForm.name || !editForm.value || !editForm.currency) {
        throw new Error("All fields are required")
      }

      const { error } = await supabase
        .from("assets")
        .update({
          name: editForm.name,
          type: editForm.type,
          value: Number(editForm.value),
          currency: editForm.currency,
        })
        .eq("id", selectedAsset.id)

      if (error) throw error

      toast({
        title: "Asset updated",
        description: "Your asset has been updated successfully",
      })

      setIsEditAssetOpen(false)
      setSelectedAsset(null)
      fetchData()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update asset",
        variant: "destructive",
      })
    }
  }

  const handleEditLiability = async () => {
    try {
      if (!selectedLiability || !editForm.name || !editForm.value || !editForm.currency) {
        throw new Error("All fields are required")
      }

      const { error } = await supabase
        .from("liabilities")
        .update({
          name: editForm.name,
          type: editForm.type,
          value: Number(editForm.value),
          currency: editForm.currency,
        })
        .eq("id", selectedLiability.id)

      if (error) throw error

      toast({
        title: "Liability updated",
        description: "Your liability has been updated successfully",
      })

      setIsEditLiabilityOpen(false)
      setSelectedLiability(null)
      fetchData()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update liability",
        variant: "destructive",
      })
    }
  }

  const openEditAsset = (asset: Asset) => {
    setSelectedAsset(asset)
    setEditForm({
      name: asset.name,
      type: asset.type,
      value: asset.value.toString(),
      currency: asset.currency,
    })
    setIsEditAssetOpen(true)
  }

  const openEditLiability = (liability: Liability) => {
    setSelectedLiability(liability)
    setEditForm({
      name: liability.name,
      type: liability.type,
      value: liability.value.toString(),
      currency: liability.currency,
    })
    setIsEditLiabilityOpen(true)
  }

  const handleAddAsset = async () => {
    try {
      if (!editForm.name || !editForm.type || !editForm.value || !editForm.currency) {
        throw new Error("All fields are required")
      }

      const { error } = await supabase
        .from("assets")
        .insert({
          name: editForm.name,
          type: editForm.type,
          value: Number(editForm.value),
          currency: editForm.currency,
          user_id: user?.id,
        })

      if (error) throw error

      toast({
        title: "Asset added",
        description: "Your asset has been added successfully",
      })

      setIsAddAssetOpen(false)
      setEditForm({ name: "", type: "", value: "", currency: "USD" })
      fetchData()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add asset",
        variant: "destructive",
      })
    }
  }

  const handleAddLiability = async () => {
    try {
      if (!editForm.name || !editForm.type || !editForm.value || !editForm.currency) {
        throw new Error("All fields are required")
      }

      const { error } = await supabase
        .from("liabilities")
        .insert({
          name: editForm.name,
          type: editForm.type,
          value: Number(editForm.value),
          currency: editForm.currency,
          user_id: user?.id,
        })

      if (error) throw error

      toast({
        title: "Liability added",
        description: "Your liability has been added successfully",
      })

      setIsAddLiabilityOpen(false)
      setEditForm({ name: "", type: "", value: "", currency: "COP" })
      fetchData()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add liability",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async () => {
    try {
      if (!itemToDelete) return

      const { error } = await supabase
        .from(itemToDelete.type === "asset" ? "assets" : "liabilities")
        .delete()
        .eq("id", itemToDelete.id)

      if (error) throw error

      toast({
        title: `${itemToDelete.type === "asset" ? "Asset" : "Liability"} deleted`,
        description: `Your ${itemToDelete.type} has been deleted successfully`,
      })

      setIsConfirmDeleteOpen(false)
      setItemToDelete(null)
      fetchData()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete item",
        variant: "destructive",
      })
    }
  }

  const handleSetPreferredCurrency = (currencyCode: CurrencyCode) => {
    if (currencyCode === displayCurrency) {
      setDisplayCurrency("") 
      return
    }

    setDisplayCurrency(currencyCode)
    setUserCurrencies(prev => 
      prev.map(c => ({
        ...c,
        isPreferred: c.code === currencyCode
      }))
    )
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Loading...</h2>
          <p className="text-muted-foreground">Please wait while we load your dashboard</p>
        </div>
      </div>
    )
  }

  return (
    <div className="py-8">
      <div className="mb-12 flex flex-row md:justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Financial Dashboard</h1>
          <p className="mt-2 text-lg text-muted-foreground">Your financial overview at a glance</p>
        </div>
        
        {userCurrencies.length > 0 && (
          <div className="flex gap-2">
            {userCurrencies.map((curr) => (
              <Button
                key={curr.code}
                size="sm"
                variant={curr.isPreferred ? "default" : "outline"}
                className={`flex items-center gap-1.5`}
                onClick={() => handleSetPreferredCurrency(curr.code)}
              >
                <span>{CURRENCIES.find(c => c.code === curr.code)?.symbol}</span>
                <span>{curr.code}</span>
              </Button>
            ))}
          </div>
        )}

        <div className="hidden md:flex gap-4">
          <Link href="/dashboard/transactions">
            <Button variant="outline" size="lg">View All Transactions</Button>
          </Link>
          <Link href="/dashboard/transactions/new">
            <Button size="lg">
              <PlusIcon className="mr-2 h-5 w-5" />
              New Transaction
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Assets</CardTitle>
          </CardHeader>
          <CardContent>
            {displayCurrency ? (
              <div className="text-3xl font-bold">
                {formatCurrency(totalAssets, displayCurrency)}
              </div>
            ) : (
              <div className="space-y-1">
                {Array.from(activeCurrencies).sort().map(currency => (
                  <div key={currency} className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{currency}</span>
                    <span className={`text-lg font-medium ${currencyTotals[currency].assets === 0 ? 'text-muted-foreground' : ''}`}>
                      {formatCurrency(currencyTotals[currency].assets, currency)}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-2 flex items-center text-sm text-green-500">
              <ArrowUp className="mr-1 h-4 w-4" />
              <span>What you own</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Liabilities</CardTitle>
          </CardHeader>
          <CardContent>
            {displayCurrency ? (
              <div className="text-3xl font-bold">
                {formatCurrency(totalLiabilities, displayCurrency)}
              </div>
            ) : (
              <div className="space-y-1">
                {Array.from(activeCurrencies).sort().map(currency => (
                  <div key={currency} className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{currency}</span>
                    <span className={`text-lg font-medium ${currencyTotals[currency].liabilities === 0 ? 'text-muted-foreground' : ''}`}>
                      {formatCurrency(currencyTotals[currency].liabilities, currency)}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-2 flex items-center text-sm text-red-500">
              <ArrowDown className="mr-1 h-4 w-4" />
              <span>What you owe</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-green-800">Net Worth (Equity)</CardTitle>
          </CardHeader>
          <CardContent>
            {displayCurrency ? (
              <div className="text-3xl font-bold text-green-800">
                {formatCurrency(equity, displayCurrency)}
              </div>
            ) : (
              <div className="space-y-1">
                {Array.from(activeCurrencies).sort().map(currency => {
                  const netWorth = currencyTotals[currency].assets - currencyTotals[currency].liabilities;
                  return (
                    <div key={currency} className="flex justify-between items-center">
                      <span className="text-sm text-green-700">{currency}</span>
                      <span className={`text-lg font-medium ${
                        netWorth === 0 ? 'text-muted-foreground' : 
                        netWorth > 0 ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {formatCurrency(netWorth, currency)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
            <div className="mt-2 flex items-center text-sm text-green-700">
              <span>Assets - Liabilities</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-12 grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader className="relative group">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Assets</CardTitle>
                <CardDescription>What you own</CardDescription>
              </div>
              <div className="hidden group-hover:block transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setEditForm({ name: "", type: "", value: "", currency: "USD" })
                    setIsAddAssetOpen(true)
                  }}
                >
                  <PlusIcon className="h-4 w-4" />
                  <span className="sr-only">Add Asset</span>
                </Button>
              </div>
            </div>
            {displayCurrency && (
              <p className="text-sm text-muted-foreground mt-1">
                Showing values in {displayCurrency}
              </p>
            )}
          </CardHeader>
          <CardContent>
            {assets.length > 0 ? (
              <div className="space-y-4">
                {assets.map((asset) => (
                  <div
                    key={asset.id}
                    className="flex items-center justify-between p-4 rounded-lg border group hover:bg-accent hover:text-accent-foreground"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600">
                        {getAssetIcon(asset.type)}
                      </div>
                      <div>
                        <p className="font-medium">{asset.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {asset.type.charAt(0).toUpperCase() + asset.type.slice(1)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <p className="font-medium transition-transform group-hover:-translate-x-1">
                        {displayCurrency 
                          ? formatCurrency(convertCurrency(Number(asset.value), asset.currency, displayCurrency), displayCurrency)
                          : formatCurrency(Number(asset.value), asset.currency)}
                      </p>
                      <div className="hidden group-hover:flex ml-2 transition-all duration-200">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openEditAsset(asset)}
                        >
                          <PencilIcon className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-600"
                          onClick={() => {
                            setItemToDelete({ id: asset.id, type: "asset" })
                            setIsConfirmDeleteOpen(true)
                          }}
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
                <p className="text-muted-foreground">No assets added yet</p>
                <Button variant="outline" className="mt-4" onClick={() => router.push("/onboarding")}>
                  Add Assets
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="relative group">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Liabilities</CardTitle>
                <CardDescription>What you owe</CardDescription>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setEditForm({ name: "", type: "", value: "", currency: "COP" })
                    setIsAddLiabilityOpen(true)
                  }}
                >
                  <PlusIcon className="h-4 w-4" />
                  <span className="sr-only">Add Liability</span>
                </Button>
              </div>
            </div>
            {displayCurrency && (
              <p className="text-sm text-muted-foreground mt-1">
                Showing values in {displayCurrency}
              </p>
            )}
          </CardHeader>
          <CardContent>
            {liabilities.length > 0 ? (
              <div className="space-y-4">
                {liabilities.map((liability) => (
                  <div
                    key={liability.id}
                    className="flex items-center justify-between p-4 rounded-lg border group hover:bg-accent hover:text-accent-foreground"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                        {getLiabilityIcon(liability.type)}
                      </div>
                      <div>
                        <p className="font-medium">{liability.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {liability.type.charAt(0).toUpperCase() + liability.type.slice(1)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <p className="font-medium transition-transform group-hover:-translate-x-1">
                        {displayCurrency 
                          ? formatCurrency(convertCurrency(Number(liability.value), liability.currency, displayCurrency), displayCurrency)
                          : formatCurrency(Number(liability.value), liability.currency)}
                      </p>
                      <div className="hidden group-hover:flex ml-2 transition-all duration-200">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openEditLiability(liability)}
                        >
                          <PencilIcon className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-600"
                          onClick={() => {
                            setItemToDelete({ id: liability.id, type: "liability" })
                            setIsConfirmDeleteOpen(true)
                          }}
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
                <p className="text-muted-foreground">No liabilities added yet</p>
                <Button variant="outline" className="mt-4" onClick={() => router.push("/onboarding")}>
                  Add Liabilities
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Your latest financial activities</CardDescription>
            </div>
            <Link href="/dashboard/transactions">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentTransactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-muted-foreground mb-4">No transactions yet</p>
                <Link href="/transactions/new">
                  <Button>Add Your First Transaction</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 rounded-lg border"
                    onClick={() => router.push(`/transactions/${transaction.id}`)}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-full"
                        style={{
                          backgroundColor: transaction.category?.color
                            ? `${transaction.category.color}20`
                            : "#e2e8f0",
                          color: transaction.category?.color || "#64748b",
                        }}
                      >
                        <span className="text-lg">
                          {transaction.category?.icon || (transaction.type === "income" ? "💰" : "💸")}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">
                          {transaction.description || (transaction.type === "income" ? "Income" : "Expense")}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {transaction.category?.name || "Uncategorized"} •{" "}
                          {transaction.asset?.name || "No account"} •{" "}
                          {format(new Date(transaction.date), "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                    <div
                      className={`font-medium ${transaction.type === "income" ? "text-green-600" : "text-red-600"}`}
                    >
                      {transaction.type === "income" ? "+" : "-"}$
                      {Math.abs(Number(transaction.amount)).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Asset Dialog */}
      <Dialog open={isEditAssetOpen} onOpenChange={setIsEditAssetOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Asset</DialogTitle>
            <DialogDescription>Update your asset details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="asset-name">Asset Name</Label>
              <Input
                id="asset-name"
                value={editForm.name}
                onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="asset-type">Type</Label>
              <Select
                value={editForm.type}
                onValueChange={(value) => setEditForm((prev) => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank">Bank Account</SelectItem>
                  <SelectItem value="investment">Investment</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-4 grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="asset-value">Value</Label>
                <Input
                  id="asset-value"
                  type="number"
                  value={editForm.value}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, value: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="asset-currency">Currency</Label>
                <Select
                  value={editForm.currency}
                  onValueChange={(value: CurrencyCode) => setEditForm((prev) => ({ ...prev, currency: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((currency) => (
                      <SelectItem key={currency.code} value={currency.code}>
                        {currency.symbol} {currency.code} - {currency.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditAssetOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditAsset}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Liability Dialog */}
      <Dialog open={isEditLiabilityOpen} onOpenChange={setIsEditLiabilityOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Liability</DialogTitle>
            <DialogDescription>Update your liability details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="liability-name">Liability Name</Label>
              <Input
                id="liability-name"
                value={editForm.name}
                onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="liability-type">Type</Label>
              <Select
                value={editForm.type}
                onValueChange={(value) => setEditForm((prev) => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="credit">Credit Card</SelectItem>
                  <SelectItem value="loan">Loan</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-4 grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="liability-value">Value</Label>
                <Input
                  id="liability-value"
                  type="number"
                  value={editForm.value}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, value: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="liability-currency">Currency</Label>
                <Select
                  value={editForm.currency}
                  onValueChange={(value: CurrencyCode) => setEditForm((prev) => ({ ...prev, currency: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((currency) => (
                      <SelectItem key={currency.code} value={currency.code}>
                        {currency.symbol} {currency.code} - {currency.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditLiabilityOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditLiability}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Asset Dialog */}
      <Dialog open={isAddAssetOpen} onOpenChange={setIsAddAssetOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Asset</DialogTitle>
            <DialogDescription>Add a new asset to track</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-asset-name">Asset Name</Label>
              <Input
                id="new-asset-name"
                value={editForm.name}
                onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-asset-type">Type</Label>
              <Select
                value={editForm.type}
                onValueChange={(value) => setEditForm((prev) => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank">Bank Account</SelectItem>
                  <SelectItem value="investment">Investment</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-4 grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="new-asset-value">Value</Label>
                <Input
                  id="new-asset-value"
                  type="number"
                  value={editForm.value}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, value: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-asset-currency">Currency</Label>
                <Select
                  value={editForm.currency}
                  onValueChange={(value: CurrencyCode) => setEditForm((prev) => ({ ...prev, currency: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((currency) => (
                      <SelectItem key={currency.code} value={currency.code}>
                        {currency.symbol} {currency.code} - {currency.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddAssetOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddAsset}>Add Asset</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Liability Dialog */}
      <Dialog open={isAddLiabilityOpen} onOpenChange={setIsAddLiabilityOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Liability</DialogTitle>
            <DialogDescription>Add a new liability to track</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="liability-name">Liability Name</Label>
              <Input
                id="liability-name"
                value={editForm.name}
                onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="liability-type">Type</Label>
              <Select
                value={editForm.type}
                onValueChange={(value) => setEditForm((prev) => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="credit">Credit Card</SelectItem>
                  <SelectItem value="loan">Loan</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-4 grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="liability-value">Value</Label>
                <Input
                  id="liability-value"
                  type="number"
                  value={editForm.value}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, value: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="liability-currency">Currency</Label>
                <Select
                  value={editForm.currency}
                  onValueChange={(value: CurrencyCode) => setEditForm((prev) => ({ ...prev, currency: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((currency) => (
                      <SelectItem key={currency.code} value={currency.code}>
                        {currency.symbol} {currency.code} - {currency.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddLiabilityOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddLiability}>Add Liability</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <Dialog open={isConfirmDeleteOpen} onOpenChange={setIsConfirmDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this {itemToDelete?.type}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
