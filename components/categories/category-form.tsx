"use client"

import { useState, ReactNode } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { toast } from "sonner"
import { useCategories, Category } from "@/lib/context/CategoryContext"
import { HexColorPicker } from "react-colorful"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

// Define the form schema
const categoryFormSchema = z.object({
  name: z.string().min(2, { message: "Category name must be at least 2 characters." }),
  type: z.enum(["income", "expense"]),
  color: z.string().regex(/^#([0-9A-F]{3}){1,2}$/i, { message: "Color must be a valid hex color (e.g. #FF0000)" }).optional(),
  icon: z.string().optional()
})

interface CategoryFormProps {
  children: ReactNode
  category?: Category
  defaultType?: "income" | "expense"
}

// List of available icons (using Lucide icon names)
const icons = [
  "DollarSign",
  "CreditCard",
  "ShoppingCart",
  "Home",
  "Car",
  "Briefcase",
  "Coffee",
  "Gift",
  "Heart",
  "Utensils",
  "Plane",
  "Smartphone",
  "Book",
  "TrendingUp",
  "TrendingDown"
]

export function CategoryForm({ children, category, defaultType = "expense" }: CategoryFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { addCategory, updateCategory } = useCategories()

  // Create form
  const form = useForm<z.infer<typeof categoryFormSchema>>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: category?.name || "",
      type: category?.type || defaultType,
      color: category?.color || "#6366F1"
    }
  })

  // Handle form submission
  const onSubmit = async (data: z.infer<typeof categoryFormSchema>) => {
    try {
      if (category) {
        // Update existing category
        await updateCategory(category.id, {
          name: data.name,
          type: data.type,
          color: data.color,
          icon: data.icon
        })
        toast("Category updated", {
          description: "Your category has been updated successfully."
        })
      } else {
        // Add new category
        await addCategory({
          name: data.name,
          type: data.type,
          color: data.color,
          icon: data.icon
        })
        toast("Category created", {
          description: "Your new category has been created successfully."
        })
      }
      
      // Close the dialog first
      setIsOpen(false)
      
      // Reset form after dialog is closed to avoid visual glitches
      setTimeout(() => {
        form.reset({
          name: "",
          type: defaultType,
          color: "#6366F1",
          icon: undefined
        })
      }, 100)
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('startsWith')) {
        toast("Error", {
          description: "Invalid category ID format. Please try again."
        })
        return;
      } else if (error instanceof Error && error.message.includes('Invalid category')) {
        toast("Error", {
          description: "Please provide a valid category."
        });
        return;
      } else {
        console.error('Error saving category:', error);
        toast("Error", {
          description: "There was a problem saving your category."
        });
        return;
      }
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="w-[95vw] max-w-[425px] p-4 md:p-6">
        <DialogHeader>
          <DialogTitle>{category ? "Edit Category" : "Add Category"}</DialogTitle>
          <DialogDescription>
            {category 
              ? "Update your transaction category details." 
              : "Create a new custom transaction category."}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Category name" className="w-full h-11" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={!!category}
                  >
                    <FormControl>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="income">Income</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                    </SelectContent>
                  </Select>
                  {category && (
                    <FormDescription>
                      Category type cannot be changed after creation.
                    </FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Color</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <div className="flex h-12 sm:h-11 w-full">
                          <div 
                            className="w-12 sm:w-11 h-12 sm:h-11 rounded-l-md border border-r-0"
                            style={{ backgroundColor: field.value || '#6366F1' }} 
                          />
                          <Input 
                            className="flex-1 rounded-l-none h-12 sm:h-11"
                            value={field.value || ''}
                            onChange={field.onChange}
                            placeholder="#000000"
                          />
                        </div>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[280px] p-4" align="start">
                      <HexColorPicker 
                        color={field.value || '#6366F1'} 
                        onChange={field.onChange}
                        className="w-full"
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="submit" className="w-full sm:w-auto h-11">
                {category ? "Update Category" : "Add Category"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
