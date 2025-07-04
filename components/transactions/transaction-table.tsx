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
import { MoreHorizontal, Edit, Trash, Plus, ChevronLeft, ChevronRight } from "lucide-react"
import { TransactionForm } from "./transaction-form"
import { useTransactions } from "@/lib/context/TransactionContext"
import { useAccounts } from "@/lib/context/AccountContext"
import { toast } from "sonner"
import Link from "next/link"

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
}

interface TransactionTableProps {
  type: "all" | "income" | "expense" 
  searchTerm: string
}

// Payment source display mapping
const PAYMENT_SOURCES: Record<string, string> = {
  'paypal': 'PayPal',
  'stripe': 'Stripe',
  'bank_transfer': 'Bank Transfer',
  'credit_card': 'Credit Card',
  'debit_card': 'Debit Card',
  'mobile_payment': 'Mobile Payment',
  'cash': 'Cash',
  'check': 'Check',
  'other': 'Other'
};

export function TransactionTable({ type, searchTerm }: TransactionTableProps) {
  const { transactions: allTransactions, deleteTransaction, isLoading, error } = useTransactions()
  const { currentAccount } = useAccounts()
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [page, setPage] = useState(1)
  const ITEMS_PER_PAGE = 50

  // Display any transaction context errors as toasts
  useEffect(() => {
    if (error) {
      toast(error)
    }
  }, [error])
  
  // Apply initial filtering when the component mounts
  useEffect(() => {
    // Immediately filter transactions based on current type
filterTransactions(allTransactions as Transaction[], type, searchTerm);
  }, []);
  
  // Function to filter transactions
  const filterTransactions = (transactions: Transaction[], filterType: string, search: string) => {
    if (transactions.length === 0) {
      setFilteredTransactions([]);
      return;
    }

    // Create a new array for filtering
    let result = [...transactions];
    
    // Apply strict type filtering
    if (filterType === "income") {
      result = result.filter(transaction => transaction.type === "income");
    } else if (filterType === "expense") {
      result = result.filter(transaction => transaction.type === "expense");
    }
    
    // Apply search term filter if provided
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(transaction => 
        transaction.description.toLowerCase().includes(searchLower) || 
        transaction.category.toLowerCase().includes(searchLower)
      );
    }
    
    // Update filtered transactions
    setFilteredTransactions(result);
    
    // Reset to first page
    setPage(1);
  };
  
  // Filter transactions when props change
  useEffect(() => {
filterTransactions(allTransactions as Transaction[], type, searchTerm);
  }, [allTransactions, type, searchTerm]);

  const handleDeleteTransaction = async () => {
    if (transactionToDelete) {
      try {
        setIsDeleting(true)
        await deleteTransaction(transactionToDelete)
        toast.success("Transaction deleted successfully")
      } catch (error) {
        console.error("Error deleting transaction:", error)
        // No need to display an error toast here as it's handled in the context
      } finally {
        setIsDeleting(false)
        setTransactionToDelete(null)
        setDeleteDialogOpen(false)
      }
    }
  }

  // Handle page change
  const handlePreviousPage = () => setPage(p => Math.max(1, p - 1))
  const handleNextPage = () => {
    const maxPage = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE)
    setPage(p => Math.min(maxPage, p + 1))
  }

  // Get current page of transactions
  const currentTransactions = filteredTransactions.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  )

  // Render warning if no account is selected
  if (!currentAccount) {
    return (
      <div className="p-6 bg-muted rounded-lg text-center">
        <h3 className="font-semibold mb-2">No Account Selected</h3>
        <p className="text-muted-foreground mb-4">
          Please select or create an account to manage transactions.
        </p>
        <Link href="/accounts">
          <Button>Manage Accounts</Button>
        </Link>
      </div>
    )
  }

  if (isLoading && allTransactions.length === 0) {
    return <div className="flex justify-center items-center py-8">Loading transactions...</div>
  }

  // Format date safely
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString()
    } catch (e) {
      return "Invalid date"
    }
  }
  
  // Format payment source to be more readable
  const formatPaymentSource = (source: string) => {
    if (!source) return "Unknown";
    
    // Normalize the source by trimming and converting to lowercase
    const normalizedSource = source.trim().toLowerCase();
    
    // Return from mapping if exists
    if (PAYMENT_SOURCES[normalizedSource]) {
      return PAYMENT_SOURCES[normalizedSource];
    }
    
    // Handle direct display for values that don't need formatting
    if (!normalizedSource.includes('_')) {
      return normalizedSource.charAt(0).toUpperCase() + normalizedSource.slice(1);
    }
    
    // Convert snake_case to Title Case for any other values
    return normalizedSource
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
                        <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Payment Source</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
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
              currentTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{formatDate(transaction.date)}</TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell>{transaction.category}</TableCell>
                  <TableCell>{formatPaymentSource(transaction.payment_source)}</TableCell>
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
                          <DropdownMenuItem onSelect={(e) => {
                            // Prevent the dropdown from closing but allow TransactionForm to open
                            e.preventDefault()
                          }}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                        </TransactionForm>
                        <DropdownMenuItem 
                          onClick={() => {
                            setTransactionToDelete(transaction.id)
                            setDeleteDialogOpen(true)
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

      {/* Pagination controls */}
      {filteredTransactions.length > ITEMS_PER_PAGE && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-muted-foreground">
            Showing {(page - 1) * ITEMS_PER_PAGE + 1} to {Math.min(page * ITEMS_PER_PAGE, filteredTransactions.length)} of {filteredTransactions.length} transactions
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousPage}
              disabled={page === 1 || isDeleting}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline" 
              size="sm"
              onClick={handleNextPage}
              disabled={page * ITEMS_PER_PAGE >= filteredTransactions.length || isDeleting}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

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
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteTransaction} 
              className="bg-red-600"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}