"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { ArrowDown, ArrowUp, CreditCard, DollarSign, Landmark, PlusIcon, Wallet } from "lucide-react"

import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"

type Asset = {
  id: string
  type: string
  name: string
  value: number
}

type Liability = {
  id: string
  type: string
  name: string
  value: number
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

export default function DashboardPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const [assets, setAssets] = useState<Asset[]>([])
  const [liabilities, setLiabilities] = useState<Liability[]>([])
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [totalAssets, setTotalAssets] = useState(0)
  const [totalLiabilities, setTotalLiabilities] = useState(0)
  const [equity, setEquity] = useState(0)
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!user) {
          router.push("/login")
          return
        }

        // Fetch assets
        const { data: assetsData, error: assetsError } = await supabase.from("assets").select("*").order("name")

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

        // Calculate totals
        const assetsTotal = assetsData ? assetsData.reduce((sum, asset) => sum + Number(asset.value), 0) : 0
        const liabilitiesTotal = liabilitiesData
          ? liabilitiesData.reduce((sum, liability) => sum + Number(liability.value), 0)
          : 0

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
    }

    fetchData()
  }, [router, supabase, toast, user])

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
      <div className="mb-12 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Financial Dashboard</h1>
          <p className="mt-2 text-lg text-muted-foreground">Your financial overview at a glance</p>
        </div>
        <div className="flex gap-4">
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
            <div className="text-3xl font-bold">${totalAssets.toLocaleString()}</div>
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
            <div className="text-3xl font-bold">${totalLiabilities.toLocaleString()}</div>
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
            <div className="text-3xl font-bold text-green-800">${equity.toLocaleString()}</div>
            <div className="mt-2 flex items-center text-sm text-green-700">
              <span>Assets - Liabilities</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-12 grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Assets</CardTitle>
            <CardDescription>What you own</CardDescription>
          </CardHeader>
          <CardContent>
            {assets.length > 0 ? (
              <div className="space-y-4">
                {assets.map((asset) => (
                  <div key={asset.id} className="flex items-center justify-between">
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
                    <p className="font-medium">${Number(asset.value).toLocaleString()}</p>
                  </div>
                ))}
                <Separator />
                <div className="flex items-center justify-between font-bold">
                  <span>Total</span>
                  <span>${totalAssets.toLocaleString()}</span>
                </div>
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
          <CardHeader>
            <CardTitle>Liabilities</CardTitle>
            <CardDescription>What you owe</CardDescription>
          </CardHeader>
          <CardContent>
            {liabilities.length > 0 ? (
              <div className="space-y-4">
                {liabilities.map((liability) => (
                  <div key={liability.id} className="flex items-center justify-between">
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
                    <p className="font-medium">${Number(liability.value).toLocaleString()}</p>
                  </div>
                ))}
                <Separator />
                <div className="flex items-center justify-between font-bold">
                  <span>Total</span>
                  <span>${totalLiabilities.toLocaleString()}</span>
                </div>
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
            <Link href="/transactions">
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
    </div>
  )
}
