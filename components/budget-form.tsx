import { useState } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useBudgets } from "@/lib/context/BudgetContext"
import { useToast } from "@/components/ui/use-toast"

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Budget name must be at least 2 characters.",
  }),
  amount: z.coerce.number().positive({
    message: "Budget amount must be positive.",
  }),
  period: z.string().min(1, {
    message: "Please select a budget period.",
  }),
  category: z.string().min(1, {
    message: "Please select a category.",
  }),
})

type FormValues = z.infer<typeof formSchema>

interface Budget {
  id: string
  name: string
  amount: number
  spent: number
  period: string
  category: string
}

interface BudgetFormProps {
  children: React.ReactNode
  budget?: Budget
}

export function BudgetForm({ children, budget }: BudgetFormProps) {
  const [open, setOpen] = useState(false)
  const { addBudget, updateBudget, budgets } = useBudgets() // Import budgets from useBudgets
  const { toast } = useToast()

  const defaultValues: Partial<FormValues> = budget
    ? {
        name: budget.name,
        amount: budget.amount,
        period: budget.period,
        category: budget.category,
      }
    : {
        name: "",
        amount: 0,
        period: "Monthly",
        category: "",
      }

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  })

  // Get the list of used categories
  const usedCategories = budgets
    .filter((budget) => budget.spent > 0)
    .map((budget) => budget.category);

  function onSubmit(values: FormValues) {
    // Create the budget object
    const budgetData = {
      name: values.name,
      amount: values.amount,
      spent: budget?.spent || 0, // Keep existing spent amount or set to 0 for new budgets
      period: values.period,
      category: values.category,
    }

    // Either update existing or add new budget
    if (budget) {
      updateBudget(budget.id, budgetData)
      toast({
        title: "Budget updated",
        description: "Your budget has been updated successfully."
      })
    } else {
      addBudget(budgetData)
      toast({
        title: "Budget created",
        description: "Your new budget has been created successfully."
      })
    }

    setOpen(false)
    form.reset()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{budget ? "Edit Budget" : "Create Budget"}</DialogTitle>
          <DialogDescription>
            {budget ? "Edit your budget details below." : "Create a new budget to track your spending."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Budget Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Marketing Budget" {...field} />
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
                  <FormDescription>Enter the total budget amount without currency symbol.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="period"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Budget Period</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a period" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Weekly">Weekly</SelectItem>
                      <SelectItem value="Monthly">Monthly</SelectItem>
                      <SelectItem value="Quarterly">Quarterly</SelectItem>
                      <SelectItem value="Yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {/* Filter out used categories */}
                      {["Marketing", "Sales", "Operations", "Software", "Supplies", "Training", "Travel", "Other"]
                        .filter((category) => !usedCategories.includes(category))
                        .map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">{budget ? "Save Changes" : "Create Budget"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
