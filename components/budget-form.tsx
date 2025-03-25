import { useState } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { format, addMonths } from "date-fns"
import { CalendarIcon } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useBudgets } from "@/lib/context/BudgetContext"
import { toast } from "sonner"


const formSchema = z.object({
  name: z.string().min(2, {
    message: "Budget name must be at least 2 characters.",
  }),
  amount: z.coerce.number().positive({
    message: "Budget amount must be positive.",
  }),
  startDate: z.date({ required_error: "Start date is required." }),
  endDate: z.date({ required_error: "End date is required." })
}).refine((data) => data.endDate > data.startDate, {
  message: "End date must be after start date.",
  path: ["endDate"]
})

type FormValues = z.infer<typeof formSchema>

interface Budget {
  id: string
  name: string
  amount: number
  spent: number
  account_id: string
  startDate?: string
  endDate?: string
}

interface BudgetFormProps {
  children: React.ReactNode
  budget?: Budget
}

export function BudgetForm({ children, budget }: BudgetFormProps) {
  const [open, setOpen] = useState(false)
  const { addBudget, updateBudget, budgets } = useBudgets() // Import budgets from useBudgets

  const defaultValues = budget
    ? {
        name: budget.name,
        amount: budget.amount,
        startDate: budget.startDate ? new Date(budget.startDate) : new Date(),
        endDate: budget.endDate ? new Date(budget.endDate) : addMonths(new Date(), 1)
      }
    : {
        name: "",
        amount: undefined,
        startDate: new Date(),
        endDate: addMonths(new Date(), 1)
      }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  })



  async function onSubmit(values: FormValues) {
    try {
      // Create the budget object
      const budgetData = {
        name: values.name,
        amount: values.amount,
        spent: budget?.spent || 0,
        startDate: values.startDate.toISOString(),
        endDate: values.endDate.toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      // Either update existing or add new budget
      if (budget) {
        await updateBudget({ id: budget.id, ...budgetData, account_id: budget.account_id })
        toast("Budget updated", {
          description: "Your budget has been updated successfully."
        })
      } else {
        await addBudget({ ...budgetData, account_id: "" })
        toast("Budget created", {
          description: "Your new budget has been created successfully."
        })
      }

      setOpen(false)
      form.reset()
    } catch (error) {
      console.error('Error saving budget:', error)
      toast("Error", {
        description: "There was a problem saving your budget."
      })
    }
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
              <Button type="submit">{budget ? "Save Changes" : "Create Budget"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
