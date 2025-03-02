"use client"

import { useState, useEffect, ReactNode } from "react"
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
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { CalendarIcon, PlusCircle, HelpCircle } from "lucide-react"
import { format, addMonths } from "date-fns"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { useCategories } from "@/lib/context/CategoryContext"
import { useBudgets } from "@/lib/context/BudgetContext"
import Link from "next/link"

// Define the form schema
const budgetFormSchema = z.object({
  name: z.string().min(2, { message: "Budget name must be at least 2 characters." }),
  category: z.string().min(1, { message: "Please select a category." }),
  amount: z.coerce.number().positive({ message: "Amount must be a positive number." }),
  startDate: z.date({ required_error: "Start date is required." }),
  endDate: z.date({ required_error: "End date is required." })
})
  .refine((data) => data.endDate > data.startDate, {
    message: "End date must be after start date.",
    path: ["endDate"]
  });

// Type for existing budget
interface Budget {
  id: string
  name: string
  category: string
  amount: number
  spent: number
  startDate: string
  endDate: string
}

interface BudgetFormProps {
  children: ReactNode
  budget?: Budget
  onSave?: (budget: Budget) => void
}

export function BudgetForm({ children, budget, onSave }: BudgetFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { toast } = useToast()
  const { categories, expenseCategories } = useCategories()
  const { addBudget, updateBudget } = useBudgets()
  
  // Create form
  const form = useForm<z.infer<typeof budgetFormSchema>>({
    resolver: zodResolver(budgetFormSchema),
    defaultValues: budget
      ? {
          name: budget.name,
          category: budget.category,
          amount: budget.amount,
          startDate: new Date(budget.startDate),
          endDate: new Date(budget.endDate)
        }
      : {
          name: "",
          category: "",
          amount: undefined,
          startDate: new Date(),
          endDate: addMonths(new Date(), 1)
        }
  })

  const hasBudgetCategories = expenseCategories.length > 0;

  // Handle form submission
  async function onSubmit(data: z.infer<typeof budgetFormSchema>) {
    try {
      if (budget) {
        // Update existing budget
        await updateBudget(budget.id, {
          ...data,
          startDate: format(data.startDate, "yyyy-MM-dd"),
          endDate: format(data.endDate, "yyyy-MM-dd")
        });
        toast({
          title: "Budget updated",
          description: "Your budget has been updated successfully."
        });
      } else {
        // Add new budget
        await addBudget({
          ...data,
          startDate: format(data.startDate, "yyyy-MM-dd"),
          endDate: format(data.endDate, "yyyy-MM-dd")
        });
        toast({
          title: "Budget created",
          description: "Your new budget has been created successfully."
        });
      }
      
      setIsOpen(false);
      form.reset();
      if (onSave) onSave(budget);
    } catch (error) {
      toast({
        title: "Error",
        description: "There was a problem saving your budget.",
        variant: "destructive"
      });
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{budget ? "Edit Budget" : "Create Budget"}</DialogTitle>
          <DialogDescription>
            {budget 
              ? "Update your budget details below." 
              : "Set up a new budget to track your expenses."}
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
                    <Input placeholder="Budget name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <div className="flex space-x-2">
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {hasBudgetCategories ? (
                          expenseCategories.map((category) => (
                            <SelectItem key={category.id} value={category.name}>
                              <div className="flex items-center">
                                <div 
                                  className="w-3 h-3 rounded-full mr-2" 
                                  style={{ backgroundColor: category.color || '#888888' }} 
                                />
                                {category.name}
                              </div>
                            </SelectItem>
                          ))
                        ) : (
                          <div className="px-2 py-1 text-sm text-muted-foreground">
                            No expense categories available
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                    <Link href="/dashboard/categories" passHref>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="shrink-0"
                        title="Manage Categories"
                      >
                        <PlusCircle className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                  {!hasBudgetCategories && (
                    <div className="mt-2 p-2 text-sm bg-muted/50 rounded-md flex items-start gap-2">
                      <HelpCircle className="h-4 w-4 mt-0.5 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        Please add expense categories on the 
                        <Link href="/dashboard/categories" className="text-primary font-medium ml-1">
                          categories page
                        </Link>.
                      </span>
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Budget Amount</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="0.00" {...field} />
                  </FormControl>
                  <FormDescription>
                    Set the maximum amount for this budget period.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Start Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
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
                    <FormLabel>End Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
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
            
            <DialogFooter>
              <Button type="submit">
                {budget ? "Update Budget" : "Create Budget"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
