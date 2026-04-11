"use client"

import React, { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { InvoiceForm } from "@/components/invoices/invoice-form"
import { InvoiceTable } from "@/components/invoices/invoice-table"
import { useInvoiceQuery } from "@/lib/hooks/useInvoiceQuery"
import { formatAmount } from "@/lib/invoice-utils"
import { useSelectedCurrency } from "@/components/currency-switcher"
import { DollarSign, AlertTriangle, CheckCircle, FileText, Settings } from "lucide-react"
import Link from "next/link"

export default function InvoicesPage() {
  const { invoices, isLoading } = useInvoiceQuery();
  const selectedCurrency = useSelectedCurrency();

  // Calculate metrics
  const metrics = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const totalOutstanding = invoices
      .filter(inv => inv.status !== 'paid' && inv.status !== 'cancelled')
      .reduce((sum, inv) => sum + inv.total_amount, 0);

    const overdueAmount = invoices
      .filter(inv => inv.status === 'overdue')
      .reduce((sum, inv) => sum + inv.total_amount, 0);

    const paidThisMonth = invoices
      .filter(inv =>
        inv.status === 'paid' &&
        inv.paid_date &&
        new Date(inv.paid_date) >= startOfMonth
      )
      .reduce((sum, inv) => sum + inv.total_amount, 0);

    const draftCount = invoices.filter(inv => inv.status === 'draft').length;

    return {
      totalOutstanding,
      overdueAmount,
      paidThisMonth,
      draftCount
    };
  }, [invoices]);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Invoices</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Create and manage your invoices</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link href="/invoice-settings">
            <Button variant="outline" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
          </Link>
          <InvoiceForm />
        </div>
      </div>

      {/* Metric Cards — bento grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-ibm-g20">
        <div className="bg-white p-4 sm:p-6 min-h-[110px] flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <p className="ibm-label">Outstanding</p>
            <DollarSign className="h-3.5 w-3.5 text-ibm-g50" />
          </div>
          <div>
            <p className="text-lg sm:text-2xl font-semibold text-ibm-black tracking-tight">
              {selectedCurrency.symbol}{formatAmount(metrics.totalOutstanding)}
            </p>
            <p className="text-xs text-ibm-g50 mt-0.5">Unpaid invoices</p>
          </div>
        </div>

        <div className={`p-4 sm:p-6 min-h-[110px] flex flex-col justify-between ${metrics.overdueAmount > 0 ? 'bg-ibm-red' : 'bg-ibm-g10'}`}>
          <div className="flex items-start justify-between">
            <p className={`ibm-label ${metrics.overdueAmount > 0 ? 'text-white/60' : ''}`}>Overdue</p>
            <AlertTriangle className={`h-3.5 w-3.5 ${metrics.overdueAmount > 0 ? 'text-white/60' : 'text-ibm-g50'}`} />
          </div>
          <div>
            <p className={`text-lg sm:text-2xl font-semibold tracking-tight ${metrics.overdueAmount > 0 ? 'text-white' : 'text-ibm-black'}`}>
              {selectedCurrency.symbol}{formatAmount(metrics.overdueAmount)}
            </p>
            <p className={`text-xs mt-0.5 ${metrics.overdueAmount > 0 ? 'text-white/60' : 'text-ibm-g50'}`}>Past due date</p>
          </div>
        </div>

        <div className="bg-ibm-blue p-4 sm:p-6 min-h-[110px] flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-white/60">Paid</p>
            <CheckCircle className="h-3.5 w-3.5 text-white/60" />
          </div>
          <div>
            <p className="text-lg sm:text-2xl font-semibold text-white tracking-tight">
              {selectedCurrency.symbol}{formatAmount(metrics.paidThisMonth)}
            </p>
            <p className="text-xs text-white/60 mt-0.5">{new Date().toLocaleDateString('en-US', { month: 'long' })}</p>
          </div>
        </div>

        <div className="bg-ibm-black p-4 sm:p-6 min-h-[110px] flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-white/40">Drafts</p>
            <FileText className="h-3.5 w-3.5 text-white/40" />
          </div>
          <div>
            <p className="text-lg sm:text-2xl font-semibold text-white tracking-tight">{metrics.draftCount}</p>
            <p className="text-xs text-white/40 mt-0.5">Not yet sent</p>
          </div>
        </div>
      </div>

      {/* Invoice Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <InvoiceTable />
        </CardContent>
      </Card>
    </div>
  );
}
