"use client"

import React, { useState, useEffect } from "react"
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { CalendarIcon, Plus, FileText } from "lucide-react"
import { useInvoiceQuery, type Invoice } from "@/lib/hooks/useInvoiceQuery"
import { ClientSelector } from "@/components/clients/client-selector"
import { InvoiceLineItems } from "./invoice-line-items"
import { calculateInvoiceTotals, formatAmount } from "@/lib/invoice-utils"
import { useSelectedCurrency } from "@/components/currency-switcher"

// Schema for invoice form validation
const invoiceFormSchema = z.object({
  client_id: z.string().min(1, { message: "Please select a client." }),
  invoice_date: z.date(),
  due_date: z.date(),
  tax_rate: z.coerce.number().min(0).max(100, { message: "Tax rate must be between 0 and 100" }),
  notes: z.string().optional(),
  terms: z.string().optional(),
  items: z.array(z.object({
    description: z.string().min(1, { message: "Description is required" }),
    quantity: z.coerce.number().positive({ message: "Quantity must be positive" }),
    unit_price: z.coerce.number().min(0, { message: "Price cannot be negative" }),
    line_order: z.number()
  })).min(1, { message: "At least one line item is required" })
}).refine((data) => data.due_date >= data.invoice_date, {
  message: "Due date must be on or after invoice date",
  path: ["due_date"]
});

type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;

interface InvoiceFormProps {
  invoice?: Invoice | null;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

type TaxPreset = "custom" | "vat_7_5";

export function InvoiceForm({ invoice, trigger, onSuccess }: InvoiceFormProps) {
  const [open, setOpen] = useState(false);
  const [taxPreset, setTaxPreset] = useState<TaxPreset>("custom");
  const { addInvoice, updateInvoice } = useInvoiceQuery();
  const selectedCurrency = useSelectedCurrency();

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      client_id: "",
      invoice_date: new Date(),
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      tax_rate: 0,
      notes: "",
      terms: "",
      items: [
        {
          description: "",
          quantity: 1,
          unit_price: 0,
          line_order: 0
        }
      ]
    }
  });

  // Reset form when dialog opens/closes or invoice changes
  useEffect(() => {
    if (open && invoice) {
      // TODO: Load invoice items when editing
      form.reset({
        client_id: invoice.client_id || "",
        invoice_date: new Date(invoice.invoice_date),
        due_date: new Date(invoice.due_date),
        tax_rate: invoice.tax_rate,
        notes: invoice.notes || "",
        terms: invoice.terms || "",
        items: invoice.items || [
          {
            description: "",
            quantity: 1,
            unit_price: 0,
            line_order: 0
          }
        ]
      });
      setTaxPreset(invoice.tax_rate === 7.5 ? "vat_7_5" : "custom");
    } else if (open && !invoice) {
      form.reset({
        client_id: "",
        invoice_date: new Date(),
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        tax_rate: 0,
        notes: "",
        terms: "",
        items: [
          {
            description: "",
            quantity: 1,
            unit_price: 0,
            line_order: 0
          }
        ]
      });
      setTaxPreset("custom");
    }
  }, [open, invoice, form]);

  const onSubmit = async (data: InvoiceFormValues) => {
    try {
      const invoiceData = {
        client_id: data.client_id,
        invoice_date: format(data.invoice_date, 'yyyy-MM-dd'),
        due_date: format(data.due_date, 'yyyy-MM-dd'),
        tax_rate: data.tax_rate,
        notes: data.notes || null,
        terms: data.terms || null,
        status: 'draft' as const,
      };

      const items = data.items.map((item, index) => ({
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        line_order: index,
      }));

      if (invoice) {
        // Update existing invoice
        await updateInvoice({ id: invoice.id, data: invoiceData, items });
      } else {
        // Add new invoice
        await addInvoice({ ...invoiceData, items });
      }

      setOpen(false);
      form.reset();

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error saving invoice:', error);
    }
  };

  // Calculate live totals
  const items = form.watch('items') || [];
  const taxRate = form.watch('tax_rate') || 0;
  const totals = calculateInvoiceTotals(
    items.map((item) => ({
      quantity: item.quantity ?? 0,
      unit_price: item.unit_price ?? 0
    })),
    taxRate
  );

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {trigger || (
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Invoice
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {invoice ? 'Edit Invoice' : 'Create New Invoice'}
            </DialogTitle>
            <DialogDescription>
              {invoice
                ? 'Update invoice details'
                : 'Create a new invoice for your client'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Client Selection */}
              <FormField
                control={form.control}
                name="client_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client *</FormLabel>
                    <FormControl>
                      <ClientSelector
                        value={field.value}
                        onValueChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Dates - Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="invoice_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Invoice Date *</FormLabel>
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
                  name="due_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Due Date *</FormLabel>
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
                              date < form.getValues('invoice_date')
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Line Items */}
              <InvoiceLineItems control={form.control} currency={selectedCurrency.code} />

              {/* Tax Rate */}
              <FormField
                control={form.control}
                name="tax_rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tax Rate (%)</FormLabel>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Select
                        value={taxPreset}
                        onValueChange={(value) => {
                          const nextPreset = value as TaxPreset;
                          setTaxPreset(nextPreset);
                          if (nextPreset === "vat_7_5") {
                            form.setValue("tax_rate", 7.5, { shouldDirty: true, shouldValidate: true });
                          }
                          if (nextPreset === "custom" && (field.value ?? 0) === 7.5) {
                            form.setValue("tax_rate", 0, { shouldDirty: true, shouldValidate: true });
                          }
                        }}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full sm:w-[200px]">
                            <SelectValue placeholder="Select tax preset" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="custom">Custom</SelectItem>
                          <SelectItem value="vat_7_5">VAT (7.5%)</SelectItem>
                        </SelectContent>
                      </Select>

                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          placeholder="0"
                          {...field}
                          onChange={(e) => {
                            const nextValue = parseFloat(e.target.value);
                            const normalized = Number.isFinite(nextValue) ? nextValue : 0;
                            field.onChange(normalized);
                            setTaxPreset(normalized === 7.5 ? "vat_7_5" : "custom");
                          }}
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Totals Display */}
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span className="font-medium">{selectedCurrency.symbol}{formatAmount(totals.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax ({taxRate}%):</span>
                  <span className="font-medium">{selectedCurrency.symbol}{formatAmount(totals.taxAmount)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total:</span>
                  <span>{selectedCurrency.symbol}{formatAmount(totals.total)}</span>
                </div>
              </div>

              {/* Notes */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Notes visible to client on the invoice..."
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Payment Terms */}
              <FormField
                control={form.control}
                name="terms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Terms</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Payment terms and conditions..."
                        className="resize-none"
                        rows={2}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setOpen(false);
                    form.reset();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {invoice ? 'Update Invoice' : 'Create Invoice'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
