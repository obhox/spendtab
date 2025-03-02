"use client"

import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useTransactions } from "@/lib/context/TransactionContext"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
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
  const { transactions, isLoading } = useTransactions()
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([])
  
  // Use real data from the context
  useEffect(() => {
    if (transactions.length > 0) {
      // Get the most recent 5 transactions
      const recent = [...transactions]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);
      
      setRecentTransactions(recent);
    }
  }, [transactions]);
  
  if (isLoading) {
    return <div className="py-2 text-sm text-center">Loading transactions...</div>
  }
  
  if (recentTransactions.length === 0) {
    return (
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
    )
  }

  return (
    <div className="space-y-4">
      {recentTransactions.map((transaction) => (
        <div key={transaction.id} className="flex items-center gap-4">
          <Avatar className="h-9 w-9">
            <AvatarImage src={`/avatars/${transaction.id}.png`} alt={transaction.description} />
            <AvatarFallback className={transaction.type === "income" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}>
              {transaction.description.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium leading-none">{transaction.description}</p>
            <p className="text-xs text-muted-foreground">{transaction.category}</p>
          </div>
          <div className="text-right">
            <p className={`text-sm font-medium ${transaction.type === "income" ? "text-green-600" : "text-red-600"}`}>
              {transaction.type === "income" ? "+" : "-"}${transaction.amount.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground">
              {new Date(transaction.date).toLocaleDateString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
