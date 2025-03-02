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
import { useToast } from "@/hooks/use-toast"
import { useCategories, Category } from "@/lib/context/CategoryContext"
import { HexColorPicker } from "react-colorful"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

// Define the form schema
const categoryFormSchema = z.object({
  name: z.string().min(2, { message: "Category name must be at least 2 characters." }),
  type: z.enum(["income", "expense"]),
  color: z.string().optional(),
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
  const { toast } = useToast()
  const { addCategory, updateCategory } = useCategories()

  // Create form
  const form = useForm<z.infer<typeof categoryFormSchema>>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: category?.name || "",
      type: category?.type || defaultType,
      color: category?.color || "#6366F1",
      icon: category?.icon || "DollarSign"
    }
  })

  // Handle form submission
  const onSubmit = async (data: z.infer<typeof categoryFormSchema>) => {
    try {
      if (category) {
        // Update existing category
        await updateCategory(category.id, data)
        toast({
          title: "Category updated",
          description: "Your category has been updated successfully."
        })
      } else {
        // Add new category
        await addCategory(data)
        toast({
          title: "Category created",
          description: "Your new category has been created successfully."
        })
      }
      
      setIsOpen(false)
      form.reset()
    } catch (error) {
      toast({
        title: "Error",
        description: "There was a problem saving your category.",
        variant: "destructive"
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{category ? "Edit Category" : "Add Category"}</DialogTitle>
          <DialogDescription>
            {category 
              ? "Update your transaction category details." 
              : "Create a new custom transaction category."}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Category name" {...field} />
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
                    disabled={!!category} // Cannot change type of existing category
                  >
                    <FormControl>
                      <SelectTrigger>
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
                <FormItem>
                  <FormLabel>Color</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <div className="flex h-10">
                          <div 
                            className="w-10 h-10 rounded-l-md border border-r-0"
                            style={{ backgroundColor: field.value || '#6366F1' }} 
                          />
                          <Input 
                            className="flex-1 rounded-l-none"
                            value={field.value || ''}
                            onChange={field.onChange}
                            placeholder="#000000"
                          />
                        </div>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-3" align="start">
                      <HexColorPicker 
                        color={field.value || '#6366F1'} 
                        onChange={field.onChange} 
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Icon</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select icon" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {icons.map(icon => (
                        <SelectItem key={icon} value={icon}>
                          {icon}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose an icon for this category
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="submit">
                {category ? "Update Category" : "Add Category"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
