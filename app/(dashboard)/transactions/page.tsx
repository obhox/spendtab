"use client"

import { useState } from "react"
import { Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import dynamic from "next/dynamic"
import { DataProvider } from "@/lib/context/DataProvider"
import { TransactionForm } from "@/components/transactions/transaction-form"
import { BulkTransactionUpload } from "@/components/transactions/bulk-transaction-upload"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, Upload } from "lucide-react"

const TransactionTable = dynamic(
  () => import("@/components/transactions/transaction-table").then((mod) => mod.TransactionTable),
  { ssr: false }
)

// Add Transaction Dialog Component
function AddTransactionDialog() {
  return (
    <TransactionForm>
      <Button className="w-full sm:w-auto text-xs sm:text-sm">
        <Plus className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
        Add Transaction
      </Button>
    </TransactionForm>
  )
}

// Bulk Import Dialog Component
function BulkImportDialog() {
  return (
    <BulkTransactionUpload>
      <Button variant="outline" className="w-full sm:w-auto text-xs sm:text-sm">
        <Upload className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
        Bulk Import
      </Button>
    </BulkTransactionUpload>
  )
}

// Search Bar Component
function SearchBar() {
  const [searchTerm, setSearchTerm] = useState("")
  
  return (
    <div className="flex items-center gap-2 w-full sm:w-auto">
      <Label htmlFor="search" className="sr-only">
        Search
      </Label>
      <Input
        id="search"
        placeholder="Search transactions..."
        className="w-full sm:w-[200px] lg:w-[300px] text-xs sm:text-sm"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>
  )
}

export default function TransactionsPage() {
  const [searchTerm, setSearchTerm] = useState("")

  return (
    <DataProvider>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col space-y-3 sm:space-y-4">
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Transactions</h1>

          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <Input
              placeholder="Search transactions…"
              className="w-full sm:w-[240px] lg:w-[320px] text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="flex gap-2">
              <AddTransactionDialog />
              <BulkImportDialog />
            </div>
          </div>
        </div>

        <Tabs defaultValue="all" className="space-y-3 sm:space-y-4">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="all" className="flex-1 sm:flex-none text-xs sm:text-sm">All</TabsTrigger>
            <TabsTrigger value="income" className="flex-1 sm:flex-none text-xs sm:text-sm">Income</TabsTrigger>
            <TabsTrigger value="expenses" className="flex-1 sm:flex-none text-xs sm:text-sm">Expenses</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-3 sm:space-y-4">
            <div className="space-y-4">
              <div>
                <h2 className="text-base sm:text-lg font-semibold">All Transactions</h2>
                <p className="text-xs sm:text-sm text-muted-foreground">View and manage all your financial transactions.</p>
              </div>
              <Suspense fallback={<Skeleton className="h-[300px] sm:h-[400px] w-full" />}>
                <TransactionTable type="all" searchTerm={searchTerm} />
              </Suspense>
            </div>
          </TabsContent>
          
          <TabsContent value="income" className="space-y-3 sm:space-y-4">
            <div className="space-y-4">
              <div>
                <h2 className="text-base sm:text-lg font-semibold">Income</h2>
                <p className="text-xs sm:text-sm text-muted-foreground">View and manage your income transactions.</p>
              </div>
              <Suspense fallback={<Skeleton className="h-[300px] sm:h-[400px] w-full" />}>
                <TransactionTable type="income" searchTerm={searchTerm} />
              </Suspense>
            </div>
          </TabsContent>
          
          <TabsContent value="expenses" className="space-y-3 sm:space-y-4">
            <div className="space-y-4">
              <div>
                <h2 className="text-base sm:text-lg font-semibold">Expenses</h2>
                <p className="text-xs sm:text-sm text-muted-foreground">View and manage your expense transactions.</p>
              </div>
              <Suspense fallback={<Skeleton className="h-[300px] sm:h-[400px] w-full" />}>
                <TransactionTable type="expense" searchTerm={searchTerm} />
              </Suspense>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DataProvider>

  )
}

