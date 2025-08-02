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
  
  // Format date to more readable format without timezone issues
  const formatDate = (dateString: string) => {
    try {
      // Parse date as local date to avoid timezone issues
      if (dateString && dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = dateString.split('-').map(Number)
        const date = new Date(year, month - 1, day) // month is 0-indexed
        return new Intl.DateTimeFormat("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }).format(date)
      }
      
      // Fallback for other date formats
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
    const isIncome = type === "income"
    const prefix = isIncome ? "+" : "-"
    
    return prefix + formatCurrencyUtil(Math.abs(value), selectedCurrency.code, selectedCurrency.symbol)
  }
  
  // Loading state
  if (isLoading) {
    return (
      <Card style={{ backgroundColor: '#F9F9FA' }}>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-6 sm:py-8 text-center text-sm text-muted-foreground">Loading transactions...</div>
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
      <Card style={{ backgroundColor: '#F9F9FA' }}>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 sm:py-8">
            <Plus className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-3 sm:mb-4" />
            <h3 className="text-base sm:text-lg font-semibold mb-2">No transactions yet</h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-4 px-2">
              Add your income and expense transactions to track your financial activity.
            </p>
            <Link href="/transactions">
              <Button size="sm" className="text-sm">
                <Plus className="h-4 w-4 mr-2" />
                Add First Transaction
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card style={{ backgroundColor: '#F9F9FA' }}>
      <CardHeader className="pb-3 sm:pb-6">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <CardTitle className="text-lg sm:text-xl truncate">Recent Transactions</CardTitle>
          </div>
          <Link href="/transactions">
            <Button variant="outline" size="sm" className="text-xs sm:text-sm px-2 sm:px-3 h-8 sm:h-9 flex-shrink-0">
              <span className="hidden sm:inline">View All</span>
              <span className="sm:hidden">All</span>
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="pt-0 px-3 sm:px-6 pb-4 sm:pb-6">
        <div className="space-y-3 sm:space-y-4">
          {recentTransactions.map((transaction) => {
            const isIncome = transaction.type === "income"
            
            return (
              <div
                key={transaction.id}
                className="flex items-start sm:items-center gap-3 sm:gap-4"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm sm:text-base truncate">
                    {transaction.description || 'Untitled Transaction'}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {formatDate(transaction.date)}
                    </p>
                    {transaction.category && (
                      <Badge variant="outline" className="text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 flex-shrink-0">
                        <span className="truncate max-w-[80px] sm:max-w-none">{transaction.category}</span>
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex-shrink-0 text-right">
                  <span
                    className={`font-medium text-sm sm:text-base ${
                      transaction.type === 'income'
                        ? 'text-green-500'
                        : 'text-red-500'
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
