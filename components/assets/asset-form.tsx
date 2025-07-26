'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { CalendarIcon, Plus } from 'lucide-react'
import { format } from 'date-fns'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { useAssets, type AssetFormData } from '@/lib/context/AssetContext'
import { toast } from 'sonner'

const assetSchema = z.object({
  name: z.string().min(1, 'Asset name is required'),
  description: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  current_value: z.number().min(0, 'Current value must be positive'),
  purchase_value: z.number().optional(),
  purchase_date: z.string().optional(),
  depreciation_rate: z.number().min(0).max(100).optional(),
  asset_type: z.enum(['current', 'fixed', 'intangible']),
}) as z.ZodSchema<AssetFormData>

const assetCategories = {
  current: [
    'Cash and Cash Equivalents',
    'Accounts Receivable',
    'Inventory',
    'Short-term Investments',
    'Prepaid Expenses',
  ],
  fixed: [
    'Real Estate',
    'Vehicles',
    'Equipment',
    'Furniture and Fixtures',
  ],
  intangible: [
    'Intellectual Property',
    'Goodwill',
    'Software',
  ],
}

interface AssetFormProps {
  children: React.ReactNode
  asset?: any
  onSuccess?: () => void
}

export function AssetForm({ children, asset, onSuccess }: AssetFormProps) {
  const [open, setOpen] = useState(false)
  const { addAsset, updateAsset } = useAssets()

  const form = useForm<AssetFormData>({
    resolver: zodResolver(assetSchema),
    defaultValues: {
      name: asset?.name || '',
      description: asset?.description || '',
      category: asset?.category || '',
      current_value: asset?.current_value || 0,
      purchase_value: asset?.purchase_value || '',
      purchase_date: asset?.purchase_date || '',
      depreciation_rate: asset?.depreciation_rate || '',
      asset_type: asset?.asset_type || 'current',
    },
  })

  const watchedAssetType = form.watch('asset_type')

  async function onSubmit(data: AssetFormData) {
    try {
      if (asset) {
        await updateAsset(asset.id, data)
        toast.success('Asset updated successfully')
      } else {
        await addAsset(data)
        toast.success('Asset added successfully')
      }
      
      form.reset()
      setOpen(false)
      onSuccess?.()
    } catch (error) {
      toast.error('Failed to save asset')
      console.error('Error saving asset:', error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{asset ? 'Edit Asset' : 'Add New Asset'}</DialogTitle>
          <DialogDescription>
            {asset ? 'Update asset information' : 'Add a new asset to track your wealth'}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Asset Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Primary Residence" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="asset_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Asset Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select asset type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="current">Current Asset</SelectItem>
                        <SelectItem value="fixed">Fixed Asset</SelectItem>
                        <SelectItem value="intangible">Intangible Asset</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {assetCategories[watchedAssetType]?.map((category) => (
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

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Additional details about this asset"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="current_value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Value</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => {
                          const value = e.target.value
                          field.onChange(value === '' ? 0 : parseFloat(value) || 0)
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="purchase_value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Purchase Value (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => {
                          const value = e.target.value
                          field.onChange(value === '' ? '' : parseFloat(value) || '')
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="purchase_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Purchase Date (Optional)</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(new Date(field.value), "PPP")
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
                          selected={field.value ? new Date(field.value) : undefined}
                          onSelect={(date) => field.onChange(date?.toISOString().split('T')[0] || '')}
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
                name="depreciation_rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Depreciation Rate % (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        placeholder="0.0"
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => {
                          const value = e.target.value
                          field.onChange(value === '' ? '' : parseFloat(value) || '')
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {asset ? 'Update Asset' : 'Add Asset'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}