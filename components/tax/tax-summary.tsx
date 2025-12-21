"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useTax } from "@/lib/context/TaxContext"
import { useFormatCurrency } from "@/components/currency-switcher"
import { Loader2 } from "lucide-react"

export function TaxSummary() {
  const { taxLiability, vatLiability, isLoading } = useTax()
  const formatCurrency = useFormatCurrency()

  if (isLoading) {
    return (
      <div className="flex h-24 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card style={{ backgroundColor: '#FEE2E2' }}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Tax Liability
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(taxLiability.totalTax)}</div>
          <p className="text-xs text-muted-foreground">
            Income, Education & IT Taxes
          </p>
        </CardContent>
      </Card>
      <Card style={{ backgroundColor: '#FEF3C7' }}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            VAT Liability
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(vatLiability.netVatLiability)}</div>
          <p className="text-xs text-muted-foreground">
            Net VAT to remit
          </p>
        </CardContent>
      </Card>
      <Card style={{ backgroundColor: '#E6F1FD' }}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Income Tax (CIT/PIT)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(taxLiability.incomeTax)}</div>
          <p className="text-xs text-muted-foreground">
            Based on taxable income
          </p>
        </CardContent>
      </Card>
      <Card style={{ backgroundColor: '#EDEEFC' }}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Education Tax (EDT)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(taxLiability.educationTax)}</div>
          <p className="text-xs text-muted-foreground">
            Tertiary Education Tax
          </p>
        </CardContent>
      </Card>
      <Card style={{ backgroundColor: '#E6F1FD' }}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            IT Levy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(taxLiability.itLevy)}</div>
          <p className="text-xs text-muted-foreground">
            Information Technology Levy
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
