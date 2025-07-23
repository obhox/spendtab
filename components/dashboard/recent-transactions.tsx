"use client"

import { ArrowDownIcon, ArrowUpIcon, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useTransactionQuery } from "@/lib/hooks/useTransactionQuery"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useSelectedCurrency, formatCurrency as formatCurrencyUtil } from "@/components/currency-switcher"

interface Transaction {
  id: string
  amount: number
  date: string
  description: string
  type: "income" | "expense"
  category: string
}

export function RecentTransactions() {
  const { transactions, isLoading } = useTransactionQuery()
  const selectedCurrency = useSelectedCurrency()
  
  // Format date to more readable format
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString || '')
      return isNaN(date.getTime())
        ? 'Invalid date'
        : new Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }).format(date)
    } catch (error) {
      return 'Invalid date'
    }
  }
  
  // Format currency with support for the transaction type
  const formatCurrency = (amount: number, type: string) => {
    let value = 0
    
    // Ensure amount is a valid number
    if (typeof amount === 'number' && !isNaN(amount)) {
      value = amount
    } else if (typeof amount === 'string') {
      // Try to parse string to number
      const parsed = parseFloat(amount)
      if (!isNaN(parsed)) {
        value = parsed
      }
    }
    
    // Format according to the type (income/expense)
    const isIncome = type === "income" || value > 0
    const prefix = isIncome ? "+" : ""
    
    return prefix + formatCurrencyUtil(Math.abs(value), selectedCurrency.code, selectedCurrency.symbol)
  }
  
  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardContent>
          <div className="py-2 text-sm text-center">Loading transactions...</div>
        </CardContent>
      </Card>
    )
  }
  
  // Get the most recent 5 transactions
  const recentTransactions = transactions
    ?.sort((a, b) => {
      const dateA = new Date(a.date || '')
      const dateB = new Date(b.date || '')
      return dateB.getTime() - dateA.getTime()
    })
    .slice(0, 5) || []
  
  // Empty state
  if (!recentTransactions || recentTransactions.length === 0) {
    return (
      <Card>
        <CardContent>
          <div className="py-6 flex flex-col items-center justify-center text-center space-y-2">
            <p className="text-sm font-medium text-muted-foreground">No transactions yet</p>
            <p className="text-xs text-muted-foreground mb-4">
              Add your income and expense transactions to track your financial activity
            </p>
            <Link href="/transactions">
              <Button size="sm" variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Add First Transaction
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="p-3 sm:p-4 md:p-6">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base sm:text-lg">Recent Transactions</CardTitle>
          <Link href="/transactions">
            <Button variant="outline" size="sm" className="text-xs sm:text-sm">
              View All
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
        <div className="space-y-3 sm:space-y-4">
          {recentTransactions.map((transaction) => {
            const isIncome = transaction.type === "income"
            
            return (
              <div
                key={transaction.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0 sm:space-x-4 p-2 sm:p-3 rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-xs sm:text-sm font-medium text-primary">
                        {(transaction.description || 'U').charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm sm:text-base font-medium text-foreground truncate">
                      {transaction.description || 'Untitled Transaction'}
                    </p>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 text-xs sm:text-sm text-muted-foreground">
                      <span>{formatDate(transaction.date)}</span>
                      {transaction.category && (
                        <>
                          <span className="hidden sm:inline">•</span>
                          <Badge variant="secondary" className="text-xs mt-1 sm:mt-0 w-fit">
                            {transaction.category}
                          </Badge>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex-shrink-0 text-right sm:text-left">
                  <span
                    className={`text-sm sm:text-base font-semibold ${
                      transaction.type === 'income'
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {formatCurrency(transaction.amount, transaction.type)}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
