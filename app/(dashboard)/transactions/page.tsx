"use client"

import { useState } from "react"
import { Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import dynamic from "next/dynamic"

const TransactionTable = dynamic(
  () => import("@/components/transactions/transaction-table").then((mod) => mod.TransactionTable),
  { ssr: false }
)
import { TransactionForm } from "@/components/transactions/transaction-form"
import { BulkTransactionUpload } from "@/components/transactions/bulk-transaction-upload"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, Upload } from "lucide-react"

export default function TransactionsPage() {
  const [searchTerm, setSearchTerm] = useState("")

  return (
    <div className="flex flex-col gap-3 sm:gap-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Transactions</h1>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <TransactionForm>
            <Button className="w-full sm:w-auto text-xs sm:text-sm">
              <Plus className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              Add Transaction
            </Button>
          </TransactionForm>
          <BulkTransactionUpload>
            <Button variant="outline" className="w-full sm:w-auto text-xs sm:text-sm">
              <Upload className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              Bulk Import
            </Button>
          </BulkTransactionUpload>
        </div>
      </div>
      <Tabs defaultValue="all" className="space-y-3 sm:space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="all" className="flex-1 sm:flex-none text-xs sm:text-sm">All</TabsTrigger>
            <TabsTrigger value="income" className="flex-1 sm:flex-none text-xs sm:text-sm">Income</TabsTrigger>
            <TabsTrigger value="expenses" className="flex-1 sm:flex-none text-xs sm:text-sm">Expenses</TabsTrigger>
          </TabsList>
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
        </div>
        <TabsContent value="all" className="space-y-3 sm:space-y-4">
          <Card>
            <CardHeader className="p-3 sm:p-4 md:p-6">
              <CardTitle className="text-base sm:text-lg">All Transactions</CardTitle>
              <CardDescription className="text-xs sm:text-sm">View and manage all your financial transactions.</CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
              <Suspense fallback={<Skeleton className="h-[300px] sm:h-[400px] w-full" />}>
                <TransactionTable type="all" searchTerm={searchTerm} />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="income" className="space-y-3 sm:space-y-4">
          <Card>
            <CardHeader className="p-3 sm:p-4 md:p-6">
              <CardTitle className="text-base sm:text-lg">Income</CardTitle>
              <CardDescription className="text-xs sm:text-sm">View and manage your income transactions.</CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
              <Suspense fallback={<Skeleton className="h-[300px] sm:h-[400px] w-full" />}>
                <TransactionTable type="income" searchTerm={searchTerm} />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="expenses" className="space-y-3 sm:space-y-4">
          <Card>
            <CardHeader className="p-3 sm:p-4 md:p-6">
              <CardTitle className="text-base sm:text-lg">Expenses</CardTitle>
              <CardDescription className="text-xs sm:text-sm">View and manage your expense transactions.</CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
              <Suspense fallback={<Skeleton className="h-[300px] sm:h-[400px] w-full" />}>
                <TransactionTable type="expense" searchTerm={searchTerm} />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

