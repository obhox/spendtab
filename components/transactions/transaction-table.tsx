"use client"

import { useEffect, useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
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
import { MoreHorizontal, Edit, Trash, Plus } from "lucide-react"
import { TransactionForm } from "./transaction-form"
import { useTransactions } from "@/lib/context/TransactionContext"

interface Transaction {
  id: string
  date: string
  description: string
  category: string
  amount: number
  type: "income" | "expense"
}

interface TransactionTableProps {
  type: "all" | "income" | "expenses"
  searchTerm: string
}

export function TransactionTable({ type, searchTerm }: TransactionTableProps) {
  const { transactions: allTransactions, deleteTransaction, isLoading } = useTransactions()
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);
  
  // Filter transactions based on props
  useEffect(() => {
    if (allTransactions.length > 0) {
      let result = [...allTransactions];
      
      // Filter by type
      if (type === "income") {
        result = result.filter(t => t.type === "income");
      } else if (type === "expenses") {
        result = result.filter(t => t.type === "expense");
      }
      
      // Apply search term
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        result = result.filter(t => 
          t.description.toLowerCase().includes(search) || 
          t.category.toLowerCase().includes(search)
        );
      }
      
      setFilteredTransactions(result);
    } else {
      setFilteredTransactions([]);
    }
  }, [allTransactions, type, searchTerm]);

  const handleDeleteTransaction = async () => {
    if (transactionToDelete) {
      await deleteTransaction(transactionToDelete);
      setTransactionToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center py-8">Loading transactions...</div>;
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center space-y-3 py-4">
                    <p className="text-sm text-muted-foreground">No transactions found</p>
                    <p className="text-xs text-muted-foreground">
                      {allTransactions.length === 0 
                        ? "Add your first transaction to get started"
                        : "Try adjusting your filters or search term"}
                    </p>
                    {allTransactions.length === 0 && (
                      <TransactionForm>
                        <Button size="sm" variant="outline" className="mt-2">
                          <Plus className="mr-2 h-4 w-4" />
                          Add Transaction
                        </Button>
                      </TransactionForm>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell>{transaction.category}</TableCell>
                  <TableCell className={`text-right ${transaction.type === "income" ? "text-green-600" : "text-red-600"}`}>
                    {transaction.type === "income" ? "+" : "-"}${transaction.amount.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <TransactionForm transaction={transaction}>
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                        </TransactionForm>
                        <DropdownMenuItem 
                          onClick={() => {
                            setTransactionToDelete(transaction.id);
                            setDeleteDialogOpen(true);
                          }}
                          className="text-red-600"
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the transaction
              from your records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTransaction} className="bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
