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
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover"
import { CalendarIcon, PlusCircle, HelpCircle } from "lucide-react"
import { format, addMonths } from "date-fns"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { useBudgets } from "@/lib/context/BudgetContext"
import { useAccounts } from "@/lib/context/AccountContext"
import Link from "next/link"

// Define the form schema
const budgetFormSchema = z.object({
  name: z.string().min(2, { message: "Budget name must be at least 2 characters." }),
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
  amount: number
  spent: number
  startDate?: string
  endDate?: string
  period?: string
  account_id?: string
}

interface BudgetFormProps {
  children: ReactNode
  budget?: Budget
  onSave?: (budget: Budget) => void
}

export function BudgetForm({ children, budget, onSave }: BudgetFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { addBudget, updateBudget } = useBudgets()
  const { currentAccount } = useAccounts()
  
  // Create form
  const form = useForm<z.infer<typeof budgetFormSchema>>({
    resolver: zodResolver(budgetFormSchema),
    defaultValues: budget
      ? {
          name: budget.name,
          amount: budget.amount,
          startDate: new Date(budget.startDate),
          endDate: new Date(budget.endDate)
        }
      : {
          name: "",
          amount: undefined,
          startDate: new Date(),
          endDate: addMonths(new Date(), 1)
        }
  })

  // Handle form submission
  async function onSubmit(data: z.infer<typeof budgetFormSchema>) {
    if (!currentAccount) {
      toast("Error", {
        description: "Please select an account first."
      });
      return;
    }

    try {
      // Format dates consistently
      const formattedStartDate = format(data.startDate, "yyyy-MM-dd");
      const formattedEndDate = format(data.endDate, "yyyy-MM-dd");
      
      if (budget) {
        // Create updated budget object
        const updatedBudget = {
          id: budget.id,
          name: data.name,
          amount: data.amount,
          startDate: formattedStartDate,
          endDate: formattedEndDate,
          spent: budget.spent || 0,
          account_id: currentAccount.id,
          period: budget.period
        };
        
        // Update existing budget
        await updateBudget(budget.id, {
          name: data.name,
          amount: data.amount,
          startDate: formattedStartDate,
          endDate: formattedEndDate,
          spent: budget.spent || 0,
          account_id: currentAccount.id
        });
        
        toast("Budget updated", {
          description: "Your budget has been updated successfully."
        });
        
        // Pass the updated budget to onSave callback
        if (onSave) onSave(updatedBudget);
      } else {
        // Add new budget
        const newBudget = {
          name: data.name,
          amount: data.amount,
          startDate: formattedStartDate,
          endDate: formattedEndDate,
          spent: 0,
          account_id: currentAccount.id
        };
        
        const createdBudget = await addBudget(newBudget);
        
        toast("Budget created", {
          description: "Your new budget has been created successfully."
        });
        
        // Pass the created budget to onSave callback if it exists
        if (onSave && createdBudget) onSave(createdBudget);
      }
      
      setIsOpen(false);
      form.reset();
    } catch (error) {
      console.error("Budget save error:", error);
      toast("Error", {
        description: "There was a problem saving your budget."
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
                          disabled={(date) => {
                            // Disable dates before 1900 (arbitrary past limit)
                            return date < new Date("1900-01-01");
                          }}
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
                          disabled={(date) => {
                            // Disable dates before the selected start date
                            const startDate = form.getValues("startDate");
                            return date < new Date("1900-01-01") || (startDate && date <= startDate);
                          }}
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
