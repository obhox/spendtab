"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileText, Download, Calculator, Receipt, TrendingUp, DollarSign } from "lucide-react"
import { useTransactionQuery } from "@/lib/hooks/useTransactionQuery"
import { useSelectedCurrency, formatCurrency } from "@/components/currency-switcher"
import { US_TAX_CATEGORIES, getTaxCategoriesByType } from "@/lib/us-tax-categories"

interface Transaction {
  id: string
  date: string
  description: string
  category: string
  amount: number
  type: "income" | "expense"
  payment_source: string
  notes?: string
  budget_id?: string | null
  account_id: string
  tax_deductible?: boolean
  tax_category?: string
  business_purpose?: string
  receipt_url?: string
  mileage?: number
}

export function TaxReports() {
  const { transactions: allTransactions, isLoading } = useTransactionQuery()
  const selectedCurrency = useSelectedCurrency()
  const [selectedTaxYear, setSelectedTaxYear] = useState(new Date().getFullYear().toString())

  // Filter transactions for tax year and tax deductible items
  const taxTransactions = useMemo(() => {
    return (allTransactions as Transaction[]).filter(transaction => {
      const transactionYear = new Date(transaction.date).getFullYear()
      return transactionYear.toString() === selectedTaxYear && transaction.tax_deductible
    })
  }, [allTransactions, selectedTaxYear])

  // Group transactions by tax category
  const taxCategorySummary = useMemo(() => {
    const summary: Record<string, { total: number; count: number; transactions: Transaction[] }> = {}
    
    taxTransactions.forEach(transaction => {
      const category = transaction.tax_category || "Uncategorized"
      if (!summary[category]) {
        summary[category] = { total: 0, count: 0, transactions: [] }
      }
      summary[category].total += transaction.amount
      summary[category].count += 1
      summary[category].transactions.push(transaction)
    })
    
    return summary
  }, [taxTransactions])

  // Calculate totals
  const totalDeductions = useMemo(() => {
    return taxTransactions
      .filter(t => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0)
  }, [taxTransactions])

  const totalTaxableIncome = useMemo(() => {
    return taxTransactions
      .filter(t => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0)
  }, [taxTransactions])

  // Get available tax years
  const availableYears = useMemo(() => {
    const years = new Set<number>()
    allTransactions.forEach(transaction => {
      years.add(new Date(transaction.date).getFullYear())
    })
    return Array.from(years).sort((a, b) => b - a)
  }, [allTransactions])

  // Business expenses breakdown
  const businessExpenses = useMemo(() => {
    return taxTransactions.filter(t => 
      t.type === "expense" && 
      getTaxCategoriesByType("business_expense").some(cat => cat.name === t.tax_category)
    )
  }, [taxTransactions])

  // Personal deductions breakdown
  const personalDeductions = useMemo(() => {
    return taxTransactions.filter(t => 
      t.type === "expense" && 
      getTaxCategoriesByType("personal_deduction").some(cat => cat.name === t.tax_category)
    )
  }, [taxTransactions])

  const exportToCSV = () => {
    const headers = [
      "Date", "Description", "Category", "Tax Category", "Amount", "Type", 
      "Business Purpose", "Receipt URL", "Mileage"
    ]
    
    const csvContent = [
      headers.join(","),
      ...taxTransactions.map(t => [
        t.date,
        `"${t.description}"`,
        `"${t.category}"`,
        `"${t.tax_category || ""}"`,
        t.amount,
        t.type,
        `"${t.business_purpose || ""}"`,
        `"${t.receipt_url || ""}"`,
        t.mileage || ""
      ].join(","))
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `tax-report-${selectedTaxYear}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (isLoading) {
    return <div className="flex justify-center items-center py-8">Loading tax reports...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold">US Tax Reports</h1>
          <p className="text-muted-foreground">
            Comprehensive tax preparation reports for the US tax system
          </p>
        </div>
        <div className="flex items-center gap-2 justify-end">
          <Select value={selectedTaxYear} onValueChange={setSelectedTaxYear}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableYears.map(year => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={exportToCSV} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Deductions</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalDeductions, selectedCurrency.code, selectedCurrency.symbol)}
            </div>
            <p className="text-xs text-muted-foreground">
              {taxTransactions.filter(t => t.type === "expense").length} deductible expenses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxable Income</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalTaxableIncome, selectedCurrency.code, selectedCurrency.symbol)}
            </div>
            <p className="text-xs text-muted-foreground">
              {taxTransactions.filter(t => t.type === "income").length} income transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tax Categories</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.keys(taxCategorySummary).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Different tax categories used
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Reports */}
      <Tabs defaultValue="summary" className="space-y-4">
        <TabsList>
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="business">Business Expenses</TabsTrigger>
          <TabsTrigger value="personal">Personal Deductions</TabsTrigger>
          <TabsTrigger value="details">Transaction Details</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tax Category Summary</CardTitle>
              <CardDescription>
                Breakdown of deductions by IRS tax category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tax Category</TableHead>
                    <TableHead className="text-right">Count</TableHead>
                    <TableHead className="text-right">Total Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(taxCategorySummary)
                    .sort(([,a], [,b]) => b.total - a.total)
                    .map(([category, data]) => (
                    <TableRow key={category}>
                      <TableCell className="font-medium">{category}</TableCell>
                      <TableCell className="text-right">{data.count}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(data.total, selectedCurrency.code, selectedCurrency.symbol)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="business" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Business Expenses</CardTitle>
              <CardDescription>
                Schedule C business deductions for {selectedTaxYear}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Tax Category</TableHead>
                    <TableHead>Business Purpose</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Receipt</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {businessExpenses.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{(() => {
                  // Parse date as local date to avoid timezone issues
                  if (transaction.date && transaction.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
                    const [year, month, day] = transaction.date.split('-').map(Number)
                    const date = new Date(year, month - 1, day) // month is 0-indexed
                    return date.toLocaleDateString()
                  }
                  return new Date(transaction.date).toLocaleDateString()
                })()}</TableCell>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{transaction.tax_category}</Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {transaction.business_purpose || "-"}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(transaction.amount, selectedCurrency.code, selectedCurrency.symbol)}
                      </TableCell>
                      <TableCell>
                        {transaction.receipt_url ? (
                          <a 
                            href={transaction.receipt_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Receipt className="h-4 w-4" />
                          </a>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="personal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Personal Deductions</CardTitle>
              <CardDescription>
                Schedule A itemized deductions for {selectedTaxYear}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Tax Category</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Receipt</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {personalDeductions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{(() => {
                  // Parse date as local date to avoid timezone issues
                  if (transaction.date && transaction.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
                    const [year, month, day] = transaction.date.split('-').map(Number)
                    const date = new Date(year, month - 1, day) // month is 0-indexed
                    return date.toLocaleDateString()
                  }
                  return new Date(transaction.date).toLocaleDateString()
                })()}</TableCell>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{transaction.tax_category}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(transaction.amount, selectedCurrency.code, selectedCurrency.symbol)}
                      </TableCell>
                      <TableCell>
                        {transaction.receipt_url ? (
                          <a 
                            href={transaction.receipt_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Receipt className="h-4 w-4" />
                          </a>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Tax-Related Transactions</CardTitle>
              <CardDescription>
                Complete list of tax deductible transactions for {selectedTaxYear}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Tax Category</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Receipt</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {taxTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{(() => {
                  // Parse date as local date to avoid timezone issues
                  if (transaction.date && transaction.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
                    const [year, month, day] = transaction.date.split('-').map(Number)
                    const date = new Date(year, month - 1, day) // month is 0-indexed
                    return date.toLocaleDateString()
                  }
                  return new Date(transaction.date).toLocaleDateString()
                })()}</TableCell>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell>{transaction.category}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{transaction.tax_category}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={transaction.type === "income" ? "default" : "secondary"}>
                          {transaction.type}
                        </Badge>
                      </TableCell>
                      <TableCell className={`text-right font-medium ${
                        transaction.type === "income" ? "text-green-600" : "text-red-600"
                      }`}>
                        {transaction.type === "income" ? "+" : "-"}
                        {formatCurrency(transaction.amount, selectedCurrency.code, selectedCurrency.symbol)}
                      </TableCell>
                      <TableCell>
                        {transaction.receipt_url ? (
                          <a 
                            href={transaction.receipt_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Receipt className="h-4 w-4" />
                          </a>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}