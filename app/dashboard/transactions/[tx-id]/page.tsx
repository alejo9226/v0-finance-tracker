"use client"

import { format } from "date-fns"
import { PencilIcon, Trash2Icon, Loader2 } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import { useEffect, useState } from "react"

import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { deleteTransaction, fetchTransactionById, updateTransaction, Transaction } from "@/lib/supabase/data-services/transactions"

export default function TransactionDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [transaction, setTransaction] = useState<Transaction | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [editForm, setEditForm] = useState({
    description: "",
    amount: "",
    date: "",
    // categoryId: ""
  })
  const [editLoading, setEditLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  useEffect(() => {
    fetchTransaction()
    // eslint-disable-next-line
  }, [params["tx-id"]])

  async function fetchTransaction() {
    try {
      setLoading(true)
      setError("")
      const id = params["tx-id"]
      const data = await fetchTransactionById(id as string)
      setTransaction(data)
    } catch (error: any) {
      setTransaction(null)
      setError(error.message || "Transaction not found.")
    } finally {
      setLoading(false)
    }
  }

  const openEdit = () => {
    setEditForm({
      description: transaction?.description || "",
      amount: transaction?.amount.toString() || "",
      date: format(transaction?.date || new Date(), "yyyy-MM-dd") || "",
    })
    setIsEditOpen(true)
  }

  const handleEdit = async () => {
    if (!transaction) return
    setEditLoading(true)
    try {
      await updateTransaction(transaction.id, {
        description: editForm.description,
        amount: Number(editForm.amount),
        date: new Date(editForm.date),
        // category_id: editForm.categoryId,
      })
      toast({ title: "Transaction updated", description: "The transaction was updated successfully." })
      setIsEditOpen(false)
      fetchTransaction()
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to update transaction", variant: "destructive" })
    } finally {
      setEditLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!transaction) return
    setDeleteLoading(true)
    try {
      await deleteTransaction(transaction.id)

      toast({ title: "Transaction deleted", description: "The transaction was deleted successfully." })
      setIsDeleteOpen(false)
      router.push("/dashboard/transactions")
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to delete transaction", variant: "destructive" })
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
      <div className="flex h-96 items-center justify-center text-destructive font-semibold">{error}</div>
    )
  }

  return (
    <div className="container py-10 max-w-xl">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl">Transaction Details</CardTitle>
            <CardDescription>View and manage this transaction</CardDescription>
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
            <span className="font-semibold">Description:</span> {transaction?.description}
          </div>
          <div>
            <span className="font-semibold">Amount:</span> {transaction?.type === "income" ? "+" : "-"}${Math.abs(Number(transaction?.amount)).toLocaleString()}
          </div>
          <div>
            <span className="font-semibold">Date:</span> {format(new Date(transaction?.date || ""), "MMM d, yyyy")}
          </div>
          <div>
            <span className="font-semibold">Category:</span> {transaction?.category?.name || "Uncategorized"}
          </div>
          <div>
            <span className="font-semibold">Account:</span> {transaction?.asset?.name || "No account"}
          </div>
          <div>
            <span className="font-semibold">Type:</span> {`${transaction?.type?.charAt(0).toUpperCase()}${transaction?.type?.slice(1)}`}
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
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
                value={editForm.description}
                onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="tx-amount" className="block text-sm font-medium">Amount</label>
              <Input
                id="tx-amount"
                type="number"
                value={editForm.amount}
                onChange={e => setEditForm(f => ({ ...f, amount: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="tx-date" className="block text-sm font-medium">Date</label>
              <Input
                id="tx-date"
                type="date"
                value={editForm.date}
                onChange={e => setEditForm(f => ({ ...f, date: e.target.value }))}
              />
            </div>
            {/* Category selection can be added here if you have categories list */}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)} disabled={editLoading}>
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={editLoading}>
              {editLoading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete AlertDialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this transaction? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleteLoading}>
              {deleteLoading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}