"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { format, startOfMonth, endOfMonth, isWithinInterval, parseISO } from "date-fns"
import { ArrowDown, ArrowUp, CreditCard, DollarSign, Landmark, PlusIcon, Wallet, PencilIcon, Trash2Icon, Loader2 } from "lucide-react"
import currency from 'currency.js'
import { Bar } from 'react-chartjs-2'
import { Chart, LinearScale, CategoryScale, BarElement, Title, Tooltip, Legend, TooltipItem, PointElement, ArcElement } from 'chart.js'

import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from "@/components/ui/alert-dialog"
import { deleteTransaction, fetchTransactions, Transaction, updateTransaction } from "@/lib/supabase/data-services/transactions"
import { CurrencyCode, Asset, updateAsset, CURRENCIES, fetchAssets, createAsset, deleteAsset } from "@/lib/supabase/data-services/assets"
import { createLiability, deleteLiability, fetchLiabilities, Liability, updateLiability } from "@/lib/supabase/data-services/liabilities"

// Register Chart.js components
Chart.register(LinearScale, CategoryScale, BarElement, Title, Tooltip, Legend, PointElement, ArcElement)

type UserCurrencyPreference = {
  code: CurrencyCode
  isPreferred: boolean
}

const EXCHANGE_RATES: Record<CurrencyCode, number> = {
  USD: 1,
  ARS: 1130,
  BRL: 5.69,
  COP: 4223
}

// Add new types and state for per-currency totals
type CurrencyTotals = {
  [key in CurrencyCode]: {
    assets: number;
    liabilities: number;
  }
}

const calculateSpendingByCategory = (transactions: Transaction[]): Record<string, number> => {
  const spendingByCategory: Record<string, number> = {};
  transactions.forEach((transaction) => {
    if (transaction.type === 'expense') {
      const category = transaction.category.name;
      if (!spendingByCategory[category]) {
        spendingByCategory[category] = 0;
      }
      spendingByCategory[category] += transaction.amount;
    }
  });
  return spendingByCategory;
};

