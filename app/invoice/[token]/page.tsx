"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { FileDown, Loader2 } from "lucide-react"
import { downloadInvoicePDF, type InvoicePDFData } from "@/lib/invoice-pdf-generator"
import { formatInvoiceDate, formatAmount } from "@/lib/invoice-utils"
import { toast } from "sonner"

interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unit_price: number
  amount: number
}

interface Client {
  id: string
  name: string
  email?: string | null
  phone?: string | null
  address?: string | null
  city?: string | null
  state?: string | null
  country?: string
}

interface BusinessSettings {
  business_name?: string | null
  business_email?: string | null
  business_phone?: string | null
  business_address?: string | null
  business_city?: string | null
  business_state?: string | null
  business_country?: string | null
  business_website?: string | null
  bank_name?: string | null
  account_name?: string | null
  account_number?: string | null
}

interface Invoice {
  id: string
  invoice_number: string
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  invoice_date: string
  due_date: string
  paid_date?: string | null
  subtotal: number
  tax_rate: number
  tax_amount: number
  total_amount: number
  notes?: string | null
  terms?: string | null
  client: Client
  items: InvoiceItem[]
  user_id: string
}

export default function PublicInvoicePage() {
  const params = useParams()
  const token = params.token as string
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [businessSettings, setBusinessSettings] = useState<BusinessSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchInvoice() {
      try {
        // Fetch invoice by share token
        const { data: invoiceData, error: invoiceError } = await supabase
          .from('invoices')
          .select('*, client:clients(*), items:invoice_items(*)')
          .eq('share_token', token)
          .single()

        if (invoiceError || !invoiceData) {
          setError('Invoice not found or link is invalid')
          setLoading(false)
          return
        }

        setInvoice(invoiceData as Invoice)

        // Fetch business settings
        const { data: settings } = await supabase
          .from('invoice_settings')
          .select('*')
          .eq('user_id', invoiceData.user_id)
          .maybeSingle()

        setBusinessSettings(settings)
        setLoading(false)
      } catch (err) {
        console.error('Error fetching invoice:', err)
        setError('Failed to load invoice')
        setLoading(false)
      }
    }

    if (token) {
      fetchInvoice()
    }
  }, [token])

  const handleDownloadPDF = () => {
    if (!invoice) return

    try {
      const pdfData: InvoicePDFData = {
        ...invoice,
        businessSettings: businessSettings || null
      }

      downloadInvoicePDF(pdfData, 'NGN')
      toast.success('Invoice PDF downloaded')
    } catch (error) {
      console.error('Error downloading PDF:', error)
      toast.error('Failed to download PDF')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">Loading invoice...</p>
        </div>
      </div>
    )
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Invoice Not Found</h1>
              <p className="text-gray-600 mb-4">{error || 'The invoice link is invalid or has expired.'}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const businessName = businessSettings?.business_name || 'Business'
  const statusColors = {
    draft: 'bg-gray-100 text-gray-800',
    sent: 'bg-blue-100 text-blue-800',
    paid: 'bg-green-100 text-green-800',
    overdue: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-600'
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white shadow-sm rounded-lg mb-6 p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Invoice</h1>
              <p className="text-gray-600">#{invoice.invoice_number}</p>
            </div>
            <div className="text-right">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusColors[invoice.status]}`}>
                {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
              </span>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">From</p>
              <p className="font-semibold text-gray-900">{businessName}</p>
              {businessSettings?.business_email && (
                <p className="text-sm text-gray-600">{businessSettings.business_email}</p>
              )}
            </div>
            <Button onClick={handleDownloadPDF} className="gap-2">
              <FileDown className="h-4 w-4" />
              Download PDF
            </Button>
          </div>
        </div>

        {/* Invoice Details */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Invoice Date</p>
                <p className="text-gray-900">{formatInvoiceDate(invoice.invoice_date)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Due Date</p>
                <p className="text-gray-900">{formatInvoiceDate(invoice.due_date)}</p>
              </div>
              {invoice.paid_date && (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Paid Date</p>
                  <p className="text-gray-900">{formatInvoiceDate(invoice.paid_date)}</p>
                </div>
              )}
            </div>

            <div className="mb-8">
              <p className="text-sm font-medium text-gray-600 mb-2">Bill To</p>
              <p className="font-semibold text-gray-900">{invoice.client.name}</p>
              {invoice.client.email && <p className="text-sm text-gray-600">{invoice.client.email}</p>}
              {invoice.client.phone && <p className="text-sm text-gray-600">{invoice.client.phone}</p>}
              {invoice.client.address && (
                <p className="text-sm text-gray-600">
                  {invoice.client.address}
                  {invoice.client.city && invoice.client.state && `, ${invoice.client.city}, ${invoice.client.state}`}
                </p>
              )}
            </div>

            {/* Line Items */}
            <div className="border-t border-gray-200 pt-6">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 text-sm font-medium text-gray-600">Description</th>
                    <th className="text-right py-3 text-sm font-medium text-gray-600">Qty</th>
                    <th className="text-right py-3 text-sm font-medium text-gray-600">Price</th>
                    <th className="text-right py-3 text-sm font-medium text-gray-600">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item) => (
                    <tr key={item.id} className="border-b border-gray-100">
                      <td className="py-4 text-gray-900">{item.description}</td>
                      <td className="py-4 text-right text-gray-600">{item.quantity}</td>
                      <td className="py-4 text-right text-gray-600">NGN {formatAmount(item.unit_price)}</td>
                      <td className="py-4 text-right text-gray-900">NGN {formatAmount(item.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="mt-8 flex justify-end">
              <div className="w-full md:w-1/2 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">NGN {formatAmount(invoice.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax ({invoice.tax_rate}%)</span>
                  <span className="text-gray-900">NGN {formatAmount(invoice.tax_amount)}</span>
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between">
                  <span className="text-lg font-semibold text-gray-900">Total</span>
                  <span className="text-lg font-bold text-gray-900">NGN {formatAmount(invoice.total_amount)}</span>
                </div>
              </div>
            </div>

            {/* Notes and Terms */}
            {(invoice.notes || invoice.terms) && (
              <div className="mt-8 pt-8 border-t border-gray-200 space-y-4">
                {invoice.notes && (
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Notes</p>
                    <p className="text-gray-900 whitespace-pre-wrap">{invoice.notes}</p>
                  </div>
                )}
                {invoice.terms && (
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Payment Terms</p>
                    <p className="text-gray-900 whitespace-pre-wrap">{invoice.terms}</p>
                  </div>
                )}
              </div>
            )}

            {/* Bank Details */}
            {(businessSettings?.bank_name || businessSettings?.account_number) && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <p className="text-sm font-medium text-gray-600 mb-3">Bank Details</p>
                <div className="space-y-1 text-sm">
                  {businessSettings.bank_name && (
                    <p className="text-gray-900">
                      <span className="text-gray-600">Bank:</span> {businessSettings.bank_name}
                    </p>
                  )}
                  {businessSettings.account_name && (
                    <p className="text-gray-900">
                      <span className="text-gray-600">Account Name:</span> {businessSettings.account_name}
                    </p>
                  )}
                  {businessSettings.account_number && (
                    <p className="text-gray-900">
                      <span className="text-gray-600">Account Number:</span> {businessSettings.account_number}
                    </p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>Powered by SpendTab</p>
        </div>
      </div>
    </div>
  )
}
