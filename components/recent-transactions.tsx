"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useTransactionQuery } from "@/lib/hooks/useTransactionQuery"
import { useAccounts } from "@/lib/context/AccountContext"

export function RecentTransactions() {
  const { currentAccount } = useAccounts()
  const { transactions, isLoading } = useTransactionQuery()
  const [recentTransactions, setRecentTransactions] = useState<any[]>([])
  
  // Process transactions to get the 5 most recent ones
  useEffect(() => {
    if (!transactions) return;
    const sorted = [...transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)
      .map(transaction => ({
        id: transaction.id,
        name: transaction.description,
        amount: transaction.amount,
        date: transaction.date,
        status: "completed",
        category: transaction.category,
      }))
    
    setRecentTransactions(sorted)
  }, [transactions])

  if (isLoading) {
    return <div className="py-2 text-sm text-center">Loading transactions...</div>
  }

  return (
    <div className="space-y-4">
      {recentTransactions.length === 0 ? (
        <div className="py-4 text-center text-sm text-muted-foreground">
          No recent transactions to display.
        </div>
      ) : (
        recentTransactions.map((transaction) => (
          <div key={transaction.id} className="flex items-center">
            <Avatar className="h-9 w-9">
              <AvatarFallback>{transaction.amount > 0 ? "IN" : "EX"}</AvatarFallback>
            </Avatar>
            <div className="ml-4 space-y-1">
              <p className="text-sm font-medium leading-none">{transaction.name}</p>
              <p className="text-sm text-muted-foreground">{new Date(transaction.date).toLocaleDateString()}</p>
            </div>
            <div className="ml-auto font-medium">
              <span className={transaction.amount > 0 ? "text-green-500" : "text-red-500"}>
                {transaction.amount > 0 ? "+" : ""}${Math.abs(transaction.amount).toFixed(2)}
              </span>
              <Badge variant={transaction.amount > 0 ? "outline" : "secondary"} className="ml-2">
                {transaction.category}
              </Badge>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
