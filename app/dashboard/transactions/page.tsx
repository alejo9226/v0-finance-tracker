"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { PlusIcon, FilterIcon } from "lucide-react"

import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"

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

export default function TransactionsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    fetchTransactions()
  }, [activeTab])

  const fetchTransactions = async () => {
    try {
      setLoading(true)

      let query = supabase
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

      if (activeTab !== "all") {
        query = query.eq("type", activeTab)
      }

      const { data, error } = await query
        .order("date", { ascending: false })
        .returns<Transaction[]>()

      if (error) throw error

      setTransactions(data || [])
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load transactions",
        variant: "destructive",
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
    <div className="container py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Transactions</h1>
        <Button onClick={() => router.push("/dashboard/transactions/new")}>
          <PlusIcon className="mr-2 h-4 w-4" />
          New Transaction
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Input
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            <FilterIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
        </div>
        <div>
          <Link href="/dashboard/categories">
            <Button variant="outline">Manage Categories</Button>
          </Link>
        </div>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="income">Income</TabsTrigger>
          <TabsTrigger value="expense">Expenses</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          <Card>
            <CardHeader>
              <CardTitle>
                {activeTab === "all" ? "All Transactions" : activeTab === "income" ? "Income" : "Expenses"}
              </CardTitle>
              <CardDescription>
                {filteredTransactions.length} {filteredTransactions.length === 1 ? "transaction" : "transactions"}{" "}
                found
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="text-center">
                    <p className="text-muted-foreground">Loading transactions...</p>
                  </div>
                </div>
              ) : filteredTransactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <p className="text-muted-foreground mb-4">No transactions found</p>
                  <Button onClick={() => router.push("/dashboard/transactions/new")}>Add your first transaction</Button>
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
        </TabsContent>
      </Tabs>
    </div>
  )
} 