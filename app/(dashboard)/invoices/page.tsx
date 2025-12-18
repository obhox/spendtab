"use client"

import React, { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { InvoiceForm } from "@/components/invoices/invoice-form"
import { InvoiceTable } from "@/components/invoices/invoice-table"
import { useInvoiceQuery } from "@/lib/hooks/useInvoiceQuery"
import { useSelectedCurrency } from "@/components/currency-switcher"
import { DollarSign, AlertTriangle, CheckCircle, FileText } from "lucide-react"

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground">
            Create and manage your invoices
          </p>
        </div>
        <InvoiceForm />
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Outstanding */}
        <Card style={{ backgroundColor: '#E6F1FD' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Outstanding
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {selectedCurrency.symbol}{metrics.totalOutstanding.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Unpaid invoices
            </p>
          </CardContent>
        </Card>

        {/* Overdue Amount */}
        <Card style={{ backgroundColor: metrics.overdueAmount > 0 ? '#FEE2E2' : '#EDEEFC' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Overdue Amount
            </CardTitle>
            <AlertTriangle className={`h-4 w-4 ${metrics.overdueAmount > 0 ? 'text-red-500' : 'text-muted-foreground'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${metrics.overdueAmount > 0 ? 'text-red-600' : ''}`}>
              {selectedCurrency.symbol}{metrics.overdueAmount.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Past due date
            </p>
          </CardContent>
        </Card>

        {/* Paid This Month */}
        <Card style={{ backgroundColor: '#E6F1FD' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Paid This Month
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {selectedCurrency.symbol}{metrics.paidThisMonth.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Received in {new Date().toLocaleDateString('en-US', { month: 'long' })}
            </p>
          </CardContent>
        </Card>

        {/* Draft Invoices */}
        <Card style={{ backgroundColor: '#EDEEFC' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Draft Invoices
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.draftCount}
            </div>
            <p className="text-xs text-muted-foreground">
              Not yet sent
            </p>
          </CardContent>
        </Card>
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
