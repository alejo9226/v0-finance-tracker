"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { PlusIcon, Trash2Icon, PencilIcon } from "lucide-react"
import { useRouter } from "next/navigation"

import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { Category, fetchCountTransactionsByCategory } from "@/lib/supabase/dataService"

export default function CategoriesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("expense")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    type: "" as "income" | "expense",
    icon: "",
    color: "#4CAF50",
  })
  const supabase = getSupabaseBrowserClient()

  // Color options
  const colorOptions = [
    "#4CAF50",
    "#F44336",
    "#2196F3",
    "#FF9800",
    "#9C27B0",
    "#607D8B",
    "#E91E63",
    "#00BCD4",
    "#FFC107",
    "#795548",
  ]

  useEffect(() => {
    fetchCategories()
  }, [activeTab])

  const fetchCategories = async () => {
    try {
      setLoading(true)

      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("type", activeTab)
        .order("name")
        .returns<Category[]>()

      if (error) throw error

      setCategories(data || [])
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load categories",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    if (name === "icon") {
      const emojiRegex = /^(\p{Emoji_Presentation}|\p{Emoji}\uFE0F|\p{Extended_Pictographic})+$/u

      if (emojiRegex.test(value) || value === "") {
        setFormData((prev) => ({ ...prev, icon: value }))
      } else {
        toast({
          title: "Invalid emoji",
          description: "Please enter a valid emoji",
          variant: "destructive",
        })
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleAddCategory = async () => {
    try {
      if (!formData.name) {
        throw new Error("Category name is required")
      }

      const { error } = await supabase.from("categories").insert({
        name: formData.name,
        type: activeTab as "income" | "expense",
        icon: formData.icon,
        color: formData.color,
        user_id: user?.id
      })

      console.log('error', error)

      if (error) throw error

      toast({
        title: "Category added",
        description: "Your category has been added successfully",
      })

      setIsAddDialogOpen(false)
      setFormData({
        name: "",
        type: activeTab as "income" | "expense",
        icon: "💰",
        color: "#4CAF50",
      })
      fetchCategories()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add category",
        variant: "destructive",
      })
    }
  }

  const handleEditCategory = async () => {
    try {
      if (!selectedCategory || !formData.name) {
        throw new Error("Category name is required")
      }

      const { error } = await supabase
        .from("categories")
        .update({
          name: formData.name,
          icon: formData.icon,
          color: formData.color,
        })
        .eq("id", selectedCategory.id)

      if (error) throw error

      toast({
        title: "Category updated",
        description: "Your category has been updated successfully",
      })

      setIsEditDialogOpen(false)
      setSelectedCategory(null)
      fetchCategories()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update category",
        variant: "destructive",
      })
    }
  }

  const handleDeleteCategory = async () => {
    try {
      if (!selectedCategory) {
        throw new Error("No category selected")
      }

      // Check if category is used in transactions
      const count = await fetchCountTransactionsByCategory(selectedCategory.id)

      if (count > 0) {
        // If category is used, update transactions to remove category reference
        const { error: updateError } = await supabase
          .from("transactions")
          .update({ category_id: null })
          .eq("category_id", selectedCategory.id)

        if (updateError) throw updateError
      }

      // Delete the category
      const { error } = await supabase.from("categories").delete().eq("id", selectedCategory.id)

      if (error) throw error

      toast({
        title: "Category deleted",
        description: "Your category has been deleted successfully",
      })

      setIsDeleteDialogOpen(false)
      setSelectedCategory(null)
      fetchCategories()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete category",
        variant: "destructive",
      })
    }
  }

  const openEditDialog = (category: Category) => {
    setSelectedCategory(category)
    setFormData({
      name: category.name,
      type: category.type,
      icon: category.icon,
      color: category.color,
    })
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (category: Category) => {
    setSelectedCategory(category)
    setIsDeleteDialogOpen(true)
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Loading...</h2>
          <p className="text-muted-foreground">Please wait while we load your categories</p>
        </div>
      </div>
    )
  }

  return (
    <div className="py-8 max-w-4xl mx-auto">
      <div className="mb-8 space-y-4">
        <h1 className="text-3xl font-bold">Categories</h1>
        <p className="text-muted-foreground">Manage your income and expense categories</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Manage Categories</CardTitle>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <PlusIcon className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="expense">Expenses</TabsTrigger>
              <TabsTrigger value="income">Income</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              <Card>
                <CardHeader>
                  <CardTitle>{activeTab === "expense" ? "Expense Categories" : "Income Categories"}</CardTitle>
                  <CardDescription>
                    Manage your {activeTab === "expense" ? "expense" : "income"} categories
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {categories.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8">
                      <p className="text-muted-foreground mb-4">No categories found</p>
                      <Button onClick={() => setIsAddDialogOpen(true)}>Add your first category</Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {categories.map((category) => (
                        <div key={category.id} className="flex items-center justify-between p-4 rounded-lg border">
                          <div className="flex items-center gap-4">
                            <div
                              className="flex h-10 w-10 items-center justify-center rounded-full"
                              style={{
                                backgroundColor: `${category.color}20`,
                                color: category.color,
                              }}
                            >
                              <span className="text-lg">{category.icon}</span>
                            </div>
                            <div>
                              <p className="font-medium">{category.name}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" onClick={() => openEditDialog(category)}>
                              <PencilIcon className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(category)}>
                              <Trash2Icon className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Add Category Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Category</DialogTitle>
            <DialogDescription>Add your category details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="add-name">Category Name</Label>
              <Input
                id="add-name"
                name="name"
                placeholder="e.g., Groceries"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="icon-input">Icon</Label>
              <Input
                id="icon-input"
                name="icon"
                placeholder="e.g., 🍔"
                type="text"
                value={formData.icon}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label>Color</Label>
              <div className="grid grid-cols-10 gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`h-8 w-8 rounded-md ${
                      formData.color === color ? "ring-2 ring-offset-2 ring-primary" : ""
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setFormData((prev) => ({ ...prev, color }))}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddCategory}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>Update your category details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Category Name</Label>
              <Input
                id="edit-name"
                name="name"
                placeholder="e.g., Groceries"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="icon-input">Icon</Label>
              <Input
                id="icon-input"
                name="icon"
                placeholder="e.g., 🍔"
                type="text"
                value={formData.icon}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label>Color</Label>
              <div className="grid grid-cols-10 gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`h-8 w-8 rounded-md ${
                      formData.color === color ? "ring-2 ring-offset-2 ring-primary" : ""
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setFormData((prev) => ({ ...prev, color }))}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditCategory}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Category Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this category? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedCategory && (
              <div className="flex items-center gap-4">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full"
                  style={{
                    backgroundColor: `${selectedCategory.color}20`,
                    color: selectedCategory.color,
                  }}
                >
                  <span className="text-lg">{selectedCategory.icon}</span>
                </div>
                <p className="font-medium">{selectedCategory.name}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteCategory}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
