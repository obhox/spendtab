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
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-2 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
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
          <div className="text-center py-6">
            <Plus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No transactions yet</h3>
            <p className="text-muted-foreground mb-4">
              Add your income and expense transactions to track your financial activity.
            </p>
            <Link href="/transactions">
              <Button>
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
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Recent Transactions</CardTitle>
          </div>
          <Link href="/transactions">
            <Button variant="outline" size="sm">
              View All
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {recentTransactions.map((transaction) => {
            const isIncome = transaction.type === "income"
            
            return (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">
                        {(transaction.description || 'U').charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground truncate">
                      {transaction.description || 'Untitled Transaction'}
                    </p>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <span>{formatDate(transaction.date)}</span>
                      {transaction.category && (
                        <>
                          <span>•</span>
                          <Badge variant="secondary" className="text-xs">
                            {transaction.category}
                          </Badge>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex-shrink-0 text-right ml-3">
                  <span
                    className={`font-semibold ${
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
