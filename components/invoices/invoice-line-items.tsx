"use client"

import React from "react"
import { useFieldArray, Control } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Plus, Trash2 } from "lucide-react"
import { calculateLineItemAmount } from "@/lib/invoice-utils"

interface InvoiceLineItemsProps {
  control: Control<any>;
  currency?: string;
}

export function InvoiceLineItems({ control, currency = 'NGN' }: InvoiceLineItemsProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "items"
  });

  const getCurrencySymbol = (currencyCode: string) => {
    const symbols: { [key: string]: string } = {
      NGN: '₦'
    };
    return symbols[currencyCode] || '₦';
  };

  const currencySymbol = getCurrencySymbol(currency);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <FormLabel>Line Items *</FormLabel>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            append({
              description: "",
              quantity: 1,
              unit_price: 0,
              line_order: fields.length
            })
          }
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Item
        </Button>
      </div>

      {fields.length === 0 && (
        <div className="text-center py-8 text-sm text-muted-foreground border-2 border-dashed rounded-md">
          No line items yet. Click "Add Item" to get started.
        </div>
      )}

      {fields.map((field, index) => (
        <div
          key={field.id}
          className="border rounded-lg p-4 space-y-3 bg-muted/30"
        >
          <div className="flex items-start justify-between gap-2">
            <span className="text-sm font-semibold text-muted-foreground">
              Item {index + 1}
            </span>
            {fields.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => remove(index)}
                className="h-8 w-8 p-0"
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            )}
          </div>

          <FormField
            control={control}
            name={`items.${index}.description`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Input placeholder="Product or service description" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <FormField
              control={control}
              name={`items.${index}.quantity`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="1"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name={`items.${index}.unit_price`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unit Price</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        {currencySymbol}
                      </span>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        className="pl-7"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name={`items.${index}.quantity`}
              render={({ field: qtyField }) => (
                <FormField
                  control={control}
                  name={`items.${index}.unit_price`}
                  render={({ field: priceField }) => {
                    const amount = calculateLineItemAmount(
                      qtyField.value || 0,
                      priceField.value || 0
                    );

                    return (
                      <FormItem>
                        <FormLabel>Amount</FormLabel>
                        <div className="h-10 px-3 py-2 bg-muted rounded-md border text-sm font-medium">
                          {currencySymbol}{amount.toFixed(2)}
                        </div>
                      </FormItem>
                    );
                  }}
                />
              )}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
