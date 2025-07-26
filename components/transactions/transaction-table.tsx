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
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Edit, Trash, Calendar, DollarSign, Tag, CreditCard, FileText, Receipt, ExternalLink, Plus, ChevronLeft, ChevronRight } from "lucide-react"
import { TransactionForm } from "./transaction-form"
import { useTransactionQuery } from "@/lib/hooks/useTransactionQuery"
import { useAccounts } from "@/lib/context/AccountContext"
import { toast } from "sonner"
import Link from "next/link"
import { useSelectedCurrency, formatCurrency as formatCurrencyUtil, useTaxFeaturesVisible } from "@/components/currency-switcher"

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
  tax_deductible?: boolean
  tax_category?: string
  business_purpose?: string
  receipt_url?: string
  mileage?: number
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
  const { transactions: allTransactions, deleteTransaction, isLoading, error, isError } = useTransactionQuery()
  const { currentAccount } = useAccounts()
  const selectedCurrency = useSelectedCurrency()
  const isTaxFeaturesVisible = useTaxFeaturesVisible()
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [page, setPage] = useState(1)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const ITEMS_PER_PAGE = 50

  // Display any transaction query errors as toasts
  useEffect(() => {
    if (isError && error) {
      toast("Error", {
        description: error.toString()
      })
    }
  }, [isError, error])
  
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

  const handleTransactionClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setDetailsDialogOpen(true)
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

  // Format date safely without timezone conversion
  const formatDate = (dateString: string) => {
    try {
      // Parse date as local date to avoid timezone issues
      // If dateString is in YYYY-MM-DD format, parse it directly
      if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = dateString.split('-').map(Number)
        const date = new Date(year, month - 1, day) // month is 0-indexed
        return date.toLocaleDateString()
      }
      
      // Fallback for other date formats
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
      <div className="rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[80px]">Date</TableHead>
                <TableHead className="min-w-[120px]">Name</TableHead>
                <TableHead className="hidden sm:table-cell">Category</TableHead>
                <TableHead className="hidden md:table-cell">Payment Source</TableHead>
                <TableHead className="text-right min-w-[80px]">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentTransactions.length === 0 ? (
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
                currentTransactions.map((transaction) => (
                  <TableRow 
                    key={transaction.id} 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleTransactionClick(transaction)}
                  >
                    <TableCell className="text-xs sm:text-sm">
                      <div className="font-medium">
                        {formatDate(transaction.date)}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">
                      <div className="font-medium truncate max-w-[150px] sm:max-w-none">
                        {transaction.description}
                      </div>
                      <div className="sm:hidden text-xs text-muted-foreground mt-1">
                        {transaction.category}
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-xs sm:text-sm">
                      {transaction.category}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-xs sm:text-sm">
                      {formatPaymentSource(transaction.payment_source)}
                    </TableCell>
                    <TableCell className={`text-right text-xs sm:text-sm font-medium ${transaction.type === "income" ? "text-green-600" : "text-red-600"}`}>
                      {transaction.type === "income" ? "+" : "-"}{formatCurrencyUtil(transaction.amount, selectedCurrency.code, selectedCurrency.symbol).replace(/^-/, "")}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination controls */}
      {filteredTransactions.length > ITEMS_PER_PAGE && (
        <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-2">
          <div className="text-xs sm:text-sm text-muted-foreground order-2 sm:order-1">
            Showing {(page - 1) * ITEMS_PER_PAGE + 1} to {Math.min(page * ITEMS_PER_PAGE, filteredTransactions.length)} of {filteredTransactions.length} transactions
          </div>
          <div className="flex gap-2 order-1 sm:order-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousPage}
              disabled={page === 1 || isDeleting}
              className="text-xs sm:text-sm"
            >
              <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              <span className="hidden sm:inline">Previous</span>
              <span className="sm:hidden">Prev</span>
            </Button>
            <Button
              variant="outline" 
              size="sm"
              onClick={handleNextPage}
              disabled={page * ITEMS_PER_PAGE >= filteredTransactions.length || isDeleting}
              className="text-xs sm:text-sm"
            >
              <span className="hidden sm:inline">Next</span>
              <span className="sm:hidden">Next</span>
              <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Transaction Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="w-[95vw] sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4">
              {/* Basic Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Date</p>
                    <p className="text-sm text-muted-foreground">{formatDate(selectedTransaction.date)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Amount</p>
                    <p className={`text-sm font-medium ${selectedTransaction.type === "income" ? "text-green-600" : "text-red-600"}`}>
                      {selectedTransaction.type === "income" ? "+" : "-"}{formatCurrencyUtil(selectedTransaction.amount, selectedCurrency.code, selectedCurrency.symbol).replace(/^-/, "")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <p className="text-sm font-medium mb-1">Description</p>
                <p className="text-sm text-muted-foreground">{selectedTransaction.description}</p>
              </div>

              {/* Category and Payment Source */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Category</p>
                    <p className="text-sm text-muted-foreground">{selectedTransaction.category}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Payment Source</p>
                    <p className="text-sm text-muted-foreground">{formatPaymentSource(selectedTransaction.payment_source)}</p>
                  </div>
                </div>
              </div>

              {/* Transaction Type */}
              <div>
                <p className="text-sm font-medium mb-1">Type</p>
                <Badge variant={selectedTransaction.type === "income" ? "default" : "secondary"}>
                  {selectedTransaction.type === "income" ? "Income" : "Expense"}
                </Badge>
              </div>

              {/* Tax Information */}
              {isTaxFeaturesVisible && (selectedTransaction.tax_deductible || selectedTransaction.tax_category || selectedTransaction.business_purpose || selectedTransaction.receipt_url || selectedTransaction.mileage) && (
                <div className="border-t pt-4">
                  <p className="text-sm font-medium mb-3">Tax Information</p>
                  <div className="space-y-3">
                    {selectedTransaction.tax_deductible && (
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <Badge variant="secondary" className="text-xs">
                          Tax Deductible
                        </Badge>
                      </div>
                    )}
                    {selectedTransaction.tax_category && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Tax Category</p>
                        <p className="text-sm">{selectedTransaction.tax_category}</p>
                      </div>
                    )}
                    {selectedTransaction.business_purpose && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Business Purpose</p>
                        <p className="text-sm">{selectedTransaction.business_purpose}</p>
                      </div>
                    )}
                    {selectedTransaction.mileage && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Mileage</p>
                        <p className="text-sm">{selectedTransaction.mileage} miles</p>
                      </div>
                    )}
                    {selectedTransaction.receipt_url && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">Receipt</p>
                        <a 
                          href={selectedTransaction.receipt_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                        >
                          <Receipt className="h-4 w-4 mr-1" />
                          View Receipt
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedTransaction.notes && (
                <div className="border-t pt-4">
                  <p className="text-sm font-medium mb-1">Notes</p>
                  <p className="text-sm text-muted-foreground">{selectedTransaction.notes}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-2 border-t pt-4">
                <TransactionForm transaction={selectedTransaction}>
                  <Button variant="outline" size="sm">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                </TransactionForm>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setTransactionToDelete(selectedTransaction.id)
                    setDeleteDialogOpen(true)
                    setDetailsDialogOpen(false)
                  }}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Delete
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setDetailsDialogOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="w-[95vw] sm:max-w-[425px]">
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