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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover"
import { CalendarIcon, PlusCircle, HelpCircle, Repeat } from "lucide-react"
import { format, addMonths } from "date-fns"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { useBudgets } from "@/lib/context/BudgetContext"
import { useAccounts } from "@/lib/context/AccountContext"
import { useCategoryQuery } from "@/lib/hooks/useCategoryQuery"
import Link from "next/link"

// Define the form schema
const budgetFormSchema = z.object({
  name: z.string().min(2, { message: "Budget name must be at least 2 characters." }),
  amount: z.coerce.number().positive({ message: "Amount must be a positive number." }),
  startDate: z.date({ required_error: "Start date is required." }),
  endDate: z.date({ required_error: "End date is required." }),
  categoryIds: z.array(z.string()).optional().default([]),
  isRecurring: z.boolean().default(false),
  recurringType: z.enum(['monthly', 'weekly', 'yearly', 'quarterly']).optional()
})
  .refine((data) => data.endDate > data.startDate, {
    message: "End date must be after start date.",
    path: ["endDate"]
  })
  .refine((data) => !data.isRecurring || data.recurringType, {
    message: "Recurring type is required when budget is set as recurring.",
    path: ["recurringType"]
  });

// Type for existing budget
interface Budget {
  id: string
  name: string
  amount: number
  spent: number
  start_date?: string
  end_date?: string
  account_id?: string
  category_id?: number
  category_name?: string
  is_recurring?: boolean
  recurring_type?: 'monthly' | 'weekly' | 'yearly' | 'quarterly'
  parent_budget_id?: string
}

interface BudgetFormProps {
  children: ReactNode
  budget?: Budget
  onSave?: (budget: Budget) => void
}

