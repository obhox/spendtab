"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Edit, MoreHorizontal, Trash } from "lucide-react"
import { TransactionForm } from "./transaction-form"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useTransactions } from "@/lib/context/TransactionContext"
import { toast } from "sonner"

interface Transaction {
  id: string
  date: string
  description: string
  category: string
  amount: number
  type: "income" | "expense"
  budget_id?: string | null
}

interface TransactionTableProps {
  type: "all" | "income" | "expenses"
  searchTerm: string
}

export function TransactionTable({ type, searchTerm }: TransactionTableProps) {
  const { transactions, deleteTransaction, isLoading } = useTransactions()
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null)
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])

  useEffect(() => {
    const filtered = transactions.filter((transaction) => {
      const matchesType = 
        type === "all" || 
        (type === "income" && transaction.type === "income") || 
        (type === "expenses" && transaction.type === "expense")
      
      const matchesSearch =
        transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.category.toLowerCase().includes(searchTerm.toLowerCase())
      
      return matchesType && matchesSearch
    })
    setFilteredTransactions(filtered)
  }, [transactions, type, searchTerm])

  const handleDelete = (id: string) => {
    setTransactionToDelete(id)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (transactionToDelete) {
      deleteTransaction(transactionToDelete)
      toast("Transaction deleted", {
        description: "The transaction has been deleted successfully."
      })
      setTransactionToDelete(null)
    }
    setDeleteDialogOpen(false)
  }

  if (isLoading) {
    return <div className="py-10 text-center">Loading transactions...</div>
  }

  return (
    <>
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="hidden md:table-cell">Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="hidden sm:table-cell">Category</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right w-[70px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell className="hidden md:table-cell">{new Date(transaction.date).toLocaleDateString()}</TableCell>
                <TableCell className="max-w-[200px] truncate">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <span>{transaction.description}</span>
                    <Badge className="w-fit sm:hidden" variant={transaction.type === "income" ? "default" : "destructive"}>
                      {transaction.category}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Badge variant={transaction.type === "income" ? "default" : "destructive"}>
                    {transaction.category}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <span className={transaction.type === "income" ? "text-green-600" : "text-red-600"}>
                    {transaction.type === "income" ? "+" : "-"}${Math.abs(transaction.amount).toFixed(2)}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the transaction from your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
