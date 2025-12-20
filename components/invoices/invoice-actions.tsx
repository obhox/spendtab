"use client"

import React, { useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { MoreVertical, FileDown, CheckCircle2, Trash2, Send, Ban, CalendarIcon } from "lucide-react"
import { useInvoiceQuery, type Invoice } from "@/lib/hooks/useInvoiceQuery"
import { useClientQuery } from "@/lib/hooks/useClientQuery"
import { downloadInvoicePDF, type InvoicePDFData } from "@/lib/invoice-pdf-generator"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { useSelectedCurrency } from "@/components/currency-switcher"
import { formatAmount } from "@/lib/invoice-utils"

interface InvoiceActionsProps {
  invoice: Invoice;
}

export function InvoiceActions({ invoice }: InvoiceActionsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showMarkAsPaidDialog, setShowMarkAsPaidDialog] = useState(false);
  const [paidDate, setPaidDate] = useState<Date>(new Date());
  const [paymentSource, setPaymentSource] = useState<string>("bank_transfer");
  const { deleteInvoice, markAsPaid, updateStatus } = useInvoiceQuery();
  const selectedCurrency = useSelectedCurrency();

  const handleDelete = () => {
    deleteInvoice(invoice.id);
    setShowDeleteDialog(false);
  };

  const handleMarkAsPaid = () => {
    markAsPaid({
      invoiceId: invoice.id,
      paidDate: format(paidDate, 'yyyy-MM-dd'),
      paymentSource: paymentSource
    });
    setShowMarkAsPaidDialog(false);
  };

  const handleDownloadPDF = async () => {
    try {
      // Fetch invoice with all details
      const { data: invoiceData, error: invoiceError } = await supabase
        .from('invoices')
        .select('*, client:clients(*), items:invoice_items(*)')
        .eq('id', invoice.id)
        .single();

      if (invoiceError) {
        console.error('Invoice fetch error:', invoiceError);
        throw new Error(`Failed to fetch invoice: ${invoiceError.message}`);
      }

      // Fetch business settings
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const { data: settingsData } = await supabase
        .from('invoice_settings')
        .select('*')
        .eq('user_id', session.user.id)
        .maybeSingle();

      const pdfData: InvoicePDFData = {
        ...invoiceData,
        businessSettings: settingsData || null
      };

      // Generate and download PDF
      downloadInvoicePDF(pdfData, selectedCurrency.code);
      toast.success('Invoice PDF downloaded');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Failed to download PDF: ${errorMessage}`);
    }
  };

  const handleMarkAsSent = async () => {
    try {
      // First, fetch the complete invoice data
      const { data: invoiceData, error: invoiceError } = await supabase
        .from('invoices')
        .select('*, client:clients(*)')
        .eq('id', invoice.id)
        .single();

      if (invoiceError || !invoiceData) {
        console.error('Error fetching invoice:', invoiceError);
        toast.error('Failed to fetch invoice details');
        return;
      }

      // Check if client has an email
      if (!invoiceData.client?.email) {
        toast.error('Cannot send invoice: Client does not have an email address');
        return;
      }

      // Ensure invoice has a share token
      let shareToken = invoiceData.share_token;

      if (!shareToken) {
        // Generate a secure random token
        const randomBytes = new Uint8Array(24);
        crypto.getRandomValues(randomBytes);
        shareToken = btoa(String.fromCharCode(...randomBytes))
          .replace(/\//g, '_')
          .replace(/\+/g, '-')
          .replace(/=/g, '');

        // Update invoice with the new token
        const { error: updateError } = await supabase
          .from('invoices')
          .update({ share_token: shareToken })
          .eq('id', invoice.id);

        if (updateError) {
          console.error('Error saving share token:', updateError);
          toast.error('Failed to generate invoice link');
          return;
        }
      }

      // Fetch business settings
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('You must be logged in to send invoices');
        return;
      }

      const { data: settingsData } = await supabase
        .from('invoice_settings')
        .select('*')
        .eq('user_id', session.user.id)
        .maybeSingle();

      // Format dates and amounts for email
      const dueDate = new Date(invoiceData.due_date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      const invoiceDate = new Date(invoiceData.invoice_date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      const totalAmount = invoiceData.total_amount.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });

      const currencySymbol = selectedCurrency.code === 'USD' ? '$' : selectedCurrency.code;

      // Update the status first
      updateStatus({ invoiceId: invoice.id, status: 'sent' });

      // Then send the invoice email
      const response = await fetch('/api/email/send-invoice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invoiceNumber: invoiceData.invoice_number,
          clientEmail: invoiceData.client.email,
          clientName: invoiceData.client.name,
          businessName: settingsData?.business_name || 'Your Business',
          totalAmount: totalAmount,
          currencySymbol: currencySymbol,
          dueDate: dueDate,
          invoiceDate: invoiceDate,
          shareToken: shareToken,
          businessEmail: settingsData?.business_email || '',
          status: 'sent'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Email send error:', errorData);
        toast.error(`Invoice marked as sent, but email failed to send: ${errorData.error}`);
        return;
      }

      toast.success('Invoice marked as sent and email sent to customer');
    } catch (error) {
      console.error('Error sending invoice email:', error);
      toast.error('Invoice marked as sent, but failed to send email');
    }
  };

  const handleMarkAsCancelled = () => {
    updateStatus({ invoiceId: invoice.id, status: 'cancelled' });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={handleDownloadPDF}>
            <FileDown className="mr-2 h-4 w-4" />
            Download PDF
          </DropdownMenuItem>

          {invoice.status === 'draft' && (
            <DropdownMenuItem onClick={handleMarkAsSent}>
              <Send className="mr-2 h-4 w-4" />
              Mark as Sent
            </DropdownMenuItem>
          )}

          {(invoice.status === 'draft' || invoice.status === 'sent' || invoice.status === 'overdue') && (
            <DropdownMenuItem onClick={() => setShowMarkAsPaidDialog(true)}>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Mark as Paid
            </DropdownMenuItem>
          )}

          {invoice.status !== 'cancelled' && invoice.status !== 'paid' && (
            <DropdownMenuItem onClick={handleMarkAsCancelled}>
              <Ban className="mr-2 h-4 w-4" />
              Cancel Invoice
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => setShowDeleteDialog(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Mark as Paid Dialog */}
      <Dialog open={showMarkAsPaidDialog} onOpenChange={setShowMarkAsPaidDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark Invoice as Paid</DialogTitle>
            <DialogDescription>
              This will create an income transaction for {selectedCurrency.symbol}{formatAmount(invoice.total_amount)}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Payment Date */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Payment Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full pl-3 text-left font-normal",
                      !paidDate && "text-muted-foreground"
                    )}
                  >
                    {paidDate ? (
                      format(paidDate, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={paidDate}
                    onSelect={(date) => date && setPaidDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Payment Source */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Payment Source</label>
              <Select value={paymentSource} onValueChange={setPaymentSource}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="credit_card">Credit Card</SelectItem>
                  <SelectItem value="debit_card">Debit Card</SelectItem>
                  <SelectItem value="stripe">Stripe</SelectItem>
                  <SelectItem value="paypal">PayPal</SelectItem>
                  <SelectItem value="check">Check</SelectItem>
                  <SelectItem value="mobile_payment">Mobile Payment</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMarkAsPaidDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleMarkAsPaid}>
              Mark as Paid
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete invoice {invoice.invoice_number}.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
