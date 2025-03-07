"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { CalendarIcon, PlusCircle, HelpCircle } from "lucide-react"
import { useCategories } from "@/lib/context/CategoryContext"
import { useTransactions } from "@/lib/context/TransactionContext"
import { useBudgets } from "@/lib/context/BudgetContext"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"
import { toast } from "sonner"

// Schema for form validation
const transactionSchema = z.object({
  description: z.string().min(2, { message: "Description must be at least 2 characters." }),
  amount: z.coerce.number().positive({ message: "Amount must be a positive number." }),
  date: z.date(),
  category: z.string().min(1, { message: "Please select a category." }),
  type: z.enum(["income", "expense"]),
  payment_source: z.string().min(1, { message: "Please select a payment source." }),
  notes: z.string().optional(),
  budget_id: z.string().nullable()
});

// Type for form data
type TransactionFormValues = z.infer<typeof transactionSchema>;

// Type for existing transaction
interface Transaction {
  id: string
  date: string
  description: string
  category: string
  amount: number
  type: "income" | "expense"
  payment_source: string
  notes?: string
  budget_id?: string | null
}

interface TransactionFormProps {
  children: React.ReactNode
  transaction?: Transaction
  onSuccess?: () => void
}

export function TransactionForm({ children, transaction, onSuccess }: TransactionFormProps) {
  const [open, setOpen] = useState(false);
  const { categories, incomeCategories, expenseCategories } = useCategories();
  const { addTransaction, updateTransaction } = useTransactions();
  const { budgets } = useBudgets();
  
  
  // Default values for the form
  const defaultValues: Partial<TransactionFormValues> = transaction 
    ? {
        description: transaction.description,
        amount: transaction.amount,
        date: new Date(transaction.date),
        category: transaction.category,
        type: transaction.type,
        notes: transaction.notes,
        budget_id: transaction.budget_id || null
      }
    : {
        description: "",
        amount: undefined as number | undefined,
        payment_source: "",
        date: new Date(),
        category: "",
        type: "expense",
        notes: "",
        budget_id: null
      };
  
  // Initialize form
  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues
  });
  // Handle form submission
  async function onSubmit(data: TransactionFormValues) {
    try {
      if (transaction) {
        // Update existing transaction
        await updateTransaction(transaction.id, {
          description: data.description,
          amount: data.amount,
          date: format(data.date, "yyyy-MM-dd"),
          category: data.category,
          type: data.type,
          notes: data.notes,
          budget_id: data.budget_id,
          payment_source: data.payment_source
        });
        toast("Transaction updated", {
          description: "Your transaction has been updated successfully."
        });
      } else {
        // Add new transaction
        await addTransaction({
          description: data.description,
          amount: data.amount,
          date: format(data.date, "yyyy-MM-dd"),
          category: data.category,
          type: data.type,
          notes: data.notes,
          budget_id: data.budget_id,
          payment_source: data.payment_source
        });
        toast("Transaction added", {
          description: "Your new transaction has been added successfully."
        });
      }
      
      setOpen(false);
      form.reset();
      if (onSuccess) onSuccess();
    } catch (error) {
      toast("Error", {
        description: "There was a problem saving your transaction."
      });
    }
  }
  // Filter categories based on selected transaction type
  const filteredCategories = form.watch("type") === "income" 
    ? incomeCategories 
    : expenseCategories;

  const hasCategoriesForType = filteredCategories.length > 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{transaction ? "Edit Transaction" : "Add Transaction"}</DialogTitle>
          <DialogDescription>
            {transaction 
              ? "Update the details of your transaction." 
              : "Enter the details of your new transaction."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select 
                    onValueChange={(value) => {
                      field.onChange(value);
                      // Reset category when type changes
                      form.setValue("category", "");
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select transaction type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="income">Income</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="E.g., Client payment, Office supplies" {...field} />
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
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="0.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date</FormLabel>
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
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
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
                        {hasCategoriesForType ? (
                          filteredCategories.map((category) => (
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
                            No categories available
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                    <Link href="/categories" passHref>
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
                  {!hasCategoriesForType && (
                    <div className="mt-2 p-2 text-sm bg-muted/50 rounded-md flex items-start gap-2">
                      <HelpCircle className="h-4 w-4 mt-0.5 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        Please add categories for {form.watch("type")} transactions on the 
                        <Link href="/categories" className="text-primary font-medium ml-1">
                          categories page
                        </Link>.
                      </span>
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {form.watch("type") === "expense" && (
              <FormField
                control={form.control}
                name="budget_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Budget</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a budget (optional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">No Budget</SelectItem>
                        {budgets.map((budget) => (
                          <SelectItem key={budget.id} value={budget.id}>
                            {budget.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="payment_source"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Source</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment source" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="credit_card">Credit Card</SelectItem>
                      <SelectItem value="debit_card">Debit Card</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="stripe">Stripe</SelectItem>
                      <SelectItem value="paypal">Paypal</SelectItem>
                      <SelectItem value="mobile_payment">Mobile Payment</SelectItem>
                      <SelectItem value="check">Check</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Additional details about this transaction" 
                      className="resize-none"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="submit">
                {transaction ? "Update Transaction" : "Add Transaction"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
