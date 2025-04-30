"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowDown, ArrowUp, CreditCard, DollarSign, Landmark, Wallet } from "lucide-react"

import { useAuth } from "@/contexts/auth-context"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { AuthCheck } from "@/components/auth-check"
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

export default function DashboardPage() {
  const router = useRouter()
  const { user, signOut } = useAuth()
  const { toast } = useToast()
  const [assets, setAssets] = useState<Asset[]>([])
  const [liabilities, setLiabilities] = useState<Liability[]>([])
  const [loading, setLoading] = useState(true)
  const [totalAssets, setTotalAssets] = useState(0)
  const [totalLiabilities, setTotalLiabilities] = useState(0)
  const [equity, setEquity] = useState(0)
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return

      try {
        // Fetch assets
        const { data: assetsData, error: assetsError } = await supabase
          .from("assets")
          .select("*")
          .eq("user_id", user.id)

        if (assetsError) throw assetsError

        // Fetch liabilities
        const { data: liabilitiesData, error: liabilitiesError } = await supabase
          .from("liabilities")
          .select("*")
          .eq("user_id", user.id)

        if (liabilitiesError) throw liabilitiesError

        // Set state
        setAssets(assetsData || [])
        setLiabilities(liabilitiesData || [])

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
  }, [user, supabase, toast])

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
    <AuthCheck>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b">
          <div className="container flex h-16 items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-xl">
              <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center text-white">F</div>
              FinanceTrack
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">Welcome, {user?.user_metadata?.name || "User"}</span>
              <Button variant="outline" size="sm" onClick={signOut}>
                Logout
              </Button>
            </div>
          </div>
        </header>

        <main className="container py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Financial Dashboard</h1>
            <p className="text-muted-foreground">Your financial overview at a glance</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Assets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${totalAssets.toLocaleString()}</div>
                <div className="mt-1 flex items-center text-xs text-green-500">
                  <ArrowUp className="mr-1 h-3 w-3" />
                  <span>What you own</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Liabilities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${totalLiabilities.toLocaleString()}</div>
                <div className="mt-1 flex items-center text-xs text-red-500">
                  <ArrowDown className="mr-1 h-3 w-3" />
                  <span>What you owe</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-green-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-green-800">Net Worth (Equity)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-800">${equity.toLocaleString()}</div>
                <div className="mt-1 flex items-center text-xs text-green-700">
                  <span>Assets - Liabilities</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
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
              <CardHeader>
                <CardTitle>Financial Health</CardTitle>
                <CardDescription>Key financial ratios and metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-3">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground">Debt-to-Asset Ratio</h3>
                    <div className="text-2xl font-bold">
                      {totalAssets > 0 ? (totalLiabilities / totalAssets).toFixed(2) : "N/A"}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {totalAssets > 0 && totalLiabilities / totalAssets < 0.5
                        ? "Good: Your debt is less than 50% of your assets"
                        : "Consider reducing your debt to improve this ratio"}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground">Net Worth Growth</h3>
                    <div className="text-2xl font-bold">--</div>
                    <p className="text-xs text-muted-foreground">Track your net worth over time to see growth</p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground">Financial Freedom</h3>
                    <div className="text-2xl font-bold">
                      {totalAssets > 0 ? Math.round((equity / totalAssets) * 100) + "%" : "N/A"}
                    </div>
                    <p className="text-xs text-muted-foreground">Percentage of your assets that are truly yours</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </AuthCheck>
  )
}
