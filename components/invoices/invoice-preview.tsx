"use client"

import React, { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { useInvoiceSettings, type InvoiceSettings } from "@/lib/hooks/useInvoiceSettings"
import { useSelectedCurrency } from "@/components/currency-switcher"
import { InvoiceStatusBadge } from "./invoice-status-badge"
import { formatInvoiceDate, formatInvoiceDateLong } from "@/lib/invoice-utils"
import { FileDown, X, Mail, Phone, MapPin, Globe, Building2 } from "lucide-react"
import { downloadInvoicePDF, type InvoicePDFData } from "@/lib/invoice-pdf-generator"
import { toast } from "sonner"
import type { Invoice } from "@/lib/hooks/useInvoiceQuery"

interface InvoicePreviewProps {
  invoice: Invoice | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InvoicePreview({ invoice, open, onOpenChange }: InvoicePreviewProps) {
  const { settings } = useInvoiceSettings();
  const selectedCurrency = useSelectedCurrency();
  const [fullInvoice, setFullInvoice] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (invoice && open) {
      loadFullInvoice();
    }
  }, [invoice, open]);

  const loadFullInvoice = async () => {
    if (!invoice) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*, client:clients(*), items:invoice_items(*)')
        .eq('id', invoice.id)
        .single();

      if (error) throw error;
      setFullInvoice(data);
    } catch (error) {
      console.error('Error loading invoice:', error);
      toast.error('Failed to load invoice details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!fullInvoice) {
      toast.error('Invoice data not loaded');
      return;
    }

    try {
      const pdfData: InvoicePDFData = {
        ...fullInvoice,
        businessSettings: settings || null
      };

      downloadInvoicePDF(pdfData, selectedCurrency.code);
      toast.success('Invoice PDF downloaded');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Failed to download PDF: ${errorMessage}`);
    }
  };

  if (!invoice || !fullInvoice) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh]">
          <div className="flex items-center justify-center py-12">
            {isLoading ? 'Loading invoice...' : 'No invoice selected'}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const businessInfo: Partial<InvoiceSettings> = settings || {
    business_name: fullInvoice.userProfile?.company_name,
    business_email: fullInvoice.userProfile?.email
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Invoice Preview</DialogTitle>
            <Button onClick={handleDownloadPDF} size="sm">
              <FileDown className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
          </div>
        </DialogHeader>

        {/* Invoice Preview */}
        <div className="border rounded-lg p-8 bg-white">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">INVOICE</h1>
              <p className="text-gray-600 mt-1">#{fullInvoice.invoice_number}</p>
            </div>
            <div className="text-right">
              <InvoiceStatusBadge status={fullInvoice.status} />
            </div>
          </div>

          {/* From/To Section */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            {/* From */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">From</h3>
              <div className="space-y-1">
                {businessInfo.business_name && (
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-gray-400" />
                    <p className="font-semibold text-gray-900">{businessInfo.business_name}</p>
                  </div>
                )}
                {businessInfo.business_email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <p className="text-sm text-gray-600">{businessInfo.business_email}</p>
                  </div>
                )}
                {businessInfo.business_phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <p className="text-sm text-gray-600">{businessInfo.business_phone}</p>
                  </div>
                )}
                {businessInfo.business_address && (
                  <div className="flex items-start gap-2 mt-2">
                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                    <div className="text-sm text-gray-600">
                      <p>{businessInfo.business_address}</p>
                      {(businessInfo.business_city || businessInfo.business_state) && (
                        <p>{businessInfo.business_city}{businessInfo.business_city && businessInfo.business_state && ', '}{businessInfo.business_state}</p>
                      )}
                    </div>
                  </div>
                )}
                {businessInfo.business_website && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-gray-400" />
                    <p className="text-sm text-gray-600">{businessInfo.business_website}</p>
                  </div>
                )}
              </div>
            </div>

            {/* To */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Bill To</h3>
              <div className="space-y-1">
                <p className="font-semibold text-gray-900">{fullInvoice.client.name}</p>
                {fullInvoice.client.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <p className="text-sm text-gray-600">{fullInvoice.client.email}</p>
                  </div>
                )}
                {fullInvoice.client.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <p className="text-sm text-gray-600">{fullInvoice.client.phone}</p>
                  </div>
                )}
                {fullInvoice.client.address && (
                  <div className="flex items-start gap-2 mt-2">
                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                    <div className="text-sm text-gray-600">
                      <p>{fullInvoice.client.address}</p>
                      {(fullInvoice.client.city || fullInvoice.client.state) && (
                        <p>{fullInvoice.client.city}{fullInvoice.client.city && fullInvoice.client.state && ', '}{fullInvoice.client.state}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-3 gap-4 mb-8 p-4 bg-gray-50 rounded">
            <div>
              <p className="text-sm font-semibold text-gray-500">Invoice Date</p>
              <p className="text-sm text-gray-900">{formatInvoiceDate(fullInvoice.invoice_date)}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500">Due Date</p>
              <p className="text-sm text-gray-900">{formatInvoiceDate(fullInvoice.due_date)}</p>
            </div>
            {fullInvoice.paid_date && (
              <div>
                <p className="text-sm font-semibold text-gray-500">Paid Date</p>
                <p className="text-sm text-gray-900">{formatInvoiceDate(fullInvoice.paid_date)}</p>
              </div>
            )}
          </div>

          {/* Line Items */}
          <div className="mb-8">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-900">
                  <th className="text-left py-3 text-sm font-semibold text-gray-900">Description</th>
                  <th className="text-right py-3 text-sm font-semibold text-gray-900">Qty</th>
                  <th className="text-right py-3 text-sm font-semibold text-gray-900">Price</th>
                  <th className="text-right py-3 text-sm font-semibold text-gray-900">Amount</th>
                </tr>
              </thead>
              <tbody>
                {fullInvoice.items.map((item: any, index: number) => (
                  <tr key={index} className="border-b border-gray-200">
                    <td className="py-3 text-sm text-gray-900">{item.description}</td>
                    <td className="py-3 text-sm text-gray-600 text-right">{item.quantity}</td>
                    <td className="py-3 text-sm text-gray-600 text-right">{selectedCurrency.symbol}{item.unit_price.toFixed(2)}</td>
                    <td className="py-3 text-sm text-gray-900 text-right font-medium">{selectedCurrency.symbol}{item.amount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="text-gray-900 font-medium">{selectedCurrency.symbol}{fullInvoice.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax ({fullInvoice.tax_rate}%):</span>
                <span className="text-gray-900 font-medium">{selectedCurrency.symbol}{fullInvoice.tax_amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t-2 border-gray-900 pt-2">
                <span className="text-gray-900">Total:</span>
                <span className="text-gray-900">{selectedCurrency.symbol}{fullInvoice.total_amount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Notes & Terms */}
          {(fullInvoice.notes || fullInvoice.terms) && (
            <div className="space-y-4 pt-4 border-t">
              {fullInvoice.notes && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-1">Notes</h4>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{fullInvoice.notes}</p>
                </div>
              )}
              {fullInvoice.terms && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-1">Payment Terms</h4>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{fullInvoice.terms}</p>
                </div>
              )}
            </div>
          )}

          {/* Bank Details (if configured) */}
          {(businessInfo.bank_name || businessInfo.account_number) && (
            <div className="mt-6 pt-4 border-t">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Bank Details</h4>
              <div className="text-sm text-gray-600 space-y-1">
                {businessInfo.bank_name && <p>Bank: {businessInfo.bank_name}</p>}
                {businessInfo.account_name && <p>Account Name: {businessInfo.account_name}</p>}
                {businessInfo.account_number && <p>Account Number: {businessInfo.account_number}</p>}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