// Helper to get unique months from transactions
function getTransactionMonths(transactions: Transaction[]) {
  const months = new Set<string>();
  transactions.forEach(t => {
    if (t.type === 'expense') {
      const d = parseISO(t.date as unknown as string)
      months.add(format(d, 'yyyy-MM'));
    }
  });
  // Sort descending (most recent first)
  return Array.from(months)
    .sort((a, b) => b.localeCompare(a))
    .map(ym => {
      const date = parseISO(ym + '-01');
      return {
        value: startOfMonth(date),
        label: format(date, 'MMMM yyyy'),
      };
    });
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
  const [isEditTxOpen, setIsEditTxOpen] = useState(false)
  const [isDeleteTxOpen, setIsDeleteTxOpen] = useState(false)
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null)
  const [editTxForm, setEditTxForm] = useState({
    description: "",
    amount: "",
    date: "",
    categoryId: ""
  })
  const [editTxLoading, setEditTxLoading] = useState(false)
  const [deleteTxLoading, setDeleteTxLoading] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState<Date>(startOfMonth(new Date()))

  const monthOptions = getTransactionMonths(recentTransactions)

  // Filter transactions by selected month
  const monthStart = startOfMonth(selectedMonth)
  const monthEnd = endOfMonth(selectedMonth)
  const filteredExpenses = recentTransactions.filter(t =>
    t.type === 'expense' &&
    isWithinInterval(parseISO(t.date as unknown as string), { start: monthStart, end: monthEnd })
  )
  const spendingByCategory = calculateSpendingByCategory(filteredExpenses)

  const data = {
    labels: Object.keys(spendingByCategory),
    datasets: [
      {
        data: Object.values(spendingByCategory).map(Math.abs),
        backgroundColor: Object.keys(spendingByCategory).map(
          (category) => {
            const color = filteredExpenses.find(t => t.category.name === category)?.category.color || '#000'
            return `${color}80` // Use pastel colors by adding transparency
          }
        ),
        borderColor: Object.keys(spendingByCategory).map(
          (category) => filteredExpenses.find(t => t.category.name === category)?.category.color || '#000'
        ),
        borderWidth: 1,
      },
    ],
  }

  const options = {
    indexAxis: 'y' as const, // Horizontal bars
    responsive: true,
    scales: {
      x: {
        display: false, // Hide x axis
        grid: { display: false, drawBorder: false },
        ticks: { display: false },
      },
      y: {
        beginAtZero: true,
        reverse: false,
        grid: { display: false, drawBorder: false },
        ticks: {
          color: '#6b7280',
          font: { 
            family: 'Inter, sans-serif', 
            size: (context: any) => {
              const width = context.chart.width;
              return width < 360 ? 8 : 14;
            }
          },
          callback: function(value: string | number, index: number) {
            const category = Object.keys(spendingByCategory)[index];
            const icon = filteredExpenses.find(t => t.category.name === category)?.category.icon || '';
            return icon; // Only show icons
          },
          padding: 2,
          display: true,
        },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        backgroundColor: '#fff',
        titleColor: '#111827',
        bodyColor: '#111827',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        callbacks: {
          label: function(tooltipItem: TooltipItem<'bar'>) {
            const category = tooltipItem.label;
            const amount = tooltipItem.raw as number;
            const currencyCode = assets.find(a => a.id === filteredExpenses.find(t => t.category.name === category)?.asset.id)?.currency || 'USD';
            return `${formatCurrency(amount, currencyCode)}`;
          },
        },
        padding: 10,
        caretSize: 6,
        cornerRadius: 8,
        displayColors: false,
      },
    },
    elements: {
      bar: {
        borderRadius: 6, // Rounded corners
        borderSkipped: 'left' as const,
      },
    },
    maintainAspectRatio: true,
    backgroundColor: 'transparent',
  }

  const fetchData = useCallback(async () => {
    try {
      if (!user) {
        router.push("/login")
        return
      }

      setLoading(true)

      // Fetch assets
      const assetsData = await fetchAssets()

      // Fetch liabilities
      const liabilitiesData = await fetchLiabilities()

      // Fetch recent transactions
      const transformedTransactions = await fetchTransactions()

      // Set state with type assertions and transformations
      setAssets(assetsData as Asset[] || [])
      setLiabilities(liabilitiesData as Liability[] || [])
      
      // Transactions data comes transformed to ensure required fields
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
        newCurrencyTotals[liability.currency as CurrencyCode].liabilities += Number(liability.value)
      })

      // Now filter for currencies with non-zero values
      const filteredCurrencyTotals = Object.entries(newCurrencyTotals)
        .filter(([currency, totals]) => totals.assets > 0 || totals.liabilities > 0);

      // If there is only one currency with non-zero values, set it as the display currency
      if (filteredCurrencyTotals.length === 1) {
        setDisplayCurrency(filteredCurrencyTotals[0][0] as CurrencyCode)
      }

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
          return sum + convertCurrency(Number(liability.value), liability.currency as CurrencyCode, displayCurrency)
        }
        return sum + Number(liability.value)
      }, 0)

      setTotalAssets(assetsTotal)
      setTotalLiabilities(liabilitiesTotal)
      setEquity(assetsTotal - liabilitiesTotal)

      // Calculate the total spending for the current month
      const totalSpending = filteredExpenses.reduce((sum, transaction) => sum + transaction.amount, 0)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load financial data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [router, user])

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
        return sum + convertCurrency(Number(liability.value), liability.currency as CurrencyCode, displayCurrency)
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
    liabilities.forEach(liability => currencySet.add(liability.currency as CurrencyCode))
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

      await updateAsset(selectedAsset.id, {
        name: editForm.name,
        type: editForm.type,
        value: Number(editForm.value),
        currency: editForm.currency,
      })

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

      await updateLiability(selectedLiability.id, {
        name: editForm.name,
        type: editForm.type,
        value: Number(editForm.value),
        currency: editForm.currency,
      })

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
      currency: liability.currency as CurrencyCode,
    })
    setIsEditLiabilityOpen(true)
  }

  const handleAddAsset = async () => {
    try {
      if (!editForm.name || !editForm.type || !editForm.value || !editForm.currency) {
        throw new Error("All fields are required")
      }

      await createAsset({
        name: editForm.name,
        type: editForm.type,
        value: Number(editForm.value),
        currency: editForm.currency,
        user_id: user?.id as string,
      })

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

      await createLiability({
        name: editForm.name,
        type: editForm.type,
        value: Number(editForm.value),
        currency: editForm.currency,
        user_id: user?.id as string,
      })

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

      if (itemToDelete.type === "asset") {
        await deleteAsset(itemToDelete.id)
      } else {
        await deleteLiability(itemToDelete.id)
      }

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

  const handleEditTransaction = async () => {
    if (!selectedTx) return
    setEditTxLoading(true)

    try {
      await updateTransaction(selectedTx.id, {
        description: editTxForm.description,
        amount: Number(editTxForm.amount),
        date: new Date(editTxForm.date),
        // category_id:  Uncomment if you add category selection
      })

      toast({ title: "Transaction updated", description: "The transaction was updated successfully." })
      setIsEditTxOpen(false)
      setSelectedTx(null)
      fetchData()
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to update transaction", variant: "destructive" })
    } finally {
      setEditTxLoading(false)
    }
  }

  const handleDeleteTransaction = async () => {
    if (!selectedTx) return
    setDeleteTxLoading(true)
    try {
      await deleteTransaction(selectedTx.id)
      toast({ title: "Transaction deleted", description: "The transaction was deleted successfully." })
      setIsDeleteTxOpen(false)
      setSelectedTx(null)
      fetchData()
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to delete transaction", variant: "destructive" })
    } finally {
      setDeleteTxLoading(false)
    }
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
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight">Financial Dashboard</h1>
          <p className="mt-2 text-md sm:text-xl text-muted-foreground">Your financial overview at a glance</p>
        </div>
        
        {userCurrencies.length > 1 && (
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
          {recentTransactions.length > 0 && (
            <Link href="/dashboard/transactions">
              <Button variant="outline" size="lg">View All Transactions</Button>
            </Link>
          )}
          <Link href="/dashboard/transactions/new">
            <Button size="lg">
              <PlusIcon className="mr-2 h-5 w-5" />
              New Transaction
            </Button>
          </Link>
        </div>
      </div>

      {/* Mobile view */}
      <div className="flex md:hidden justify-between w-full pb-8">
      {recentTransactions.length > 0 && (
        <Link href="/dashboard/transactions">
          <Button
            className="p-2" 
            variant="outline" 
            size="sm"
          >View All Transactions</Button>
        </Link>
      )}
        <Link 
          href={assets.length > 0 && liabilities.length > 0 ? "/dashboard/transactions/new" : ""}
        >
          <Button 
            className="p-2" 
            size="sm"
            onClick={() => {
              setEditForm({ name: "", type: "", value: "", currency: "COP" })
              setIsAddAssetOpen(true)
            }}
          >
            <PlusIcon className="mr-2 h-5 w-5" />
            {assets.length > 0 ? "New Transaction" : "Add Accounts"}
          </Button>
        </Link>
      </div>

      {/* Total Assets, Liabilities, and Net Worth */}
      <div className="grid gap-8 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Assets</CardTitle>
          </CardHeader>
          <CardContent>
            {!displayCurrency && Array.from(activeCurrencies).length === 0 && (
              <div className="text-3xl font-bold">$0,0</div>
            )}
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
            {!displayCurrency && Array.from(activeCurrencies).length === 0 && (
              <div className="text-3xl font-bold">$0,0</div>
            )}
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
            {!displayCurrency && Array.from(activeCurrencies).length === 0 && (
              <div className="text-3xl font-bold">$0,0</div>
            )}
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
        {/* Assets */}
        <Card>
          <CardHeader className="relative group">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl sm:text-2xl">Assets</CardTitle>
                <CardDescription>What you own</CardDescription>
              </div>
              <div className="block sm:hidden group-hover:block transition-opacity">
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
                <Button 
                  variant="outline" 
                  className="mt-4" 
                  onClick={() => {
                    setEditForm({ name: "", type: "", value: "", currency: "COP" })
                    setIsAddAssetOpen(true)
                  }}
                >
                  Add Assets
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Liabilities */}
        <Card>
          <CardHeader className="relative group">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl sm:text-2xl">Liabilities</CardTitle>
                <CardDescription>What you owe</CardDescription>
              </div>
              <div className="block sm:hidden group-hover:block transition-opacity">
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
                          ? formatCurrency(convertCurrency(Number(liability.value), liability.currency as CurrencyCode, displayCurrency), displayCurrency)
                          : formatCurrency(Number(liability.value), liability.currency as CurrencyCode)}
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
                <Button 
                  variant="outline" 
                  className="mt-4" 
                  onClick={() => {
                    setEditForm({ name: "", type: "", value: "", currency: "COP" })
                    setIsAddLiabilityOpen(true)
                  }}
                >
                  Add Liabilities
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Spending Summary */}
      <div className="mt-8">
        <Card className="flex flex-col sm:flex-row items-center">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl sm:text-2xl">Spending Summary</CardTitle>
              {monthOptions.length > 0 && (
                <CardDescription>
                  Your spending by category for{" "}
                  <select
                    className="border rounded px-1 py-1 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    value={format(selectedMonth, "yyyy-MM")}
                    onChange={e => setSelectedMonth(startOfMonth(parseISO(e.target.value + "-01")))}
                  >
                    {monthOptions.map(opt => (
                      <option key={opt.label} value={format(opt.value, "yyyy-MM")}>{opt.label}</option>
                    ))}
                  </select>
                </CardDescription>
              )}
            </div>
          </CardHeader>
          <CardContent className="py-0 sm:p-6 w-max sm:w-1/3">
            {Object.keys(spendingByCategory).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-muted-foreground">No spending data available</p>
              </div>
            ) : (
              <Bar data={data} options={options} />
            )}
          </CardContent>
          <CardContent className="py-0 sm:p-6 flex-1 w-full">
            {/* Totals for selected month */}
            {(() => {
              // Filter income and expenses for the selected month
              const filteredIncomes = recentTransactions.filter(t =>
                t.type === 'income' &&
                isWithinInterval(parseISO(t.date as unknown as string), { start: monthStart, end: monthEnd })
              );
              const filteredExpenses = recentTransactions.filter(t =>
                t.type === 'expense' &&
                isWithinInterval(parseISO(t.date as unknown as string), { start: monthStart, end: monthEnd })
              );
              // Sum by currency
              const incomeTotals: { [key: string]: number } = {};
              const expenseTotals: { [key: string]: number } = {};
              filteredIncomes.forEach(t => {
                const assetObj = assets.find(a => a.id === t.asset?.id);
                const currency = assetObj?.currency || 'USD';
                incomeTotals[currency] = (incomeTotals[currency] || 0) + t.amount;
              });
              filteredExpenses.forEach(t => {
                const assetObj = assets.find(a => a.id === t.asset?.id);
                const currency = assetObj?.currency || 'USD';
                expenseTotals[currency] = (expenseTotals[currency] || 0) + t.amount;
              });
              // If displayCurrency is set, convert and sum
              let totalIncome = 0;
              let totalExpense = 0;
              if (displayCurrency) {
                totalIncome = filteredIncomes.reduce((sum: number, t) => {
                  const assetObj = assets.find(a => a.id === t.asset?.id);
                  const currency = assetObj?.currency || 'USD';
                  return sum + convertCurrency(t.amount, currency, displayCurrency);
                }, 0);
                totalExpense = filteredExpenses.reduce((sum: number, t) => {
                  const assetObj = assets.find(a => a.id === t.asset?.id);
                  const currency = assetObj?.currency || 'USD';
                  return sum + convertCurrency(t.amount, currency, displayCurrency);
                }, 0);
              }
              return (
                <>
                  {Object.keys(spendingByCategory).length > 0 && (
                    <div className="flex flex-col flex-col md:flex-row gap-4 mb-4 sm:mb-0 py-6 sm:py-0">
                      <div className="flex-1 flex flex-col items-center justify-center bg-green-50 rounded p-2">
                        <span className="text-xs text-green-700">Total Income</span>
                        {displayCurrency ? (
                          <span className="text-lg font-bold text-green-700">{formatCurrency(totalIncome, displayCurrency)}</span>
                        ) : (
                          <div className="flex flex-col gap-1">
                            {Object.keys(incomeTotals).length === 0 ? <span className="text-muted-foreground">-</span> :
                              Object.entries(incomeTotals).map(([currency, amount]) => (
                                <span key={currency} className="text-lg font-bold text-green-700 whitespace-nowrap">{formatCurrency(amount, currency as CurrencyCode)}</span>
                              ))}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 flex flex-col items-center justify-center bg-red-50 rounded p-2">
                        <span className="text-xs text-red-700">Total Expenses</span>
                        {displayCurrency ? (
                          <span className="text-lg font-bold text-red-700">{formatCurrency(Math.abs(totalExpense), displayCurrency)}</span>
                        ) : (
                          <div className="flex flex-col gap-1">
                            {Object.keys(expenseTotals).length === 0 ? <span className="text-muted-foreground">-</span> :
                              Object.entries(expenseTotals).map(([currency, amount]) => (
                                <span key={currency} className="text-lg font-bold text-red-700 whitespace-nowrap">{formatCurrency(Math.abs(amount), currency as CurrencyCode)}</span>
                              ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <div className="mt-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl sm:text-2xl">Recent Transactions</CardTitle>
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
                <Link href="/dashboard/transactions/new">
                  <Button>Add Your First Transaction</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Filter the transactions to only show the latest 5 */}
                {recentTransactions.filter((t, i) => i < 5).map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between py-2 px-2 sm:p-4 rounded-lg border group hover:bg-accent hover:cursor-pointer"
                    role="group"
                    tabIndex={0}
                    onClick={e => {
                      // Prevent navigation if clicking on edit/delete buttons
                      if ((e.target as HTMLElement).closest('button')) return;
                      router.push(`/dashboard/transactions/${transaction.id}`)
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="flex h-7 w-7 sm:h-10 sm:w-10 items-center justify-center p-2 rounded-full"
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
                        <p className="text-sm sm:text-md truncate whitespace-nowrap overflow-hidden w-36 sm:w-2/3 md:w-full">
                          {transaction.description || (transaction.type === "income" ? "Income" : "Expense")}
                        </p>
                        <p className="text-sm text-muted-foreground w-3/3">
                          {transaction.asset?.name || "No account"} •{" "}
                          {format(new Date(transaction.date), "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center sm:gap-2 gap-1">
                      <div
                        className={`text-sm sm:text-md whitespace-nowrap ${transaction.type === "income" ? "text-green-600" : "text-red-600"}`}
                      >
                        {`$ ${Math.abs(Number(transaction.amount)).toLocaleString()}`}
                      </div>
                      <div className="hidden sm:flex">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => {
                            setSelectedTx(transaction)
                            setEditTxForm({
                              description: transaction.description,
                              amount: transaction.amount.toString(),
                              date: transaction.date.toISOString().slice(0, 10),
                              categoryId: transaction.category?.id || ""
                            })
                            setIsEditTxOpen(true)
                        }}>
                          <PencilIcon className="h-1 w-1 sm:h-4 sm:w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => {
                          setSelectedTx(transaction)
                          setIsDeleteTxOpen(true)
                        }}>
                          <Trash2Icon className="h-4 w-4 text-black-600" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
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

      {/* Edit Transaction Dialog */}
      <Dialog open={isEditTxOpen} onOpenChange={setIsEditTxOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Transaction</DialogTitle>
            <DialogDescription>Update your transaction details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="tx-description" className="block text-sm font-medium">Description</label>
              <Input
                id="tx-description"
                value={editTxForm.description}
                onChange={e => setEditTxForm(f => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="tx-amount" className="block text-sm font-medium">Amount</label>
              <Input
                id="tx-amount"
                type="number"
                value={editTxForm.amount}
                onChange={e => setEditTxForm(f => ({ ...f, amount: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="tx-date" className="block text-sm font-medium">Date</label>
              <Input
                id="tx-date"
                type="date"
                value={editTxForm.date}
                onChange={e => setEditTxForm(f => ({ ...f, date: e.target.value }))}
              />
            </div>
            {/* Category selection can be added here if you have categories list */}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditTxOpen(false)} disabled={editTxLoading}>
              Cancel
            </Button>
            <Button onClick={handleEditTransaction} disabled={editTxLoading}>
              {editTxLoading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Transaction AlertDialog */}
      <AlertDialog open={isDeleteTxOpen} onOpenChange={setIsDeleteTxOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this transaction? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteTxLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTransaction} disabled={deleteTxLoading}>
              {deleteTxLoading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
