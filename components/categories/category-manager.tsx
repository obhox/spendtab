"use client"

import { useState } from "react"
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
  const { categories, incomeCategories, expenseCategories, deleteCategory } = useCategories()
  const [tabValue, setTabValue] = useState("income")
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  

  // Function to handle category deletion
  const handleDelete = async () => {
    if (!categoryToDelete) return
    
    try {
      await deleteCategory(categoryToDelete.id)
      toast("Category deleted", {
        description: `${categoryToDelete.name} has been deleted.`,
      })
    } catch (error) {
      toast("Error", {
        description: "Failed to delete category. Default categories cannot be deleted.",
      })
    }
    setShowDeleteConfirm(false)
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categoryList.map((category) => (
          <Card key={category.id} className="relative">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: category.color || '#888888' }}
                  />
                  <span className="font-medium">{category.name}</span>
                  {category.is_default && (
                    <Badge variant="outline" className="ml-2">Default</Badge>
                  )}
                </div>
                <div className="flex space-x-1">
                  <CategoryForm category={category}>
                    <Button size="sm" variant="ghost">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </CategoryForm>
                  
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => confirmDelete(category)}
                    disabled={category.is_default}
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

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Manage Categories</CardTitle>
        <CardDescription>
          Create, edit, and delete your custom transaction categories
        </CardDescription>
      </CardHeader>
      <Tabs value={tabValue} onValueChange={setTabValue}>
        <div className="px-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="income">Income Categories</TabsTrigger>
            <TabsTrigger value="expense">Expense Categories</TabsTrigger>
          </TabsList>
        </div>
        <ScrollArea className="h-[350px] px-6 py-4">
          <TabsContent value="income" className="m-0">
            {renderCategories(incomeCategories)}
          </TabsContent>
          <TabsContent value="expense" className="m-0">
            {renderCategories(expenseCategories)}
          </TabsContent>
        </ScrollArea>
      </Tabs>
      <CardFooter className="flex justify-between px-6 py-4 border-t">
        <CategoryForm defaultType={tabValue as "income" | "expense"}>
          <Button>
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
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
