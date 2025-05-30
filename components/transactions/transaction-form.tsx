"use client"

import { useState, useEffect } from "react"
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
import { format, parse } from "date-fns"
import { CalendarIcon, PlusCircle, HelpCircle } from "lucide-react"
import { useCategories } from "@/lib/context/CategoryContext"
import { useTransactionQuery } from "@/lib/hooks/useTransactionQuery"
import { useBudgets } from "@/lib/context/BudgetContext"
import { useAccounts } from "@/lib/context/AccountContext"
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
  budget_id: z.string().nullable(),
  account_id: z.string().min(1, { message: "An account is required." })
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
  account_id: string
}

interface TransactionFormProps {
  children: React.ReactNode
  transaction?: Transaction
  onSuccess?: () => void
}

export function TransactionForm({ children, transaction, onSuccess }: TransactionFormProps) {
  const [open, setOpen] = useState(false);
  const { categories, incomeCategories, expenseCategories } = useCategories();
  const { addTransaction, updateTransaction } = useTransactionQuery();
  const { budgets } = useBudgets();
  const { currentAccount } = useAccounts();
  
  // Get current account ID for new transactions
  const currentAccountId = currentAccount?.id || "";
  
  // Parse date from string if it's a transaction edit
  const parseTransactionDate = (dateString: string): Date => {
    try {
      return parse(dateString, "yyyy-MM-dd", new Date());
    } catch (error) {
      console.error("Date parsing error:", error);
      return new Date(); // Fallback to current date
    }
  };

  // Default values for the form
  const getDefaultValues = (): Partial<TransactionFormValues> => {
    if (transaction) {
      return {
        description: transaction.description,
        amount: transaction.amount,
        date: parseTransactionDate(transaction.date),
        category: transaction.category,
        type: transaction.type,
        payment_source: transaction.payment_source,
        notes: transaction.notes || "",
        budget_id: transaction.budget_id || null,
        account_id: transaction.account_id
      };
    }
    
    return {
      description: "",
      amount: undefined,
      payment_source: "bank_transfer",
      date: new Date(),
      category: "",
      type: "expense",
      notes: "",
      budget_id: null,
      account_id: currentAccountId
    };
  };
  
  // Initialize form
  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: getDefaultValues()
  });

  // Reset form when dialog opens/closes or transaction/account changes
  useEffect(() => {
    if (open) {
      form.reset(getDefaultValues());
    }
    
    return () => {
      // Cleanup function
      if (!open) {
        form.reset();
      }
    };
  }, [open, transaction, currentAccount, form]);
  
  // Get the current transaction type and create filtered categories list
  const transactionType = form.watch("type");
  const filteredCategories = transactionType === "income" 
    ? incomeCategories 
    : expenseCategories;

  const hasCategoriesForType = filteredCategories.length > 0;

  // Handle form submission
  async function onSubmit(data: TransactionFormValues) {
    try {
      // Validate that categories exist for the selected type
      if (!hasCategoriesForType) {
        toast("Categories Required", {
          description: `Please create at least one ${transactionType} category before adding a transaction.`
        });
        return;
      }
      
      // Ensure we have a valid account_id
      if (!data.account_id) {
        toast("Account Required", {
          description: "Please select an account for this transaction."});
        return;
      }
      
      // Format date for submission
      const formattedDate = format(data.date, "yyyy-MM-dd");
      
      // Create the transaction data object
      const processedData = {
        description: data.description,
        amount: data.amount,
        date: formattedDate,
        category: data.category,
        type: data.type,
        payment_source: data.payment_source,
        notes: data.notes || "",
        budget_id: data.budget_id,
        account_id: data.account_id
      };

      if (transaction) {
        // Update existing transaction
        await updateTransaction({ id: transaction.id, data: processedData });
        toast("Changes Saved", {
          description: "Your transaction has been updated successfully."});
      } else {
        // Add new transaction
        await addTransaction(processedData);
        toast("Transaction Added", {
          description: "Your transaction has been recorded successfully."});
      }
      
      setOpen(false);
      form.reset(getDefaultValues()); // Reset the form with fresh defaults
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Transaction error:", error);
      
      // Handle subscription limit errors
      if (error instanceof Error && error.message?.includes("Free users are limited to")) {
        toast("Subscription Limit Reached", {
          description: error.message,
          action: {
            label: "Upgrade",
            onClick: () => window.location.href = "/profile"
          }
        });
      } else {
        toast("Unable to Save", {
          description: "We couldn't save your transaction. Please try again."});
      }
    }
  }

  // Handle transaction type change
  const handleTypeChange = (value: string) => {
    if (value === "income" || value === "expense") {
      form.setValue("type", value);
      form.setValue("category", "");
      
      // Clear budget selection when switching to income
      if (value === "income") {
        form.setValue("budget_id", null);
      }
      
      // Trigger validation after changing values
      form.trigger(["type", "category", "budget_id"]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px] max-h-[90vh] overflow-y-auto">
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
                    onValueChange={handleTypeChange}
                    defaultValue={field.value}
                    value={field.value}
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
                    <Input 
                      type="number" 
                      step="0.01" 
                      placeholder="0.00" 
                      {...field} 
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(value === "" ? undefined : parseFloat(value));
                      }}
                    />
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
                        Please add categories for {transactionType} transactions on the 
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
            
            {transactionType === "expense" && (
              <FormField
                control={form.control}
                name="budget_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Budget</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(value === "none" ? null : value)} 
                      value={field.value || "none"}
                    >
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
                    <FormDescription>
                      Associate this expense with a budget for tracking.
                    </FormDescription>
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
            
            <FormField
              control={form.control}
              name="account_id"
              render={({ field }) => (
                <FormItem className="hidden">
                  <FormControl>
                    <Input 
                      type="hidden"
                      {...field} 
                      value={field.value || currentAccountId}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button 
                type="submit" 
                disabled={!hasCategoriesForType || !currentAccountId}
              >
                {transaction ? "Update Transaction" : "Add Transaction"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
