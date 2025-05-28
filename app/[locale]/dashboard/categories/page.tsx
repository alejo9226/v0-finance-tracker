'use client'

import { PlusIcon, Trash2Icon, PencilIcon } from 'lucide-react'
import type React from 'react'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/contexts/auth-context'
import { useToast } from '@/hooks/use-toast'
import {
  Category,
  createCategory,
  deleteCategory,
  fetchCategories,
  updateCategory,
} from '@/lib/supabase/data-services/categories'
import {
  fetchCountTransactionsByCategory,
  removeCategoryFromTransactions,
} from '@/lib/supabase/data-services/transactions'
import { useI18n } from '@/locales/client'

export default function CategoriesPage() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('expense')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    type: '' as 'income' | 'expense',
    icon: '',
    color: '#4CAF50',
  })
  const t = useI18n()

  // Color options
  const colorOptions = [
    '#4CAF50',
    '#F44336',
    '#2196F3',
    '#FF9800',
    '#9C27B0',
    '#607D8B',
    '#E91E63',
    '#00BCD4',
    '#FFC107',
    '#795548',
  ]

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab])

  const fetchData = async () => {
    try {
      setLoading(true)

      const data = await fetchCategories(activeTab as 'income' | 'expense')

      setCategories(data || [])
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      toast({
        title: 'Error',
        description: errorMessage || 'Failed to load categories',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    if (name === 'icon') {
      const emojiRegex = /^(\p{Emoji_Presentation}|\p{Emoji}\uFE0F|\p{Extended_Pictographic})+$/u

      if (emojiRegex.test(value) || value === '') {
        setFormData((prev) => ({ ...prev, icon: value }))
      } else {
        toast({
          title: 'Invalid emoji',
          description: 'Please enter a valid emoji',
          variant: 'destructive',
        })
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleAddCategory = async () => {
    try {
      if (!formData.name) {
        throw new Error('Category name is required')
      }

      await createCategory({
        name: formData.name,
        type: activeTab as 'income' | 'expense',
        icon: formData.icon,
        color: formData.color,
        user_id: user?.id as string,
      })

      toast({
        title: 'Category added',
        description: 'Your category has been added successfully',
      })

      setIsAddDialogOpen(false)
      setFormData({
        name: '',
        type: activeTab as 'income' | 'expense',
        icon: '💰',
        color: '#4CAF50',
      })
      fetchData()
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      toast({
        title: 'Error',
        description: errorMessage || 'Failed to add category',
        variant: 'destructive',
      })
    }
  }

  const handleEditCategory = async () => {
    try {
      if (!selectedCategory || !formData.name) {
        throw new Error('Category name is required')
      }

      await updateCategory(selectedCategory.id, {
        name: formData.name,
        icon: formData.icon,
        color: formData.color,
      })

      toast({
        title: 'Category updated',
        description: 'Your category has been updated successfully',
      })

      setIsEditDialogOpen(false)
      setSelectedCategory(null)
      fetchData()
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      toast({
        title: 'Error',
        description: errorMessage || 'Failed to update category',
        variant: 'destructive',
      })
    }
  }

  const handleDeleteCategory = async () => {
    try {
      if (!selectedCategory) {
        throw new Error('No category selected')
      }

      // Check if category is used in transactions
      const count = await fetchCountTransactionsByCategory(selectedCategory.id)

      if (count > 0) {
        // If category is used, update transactions to remove category reference
        await removeCategoryFromTransactions(selectedCategory.id)
      }

      // Delete the category
      await deleteCategory(selectedCategory.id)

      toast({
        title: 'Category deleted',
        description: 'Your category has been deleted successfully',
      })

      setIsDeleteDialogOpen(false)
      setSelectedCategory(null)
      fetchData()
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      toast({
        title: 'Error',
        description: errorMessage || 'Failed to delete category',
        variant: 'destructive',
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
          <h2 className="text-xl font-semibold">{t('common.loading')}</h2>
          <p className="text-muted-foreground">Please wait while we load your categories</p>
        </div>
      </div>
    )
  }

  return (
    <div className="py-8 max-w-4xl mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div className="mb-8 space-y-2">
          <h1 className="text-3xl font-bold">{t('categories.title')}</h1>
          <p className="text-muted-foreground">{t('categories.subtitle')}</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <PlusIcon className="h-5 w-5 md:mr-2" />
          <span
            className="hidden md:inline"
          >
            {t('categories.categories.buttons.add-category')}
          </span>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-2">
              <CardTitle>{t('categories.categories.title', { type: t(`categories.categories.filters.${activeTab as 'income' | 'expense'}`) })}</CardTitle>
              <CardDescription>
                {t('categories.categories.subtitle', { type: t(`categories.categories.filters.${activeTab as 'income' | 'expense'}`).toLowerCase() })}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="expense">{t('categories.categories.filters.expense')}</TabsTrigger>
              <TabsTrigger value="income">{t('categories.categories.filters.income')}</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              <Card>
                <CardContent>
                  {categories.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8">
                      <p className="text-muted-foreground mb-4">{t('common.categories.no-data')}</p>
                      <Button onClick={() => setIsAddDialogOpen(true)}>
                        {t('common.categories.first-category')}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4 pt-4 sm:pt-0">
                      {categories.map((category) => (
                        <div
                          key={category.id}
                          className="flex items-center justify-between p-4 rounded-lg border"
                        >
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
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDialog(category)}
                            >
                              <PencilIcon className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openDeleteDialog(category)}
                            >
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
            <DialogTitle>{t('common.categories.add.title')}</DialogTitle>
            <DialogDescription>{t('common.categories.add.subtitle')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="add-name">{t('common.categories.add.name.translation')}</Label>
              <Input
                id="add-name"
                name="name"
                placeholder={t('common.categories.add.name.placeholder')}
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="icon-input">{t('common.categories.add.icon.translation')}</Label>
              <Input
                id="icon-input"
                name="icon"
                placeholder={t('common.categories.add.icon.placeholder')}
                type="text"
                value={formData.icon}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label>{t('common.categories.add.color')}</Label>
              <div className="grid grid-cols-10 gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`h-8 w-8 rounded-md ${formData.color === color ? 'ring-2 ring-offset-2 ring-primary' : ''
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
              {t('common.cancel')}
            </Button>
            <Button onClick={handleAddCategory}>{t('common.save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('common.categories.edit.title')}</DialogTitle>
            <DialogDescription>{t('common.categories.edit.subtitle')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">{t('common.categories.edit.name.translation')}</Label>
              <Input
                id="edit-name"
                name="name"
                placeholder={t('common.categories.edit.name.placeholder')}
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="icon-input">{t('common.categories.edit.icon.translation')}</Label>
              <Input
                id="icon-input"
                name="icon"
                placeholder={t('common.categories.edit.icon.placeholder')}
                type="text"
                value={formData.icon}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label>{t('common.categories.edit.color')}</Label>
              <div className="grid grid-cols-10 gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`h-8 w-8 rounded-md ${formData.color === color ? 'ring-2 ring-offset-2 ring-primary' : ''
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
              {t('common.cancel')}
            </Button>
            <Button onClick={handleEditCategory}>{t('common.save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Category Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('common.delete.title')}</DialogTitle>
            <DialogDescription>
              {t('common.delete.subtitle', { type: t('common.category').toLowerCase() })}
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
              {t('common.cancel')}
            </Button>
            <Button variant="destructive" onClick={handleDeleteCategory}>
              {t('common.delete.translation')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
