"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
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
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { useTransactions } from "@/lib/context/TransactionContext"
import { toast } from "sonner"
import { useBudgets } from "@/lib/context/BudgetContext";

const formSchema = z.object({
  date: z.date(),
  description: z.string().min(2, {
    message: "Description must be at least 2 characters.",
  }),
  category: z.string().min(1, {
    message: "Please select a category.",
  }),
  amount: z.coerce.number().refine((val) => val !== 0, {
    message: "Amount cannot be zero.",
  }),
  type: z.enum(["income", "expense"]),
  notes: z.string().optional(),
  budget_id: z.string().nullable().optional(),
  payment_source: z.string().min(1, {
    message: "Please select a payment source.",
  })
})

type FormValues = z.infer<typeof formSchema>

interface Transaction {
  id: string
  date: string
  description: string
  category: string
  amount: number
  type: "income" | "expense"
  notes?: string
  budget_id: string | null
  payment_source: string
}

interface TransactionFormProps {
  children: React.ReactNode
  transaction?: Transaction
}

export function TransactionForm({ children, transaction }: TransactionFormProps) {
  const [open, setOpen] = useState(false)
  const { addTransaction, updateTransaction } = useTransactions()
  const { budgets, getBudgets } = useBudgets();
  const [selectedBudgetId, setSelectedBudgetId] = useState<string | null>(transaction?.budget_id || null);

  useEffect(() => {
    getBudgets();
  }, [getBudgets]);

  useEffect(() => {
    console.log("Budgets fetched:", budgets);
  }, [budgets]);

  const defaultValues: Partial<FormValues> = transaction
    ? {
        date: new Date(transaction.date),
        description: transaction.description,
        category: transaction.category,
        amount: Math.abs(transaction.amount),
        type: transaction.type,
        notes: transaction.notes || "",
        budget_id: transaction.budget_id || null,
        payment_source: transaction.payment_source
      }
    : {
        date: new Date(),
        description: "",
        category: "",
        amount: 0,
        type: "income",
        notes: "",
        budget_id: null,
        payment_source: ""
      }

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  })
  function onSubmit(values: FormValues) {
    // Format amount based on transaction type
    const finalAmount = values.type === "expense" ? -Math.abs(values.amount) : Math.abs(values.amount)

    // Create the transaction object
    const transactionData = {
      date: format(values.date, "yyyy-MM-dd"),
      description: values.description,
      category: values.category,
      amount: finalAmount,
      type: values.type,
      notes: values.notes,
      budget_id: values.budget_id ?? null,
      payment_source: values.payment_source
    }

    // Either update existing or add new transaction
    if (transaction) {
      updateTransaction(transaction.id, transactionData)
      toast("Transaction updated", {
        description: "Your transaction has been updated successfully."
      })
    } else {
      addTransaction(transactionData)
      toast("Transaction added", {
        description: "Your new transaction has been added successfully."
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
          <DialogTitle>{transaction ? "Edit Transaction" : "Add Transaction"}</DialogTitle>
          <DialogDescription>
            {transaction ? "Edit your transaction details below." : "Add a new transaction to your records."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                          className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                        >
                          {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                    </PopoverContent>
                  </Popover>
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Transaction description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="budget_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Budget</FormLabel>
                  <Select onValueChange={(value) => field.onChange(value)} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a budget" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">No Budget</SelectItem>
                      {budgets?.map((budget) => (
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
                      {form.watch("type") === "income" ? (
                        <>
                          <SelectItem value="Sales">Sales</SelectItem>
                          <SelectItem value="Consulting">Consulting</SelectItem>
                          <SelectItem value="Services">Services</SelectItem>
                          <SelectItem value="Investment">Investment</SelectItem>
                          <SelectItem value="Other Income">Other Income</SelectItem>
                        </>
                      ) : (
                        <>
                          <SelectItem value="Rent">Rent</SelectItem>
                          <SelectItem value="Utilities">Utilities</SelectItem>
                          <SelectItem value="Supplies">Supplies</SelectItem>
                          <SelectItem value="Software">Software</SelectItem>
                          <SelectItem value="Marketing">Marketing</SelectItem>
                          <SelectItem value="Salaries">Salaries</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="payment_source"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Source</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Additional notes (optional)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">Save Transaction</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