export function BudgetForm({ children, budget, onSave }: BudgetFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const { addBudget, updateBudget, setBudgetCategories, fetchBudgetCategories } = useBudgets()
  const { currentAccount } = useAccounts()
  const { categories } = useCategoryQuery()
  
  // Filter expense categories for budget selection
  const expenseCategories = categories.filter(cat => cat.type === 'expense')
  
  // Load existing categories when editing a budget
  const loadBudgetCategories = async () => {
    if (budget?.id) {
      try {
        const budgetCategories = await fetchBudgetCategories(budget.id)
        const categoryIds = budgetCategories.map(cat => cat.id)
        setSelectedCategories(categoryIds)
        form.setValue('categoryIds', categoryIds)
      } catch (error) {
        console.error('Error loading budget categories:', error)
      }
    }
  }
  
  // Create form
  const form = useForm<z.infer<typeof budgetFormSchema>>({
    resolver: zodResolver(budgetFormSchema),
    defaultValues: budget
      ? {
          name: budget.name,
          amount: budget.amount,
          startDate: budget.start_date ? new Date(budget.start_date) : new Date(),
          endDate: budget.end_date ? new Date(budget.end_date) : addMonths(new Date(), 1),
          categoryIds: [],
          isRecurring: budget.is_recurring || false,
          recurringType: budget.recurring_type || undefined
        }
      : {
          name: "",
          amount: undefined,
          startDate: new Date(),
          endDate: addMonths(new Date(), 1),
          categoryIds: [],
          isRecurring: false,
          recurringType: undefined
        }
  })

  // Load categories when dialog opens and we're editing
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (open && budget?.id) {
      loadBudgetCategories()
    } else if (!open) {
      setSelectedCategories([])
      form.reset()
    }
  }

  // Handle category selection
  const handleCategoryToggle = (categoryId: string, checked: boolean) => {
    let newSelectedCategories: string[]
    
    if (checked) {
      newSelectedCategories = [...selectedCategories, categoryId]
    } else {
      newSelectedCategories = selectedCategories.filter(id => id !== categoryId)
    }
    
    setSelectedCategories(newSelectedCategories)
    form.setValue('categoryIds', newSelectedCategories)
  }

  // Handle form submission
  async function onSubmit(data: z.infer<typeof budgetFormSchema>) {
    if (!currentAccount) {
      toast.error("Please select an account first.");
      return;
    }

    try {
      // Format dates consistently
      const formattedStartDate = format(data.startDate, "yyyy-MM-dd");
      const formattedEndDate = format(data.endDate, "yyyy-MM-dd");
      
      // Calculate period from dates
      const startMonth = format(data.startDate, "MMM yyyy");
      const endMonth = format(data.endDate, "MMM yyyy");
      const period = startMonth === endMonth ? startMonth : `${startMonth} - ${endMonth}`;
      
      const budgetData = {
        name: data.name,
        amount: data.amount,
        start_date: formattedStartDate,
        end_date: formattedEndDate,
        period: period,
        // Keep the old category_id for backward compatibility, but we'll use the junction table
        category_id: data.categoryIds && data.categoryIds.length > 0 ? parseInt(data.categoryIds[0], 10) : undefined,
        account_id: currentAccount.id,
        is_recurring: data.isRecurring,
        recurring_type: data.isRecurring ? data.recurringType : undefined
      };
      
      if (budget) {
        // Update existing budget
        const updatedBudget = {
          id: budget.id,
          ...budgetData,
          spent: budget.spent || 0
        };
        
        updateBudget(updatedBudget);
        
        // Update budget categories using the junction table
        if (data.categoryIds && data.categoryIds.length > 0) {
          // Convert string IDs to numbers for the RPC function
          const numericCategoryIds = data.categoryIds.map(id => parseInt(id, 10)).filter(id => !isNaN(id));
          setBudgetCategories({ 
            budgetId: budget.id, 
            categoryIds: numericCategoryIds 
          });
        }
        
        toast.success("Budget updated successfully!");
        
        // Pass the updated budget to onSave callback
        if (onSave) onSave(updatedBudget);
      } else {
        // Add new budget
        const newBudget = {
          ...budgetData,
          spent: 0
        };
        
        // For new budgets, we need to handle the async nature differently
        // Since addBudget doesn't return the created budget, we'll handle categories separately
        addBudget(newBudget);
        
        toast.success("Budget created successfully!");
        
        // Note: For new budgets, we can't set categories immediately since we don't have the budget ID
        // This would need to be handled differently, perhaps with a callback or by refetching
        if (onSave) {
          // Create a mock budget object for the callback
          const mockBudget = { ...newBudget, id: 'pending', spent: 0 };
          onSave(mockBudget);
        }
      }
      
      setIsOpen(false);
      setSelectedCategories([]);
      form.reset();
    } catch (error) {
      console.error("Budget save error:", error);
      toast.error("There was a problem saving your budget.");
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="w-[95vw] max-w-[500px] max-h-[90vh] overflow-y-auto p-3 sm:p-4 md:p-6">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-lg sm:text-xl">{budget ? "Edit Budget" : "Create Budget"}</DialogTitle>
          <DialogDescription className="text-sm">
            {budget 
              ? "Update your budget details below." 
              : "Set up a new budget to track your expenses."}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Budget Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., Monthly Groceries, Marketing Budget" 
                      className="w-full text-sm sm:text-base" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Budget Amount</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.01" 
                      placeholder="0.00" 
                      className="w-full text-sm sm:text-base" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription className="text-xs sm:text-sm">
                    Enter the total amount you want to allocate for this budget.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="categoryIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Categories (Optional)</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <div className="text-xs sm:text-sm text-muted-foreground">
                        Select categories for this budget (optional):
                      </div>
                      <div className="max-h-32 sm:max-h-40 overflow-y-auto border rounded-md p-2 sm:p-3 space-y-2">
                        {expenseCategories.map((category) => (
                          <div key={category.id} className="flex items-center space-x-2 sm:space-x-3">
                            <Checkbox
                              id={`category-${category.id}`}
                              checked={selectedCategories.includes(category.id.toString())}
                              onCheckedChange={(checked) => handleCategoryToggle(category.id.toString(), Boolean(checked))}
                              className="h-4 w-4"
                            />
                            <label 
                              htmlFor={`category-${category.id}`}
                              className="text-xs sm:text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center space-x-2 flex-1 min-w-0"
                            >
                              {category.color && (
                                <div 
                                  className="w-3 h-3 rounded-full flex-shrink-0" 
                                  style={{ backgroundColor: category.color }}
                                />
                              )}
                              <span className="truncate">{category.name}</span>
                            </label>
                          </div>
                        ))}
                        {expenseCategories.length === 0 && (
                          <div className="text-xs sm:text-sm text-muted-foreground p-2">
                            No expense categories available. <Link href="/categories" className="underline">Create categories</Link> first.
                          </div>
                        )}
                      </div>
                      {selectedCategories.length > 0 && (
                        <div className="text-xs text-muted-foreground">
                          {selectedCategories.length} categor{selectedCategories.length === 1 ? 'y' : 'ies'} selected
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormDescription className="text-xs sm:text-sm">
                    Link this budget to specific expense categories for automatic tracking.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isRecurring"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3 sm:p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="h-4 w-4 mt-0.5"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none flex-1 min-w-0">
                    <FormLabel className="flex items-center gap-2 text-sm font-medium">
                      <Repeat className="h-4 w-4 flex-shrink-0" />
                      <span>Make this budget recurring</span>
                    </FormLabel>
                    <FormDescription className="text-xs sm:text-sm">
                      Automatically create new budget periods when this one ends.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            {form.watch("isRecurring") && (
              <FormField
                control={form.control}
                name="recurringType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Recurring Frequency</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="text-sm sm:text-base">
                          <SelectValue placeholder="Select how often to repeat" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly (3 months)</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription className="text-xs sm:text-sm">
                      Choose how often you want this budget to automatically renew.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-sm font-medium">Start Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal text-sm sm:text-base h-9 sm:h-10",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              <span className="truncate">{format(field.value, "MMM d, yyyy")}</span>
                            ) : (
                              <span>Pick start date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50 flex-shrink-0" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-sm font-medium">End Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal text-sm sm:text-base h-9 sm:h-10",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              <span className="truncate">{format(field.value, "MMM d, yyyy")}</span>
                            ) : (
                              <span>Pick end date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50 flex-shrink-0" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 pt-4 sm:pt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsOpen(false)}
                className="w-full sm:w-auto text-sm sm:text-base h-9 sm:h-10"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="w-full sm:w-auto text-sm sm:text-base h-9 sm:h-10"
              >
                {budget ? "Update Budget" : "Create Budget"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
