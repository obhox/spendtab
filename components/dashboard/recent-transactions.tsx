"use client"

import { ArrowDownIcon, ArrowUpIcon, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useTransactionQuery } from "@/lib/hooks/useTransactionQuery"
import { Button } from "@/components/ui/button"
import Link from "next/link"

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
    
    return prefix + new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(Math.abs(value))
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
            <Link href="/dashboard/transactions">
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
      <CardContent>
        <div className="space-y-4">
          {recentTransactions.map((transaction) => {
            const isIncome = transaction.type === "income"
            
            return (
              <div
                key={transaction.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors gap-2 sm:gap-4"
              >
                <div className="flex items-start space-x-3 sm:space-x-4 w-full sm:w-auto">
                  <div
                    className={`flex items-center justify-center w-8 sm:w-10 h-8 sm:h-10 rounded-full flex-shrink-0 ${
                      isIncome ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                    }`}
                  >
                    {isIncome ? 
                      <ArrowDownIcon className="h-5 w-5" /> : 
                      <ArrowUpIcon className="h-5 w-5" />
                    }
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium truncate">
                      {transaction.description || 'Untitled Transaction'}
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground flex items-center flex-wrap gap-1">
                      <span>{formatDate(transaction.date)}</span>
                      <span>•</span>
                      <span>{transaction.category || 'Uncategorized'}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-1 w-full sm:w-auto mt-2 sm:mt-0">
                  <div className={`text-sm sm:text-base font-medium ${isIncome ? "text-green-600" : "text-red-600"}`}>
                    {formatCurrency(transaction.amount, transaction.type)}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
