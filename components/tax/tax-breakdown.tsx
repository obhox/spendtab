"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useTax } from "@/lib/context/TaxContext"
import { useFormatCurrency } from "@/components/currency-switcher"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function TaxBreakdown() {
  const {
    taxLiability,
    vatLiability,
    turnoverYTD,
    taxableIncome,
    isSmallBusinessQualified,
    taxSettings
  } = useTax()
  const formatCurrency = useFormatCurrency()

  const taxType = taxSettings?.business_type === 'individual' ? 'Personal Income Tax' : 'Company Income Tax';

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tax Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-lg" style={{ backgroundColor: '#F9FAFB' }}>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Turnover (YTD)</p>
              <p className="text-2xl font-bold">{formatCurrency(turnoverYTD)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Taxable Income</p>
              <p className="text-2xl font-bold">{formatCurrency(taxableIncome)}</p>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tax Component</TableHead>
                  <TableHead>Rate/Rule</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">{taxType}</TableCell>
                  <TableCell>
                    {isSmallBusinessQualified ? (
                      <span className="inline-flex items-center rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-700">
                        Exempt (Small Company)
                      </span>
                    ) : (
                      taxSettings?.business_type === 'individual' ? 'Progressive Bands' : '30% (Standard)'
                    )}
                  </TableCell>
                  <TableCell className="text-right">{formatCurrency(taxLiability.incomeTax)}</TableCell>
                </TableRow>
                {taxLiability.educationTax > 0 && (
                  <TableRow>
                    <TableCell className="font-medium">Tertiary Education Tax</TableCell>
                    <TableCell>3% of Assessable Profit</TableCell>
                    <TableCell className="text-right">{formatCurrency(taxLiability.educationTax)}</TableCell>
                  </TableRow>
                )}
                {taxLiability.itLevy > 0 && (
                  <TableRow>
                    <TableCell className="font-medium">IT Levy</TableCell>
                    <TableCell>1% of Profit Before Tax</TableCell>
                    <TableCell className="text-right">{formatCurrency(taxLiability.itLevy)}</TableCell>
                  </TableRow>
                )}
                <TableRow>
                  <TableCell className="font-bold">Total Estimated Tax</TableCell>
                  <TableCell></TableCell>
                  <TableCell className="text-right font-bold">{formatCurrency(taxLiability.totalTax)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          
          {vatLiability.vatCollected > 0 && (
            <div className="rounded-md border mt-6">
              <div className="bg-muted/50 px-4 py-2 border-b">
                <h3 className="font-semibold">VAT (Value Added Tax)</h3>
              </div>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">VAT Collected from Invoices</TableCell>
                    <TableCell className="text-right">{formatCurrency(vatLiability.vatCollected)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">VAT Paid on Expenses</TableCell>
                    <TableCell className="text-right">{formatCurrency(vatLiability.vatPaid)}</TableCell>
                  </TableRow>
                  <TableRow className="bg-muted/30">
                    <TableCell className="font-bold">Net VAT Liability</TableCell>
                    <TableCell className="text-right font-bold">{formatCurrency(vatLiability.netVatLiability)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          )}

          <div className="text-xs text-muted-foreground mt-4">
            <p>* This is an estimation based on your current transaction data and settings.</p>
            <p>* Small companies with turnover less than ₦50 Million are exempt from Company Income Tax.</p>
            {taxSettings?.business_type === 'individual' && (
               <p>* Personal Income Tax is calculated using the progressive tax bands and Consolidated Relief Allowance (CRA).</p>
            )}
            {vatLiability.vatCollected > 0 && (
              <p>* VAT is calculated from paid invoices in the current year.</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
