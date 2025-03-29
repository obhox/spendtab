"use client"

import { useState, useEffect } from "react"
import { useCategories, Category } from "@/lib/context/CategoryContext"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { PlusCircle, Edit, Trash, AlertCircle } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import { CategoryForm } from "./category-form"
import { Badge } from "@/components/ui/badge"

export function CategoryManager() {
  const { categories, incomeCategories, expenseCategories, deleteCategory, isLoading } = useCategories()
  const [isDeleting, setIsDeleting] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  
  // Set initial tab value based on which category type has content
  const [tabValue, setTabValue] = useState(() => {
    // If we have expense categories but no income categories, default to expense tab
    if (incomeCategories.length === 0 && expenseCategories.length > 0) {
      return "expense"
    }
    // If we have income categories but no expense categories, default to income tab
    if (expenseCategories.length === 0 && incomeCategories.length > 0) {
      return "income"
    }
    // Default to income tab if both are empty or both have content
    return "income"
  })
  
  // Update tab value when categories change to handle async loading scenarios
  useEffect(() => {
    if (incomeCategories.length === 0 && expenseCategories.length > 0) {
      setTabValue("expense")
    } else if (expenseCategories.length === 0 && incomeCategories.length > 0) {
      setTabValue("income")
    }
    // Only run this effect when category arrays change
  }, [incomeCategories.length, expenseCategories.length])
  

  // Function to handle category deletion
  const handleDelete = async () => {
    if (!categoryToDelete) return
    
    setIsDeleting(true)
    try {
      await deleteCategory(categoryToDelete.id)
      toast("Category deleted", {
        description: `${categoryToDelete.name} has been deleted.`,
      })
    } catch (error) {
      // Check for specific error types
      if (error instanceof Error) {
        if (error.message === 'Cannot delete default categories') {
          toast("Error", {
            description: "Default categories cannot be deleted.",
          })
        } else if (error.message === 'Category not found') {
          toast("Error", {
            description: "The category could not be found.",
          })
        } else {
          toast("Error", {
            description: "Failed to delete category. Please try again.",
          })
        }
      } else {
        toast("Error", {
          description: "An unexpected error occurred. Please try again.",
        })
      }
    } finally {
      // Reset state regardless of success or failure
      setCategoryToDelete(null)
      setShowDeleteConfirm(false)
      setIsDeleting(false)
    }
  }

  // Function to open delete confirmation
  const confirmDelete = (category: Category) => {
    setCategoryToDelete(category)
    setShowDeleteConfirm(true)
  }

  // Function to render categories
  const renderCategories = (categoryList: Category[]) => {
    if (categoryList.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-40 text-center">
          <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-muted-foreground">No categories found</p>
          <p className="text-sm text-muted-foreground">Create your first category using the button below</p>
        </div>
      )
    }
    
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {categoryList.map((category) => (
          <Card key={category.id} className="relative">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center space-x-2 min-w-0 flex-1">
                  <div
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: category.color || '#888888' }}
                    aria-hidden="true"
                    title={`Color: ${category.color || '#888888'}`}
                  />
                  <span className="font-medium truncate">{category.name}</span>
                  {category.is_default && (
                    <Badge variant="outline" className="ml-2 flex-shrink-0">Default</Badge>
                  )}
                </div>
                <div className="flex space-x-1 ml-auto">
                  <CategoryForm category={category}>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </CategoryForm>
                  
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => confirmDelete(category)}
                    disabled={category.is_default || isLoading || isDeleting}
                    aria-label={`Delete ${category.name} category`}
                    className="h-8 w-8 p-0"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  // Show loading state when initially loading categories
  if (isLoading && categories.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Manage Categories</CardTitle>
          <CardDescription>
            Loading categories...
          </CardDescription>
        </CardHeader>
        <div className="flex justify-center items-center h-[350px]">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-8 w-8 bg-muted rounded-full mb-4"></div>
            <div className="h-4 w-32 bg-muted rounded mb-2"></div>
            <div className="h-3 w-48 bg-muted rounded"></div>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-[100vw] overflow-hidden">
      <CardHeader className="px-4 sm:px-6">
        <CardTitle>Manage Categories</CardTitle>
        <CardDescription>
          Create, edit, and delete your custom transaction categories
          {isLoading && <span className="ml-2">(Updating...)</span>}
        </CardDescription>
      </CardHeader>
      <Tabs value={tabValue} onValueChange={setTabValue}>
        <div className="px-4 sm:px-6">
          <TabsList className="grid w-full grid-cols-2 mb-6 bg-muted/30 p-1 rounded-lg">
            <TabsTrigger value="income" className="text-sm sm:text-base py-3 px-6 sm:px-8 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md transition-all">
              Income Categories
            </TabsTrigger>
            <TabsTrigger value="expense" className="text-sm sm:text-base py-3 px-6 sm:px-8 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md transition-all">
              Expense Categories
            </TabsTrigger>
          </TabsList>
        </div>
        <ScrollArea className="h-[calc(100vh-20rem)] sm:h-[350px] px-4 sm:px-6 py-4">
          <TabsContent value="income" className="m-0">
            {renderCategories(incomeCategories)}
          </TabsContent>
          <TabsContent value="expense" className="m-0">
            {renderCategories(expenseCategories)}
          </TabsContent>
        </ScrollArea>
      </Tabs>
      <CardFooter className="flex justify-between px-4 sm:px-6 py-4 border-t">
        <CategoryForm defaultType={tabValue as "income" | "expense"}>
          <Button disabled={isLoading} className="w-full py-3 sm:py-2 sm:w-auto">
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </CategoryForm>
      </CardFooter>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the category &quot;{categoryToDelete?.name}&quot;.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
