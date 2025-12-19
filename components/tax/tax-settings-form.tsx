"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
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
import { Checkbox } from "@/components/ui/checkbox"
import { useTax } from "@/lib/context/TaxContext"
import { useEffect } from "react"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

const taxSettingsSchema = z.object({
  business_type: z.enum(["individual", "small_company", "company"], {
    required_error: "Please select a business type.",
  }),
  is_professional_service: z.boolean().default(false),
  tax_id: z.string().optional(),
  vat_registered: z.boolean().default(false),
})

type TaxSettingsFormValues = z.infer<typeof taxSettingsSchema>

export function TaxSettingsForm() {
  const { taxSettings, updateSettings, isUpdating, isLoading } = useTax()

  const form = useForm<TaxSettingsFormValues>({
    resolver: zodResolver(taxSettingsSchema),
    defaultValues: {
      business_type: "individual",
      is_professional_service: false,
      tax_id: "",
      vat_registered: false,
    },
  })

  useEffect(() => {
    if (taxSettings) {
      form.reset({
        business_type: taxSettings.business_type,
        is_professional_service: taxSettings.is_professional_service,
        tax_id: taxSettings.tax_id || "",
        vat_registered: taxSettings.vat_registered,
      })
    }
  }, [taxSettings, form])

  async function onSubmit(data: TaxSettingsFormValues) {
    try {
      await updateSettings(data)
      toast("Settings Updated", {
        description: "Your tax settings have been saved successfully."
      })
    } catch (error) {
      toast("Error", {
        description: "Failed to update tax settings. Please try again."
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-24 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="business_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Business Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select business type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="individual">Individual / Enterprise</SelectItem>
                  <SelectItem value="small_company">Small Company (Turnover &lt; ₦50M)</SelectItem>
                  <SelectItem value="company">Company (Turnover &gt; ₦50M)</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                This determines your CIT rate and available allowances.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="is_professional_service"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Professional Service
                </FormLabel>
                <FormDescription>
                  Check if your business provides professional services (e.g., Legal, Accounting, IT Consulting).
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tax_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tax ID (TIN)</FormLabel>
              <FormControl>
                <Input placeholder="Enter your TIN" {...field} />
              </FormControl>
              <FormDescription>
                Your Tax Identification Number used for filing.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="vat_registered"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  VAT Registered
                </FormLabel>
                <FormDescription>
                  Check if you are registered for Value Added Tax.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isUpdating}>
          {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Settings
        </Button>
      </form>
    </Form>
  )
}
