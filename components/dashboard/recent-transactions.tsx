"use client"

import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useTransactionQuery } from "@/lib/hooks/useTransactionQuery"
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
  const { transactions, isLoading } = useTransactionQuery()
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([])
  
  // Use real data from the context with proper error handling
  useEffect(() => {
    if (!Array.isArray(transactions)) {
      setRecentTransactions([]);
      return;
    }

    try {
      // Get the most recent 8 transactions with proper error handling for dates
      const recent = [...transactions]
        .sort((a, b) => {
          // Safely handle date comparison
          const dateA = new Date(a.date || '');
          const dateB = new Date(b.date || '');
          
          // Handle invalid dates by using a fallback value
          const timeA = isNaN(dateA.getTime()) ? 0 : dateA.getTime();
          const timeB = isNaN(dateB.getTime()) ? 0 : dateB.getTime();
          
          return timeB - timeA;
        })
        .slice(0, 8);
      
      setRecentTransactions(recent);
    } catch (error) {
      console.error("Error processing transactions:", error);
      setRecentTransactions([]);
    }
  }, [transactions]);
  
  // Loading state
  if (isLoading) {
    return <div className="py-2 text-sm text-center">Loading transactions...</div>
  }
  
  // Empty state
  if (!recentTransactions || recentTransactions.length === 0) {
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

  // Helper function to safely format currency
  const formatAmount = (amount, type) => {
    let value = 0;
    
    // Ensure amount is a valid number
    if (typeof amount === 'number' && !isNaN(amount)) {
      value = amount;
    } else if (typeof amount === 'string') {
      // Try to parse string to number
      const parsed = parseFloat(amount);
      if (!isNaN(parsed)) {
        value = parsed;
      }
    }
    
    // Format with correct sign and fixed decimal places
    const prefix = type === "income" ? "+" : "-";
    return `${prefix}$${Math.abs(value).toFixed(2)}`;
  };

  // Helper function for getting initials
  const getInitials = (description) => {
    if (!description || typeof description !== 'string') {
      return 'TX'; // Default fallback for transactions
    }
    return description.substring(0, 2).toUpperCase();
  };

  // Helper function for formatting dates
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString || '');
      return isNaN(date.getTime()) 
        ? 'Invalid date' 
        : date.toLocaleDateString();
    } catch (error) {
      return 'Invalid date';
    }
  };

  return (
    <div className="space-y-4">
      {recentTransactions.map((transaction) => (
        <div key={transaction.id} className="flex items-center gap-4">
          <Avatar className="h-9 w-9">
            <AvatarImage 
              src={`/avatars/${transaction.id}.png`} 
              alt={transaction.description || 'Transaction'} 
            />
            <AvatarFallback 
              className={transaction.type === "income" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}
            >
              {getInitials(transaction.description)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium leading-none">
              {transaction.description || 'Untitled Transaction'}
            </p>
            <p className="text-xs text-muted-foreground">
              {transaction.category || 'Uncategorized'}
            </p>
          </div>
          <div className="text-right">
            <p className={`text-sm font-medium ${transaction.type === "income" ? "text-green-600" : "text-red-600"}`}>
              {formatAmount(transaction.amount, transaction.type)}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatDate(transaction.date)}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}