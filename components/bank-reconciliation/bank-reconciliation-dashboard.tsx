"use client"

import React, { useState, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Upload, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  FileText, 
  DollarSign,
  Calendar,
  TrendingUp,
  TrendingDown,
  Link,
  Unlink,
  Eye,
  Download
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { useBankReconciliation, BankStatement, BankTransaction, ReconciliationSummary } from '@/lib/context/BankReconciliationContext'
import { useAccounts } from '@/lib/context/AccountContext'
import { useTransactions } from '@/lib/context/TransactionContext'
import { BankStatementImport } from './bank-statement-import'
import { toast } from 'sonner'

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"

interface BankReconciliationDashboardProps {
  className?: string
}

export function BankReconciliationDashboard({ className }: BankReconciliationDashboardProps) {
  const { currentAccount } = useAccounts()
  const { transactions } = useTransactions()
  const queryClient = useQueryClient()
  const {
    bankStatements,
    isLoadingStatements,
    addBankStatement,
    updateBankStatement,
    deleteBankStatement,
    getBankTransactions,
    matchTransaction,
    unmatchTransaction,
    autoMatchTransactions,
    getReconciliationSummary,
    startReconciliation,
    completeReconciliation,
  } = useBankReconciliation()

  const [selectedStatement, setSelectedStatement] = useState<BankStatement | null>(null)
  const [bankTransactions, setBankTransactions] = useState<BankTransaction[]>([])
  const [reconciliationSummary, setReconciliationSummary] = useState<ReconciliationSummary | null>(null)
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false)
  const [showMatchingDialog, setShowMatchingDialog] = useState(false)
  const [selectedBankTransaction, setSelectedBankTransaction] = useState<BankTransaction | null>(null)
  const [showCompletionDialog, setShowCompletionDialog] = useState(false)

  // Load bank transactions when statement is selected
  useEffect(() => {
    if (selectedStatement) {
      loadBankTransactions(selectedStatement.id)
      loadReconciliationSummary(selectedStatement.id)
    }
  }, [selectedStatement])

  const loadBankTransactions = async (statementId: string) => {
    setIsLoadingTransactions(true)
    try {
      const transactions = await getBankTransactions(statementId)
      setBankTransactions(transactions)
    } catch (error) {
      console.error('Failed to load bank transactions:', error)
    } finally {
      setIsLoadingTransactions(false)
    }
  }

  const loadReconciliationSummary = async (statementId: string) => {
    try {
      const summary = await getReconciliationSummary(statementId)
      setReconciliationSummary(summary)
    } catch (error) {
      console.error('Failed to load reconciliation summary:', error)
    }
  }

  const handleAutoMatch = async () => {
    if (!selectedStatement) return
    
    try {
      await autoMatchTransactions(selectedStatement.id)
      await loadBankTransactions(selectedStatement.id)
      await loadReconciliationSummary(selectedStatement.id)
    } catch (error) {
      console.error('Auto-matching failed:', error)
    }
  }

  const handleManualMatch = async (appTransactionId: string) => {
    if (!selectedBankTransaction) return

    try {
      await matchTransaction(selectedBankTransaction.id, appTransactionId)
      await loadBankTransactions(selectedStatement!.id)
      await loadReconciliationSummary(selectedStatement!.id)
      setShowMatchingDialog(false)
      setSelectedBankTransaction(null)
    } catch (error) {
      console.error('Manual matching failed:', error)
    }
  }

  const handleUnmatch = async (bankTransactionId: string) => {
    try {
      await unmatchTransaction(bankTransactionId)
      await loadBankTransactions(selectedStatement!.id)
      await loadReconciliationSummary(selectedStatement!.id)
    } catch (error) {
      console.error('Unmatching failed:', error)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'reconciled':
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Reconciled</Badge>
      case 'discrepancy':
        return <Badge variant="destructive"><AlertTriangle className="w-3 h-3 mr-1" />Discrepancy</Badge>
      default:
        return <Badge variant="secondary"><RefreshCw className="w-3 h-3 mr-1" />Pending</Badge>
    }
  }

  const getMatchStatusBadge = (status: string, confidence: number) => {
    switch (status) {
      case 'matched':
        return <Badge variant="default" className="bg-green-100 text-green-800"><Link className="w-3 h-3 mr-1" />Matched ({Math.round(confidence * 100)}%)</Badge>
      case 'manual_match':
        return <Badge variant="default" className="bg-blue-100 text-blue-800"><Link className="w-3 h-3 mr-1" />Manual Match</Badge>
      case 'ignored':
        return <Badge variant="outline"><Eye className="w-3 h-3 mr-1" />Ignored</Badge>
      default:
        return <Badge variant="secondary"><Unlink className="w-3 h-3 mr-1" />Unmatched</Badge>
    }
  }

  if (!currentAccount) {
    return (
      <div className="p-6 bg-muted rounded-lg text-center">
        <h3 className="font-semibold mb-2">No Account Selected</h3>
        <p className="text-muted-foreground">
          Please select an account to access bank reconciliation features.
        </p>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Bank Reconciliation</h1>
          <p className="text-muted-foreground">
            Reconcile your bank statements with recorded transactions
          </p>
        </div>
        <BankStatementImport onImportComplete={() => {
          queryClient.invalidateQueries({ queryKey: ['bankStatements', currentAccount?.id] })
        }} />
        </div>

      {/* Summary Cards */}
      {reconciliationSummary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bank Balance</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(reconciliationSummary.bank_balance)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">App Balance</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(reconciliationSummary.app_balance)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Discrepancy</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${Math.abs(reconciliationSummary.discrepancy_amount) > 0.01 ? 'text-red-600' : 'text-green-600'}`}>
                {formatCurrency(reconciliationSummary.discrepancy_amount)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Match Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {reconciliationSummary.total_bank_transactions > 0 
                  ? Math.round((reconciliationSummary.matched_transactions / reconciliationSummary.total_bank_transactions) * 100)
                  : 0}%
              </div>
              <Progress 
                value={reconciliationSummary.total_bank_transactions > 0 
                  ? (reconciliationSummary.matched_transactions / reconciliationSummary.total_bank_transactions) * 100
                  : 0} 
                className="mt-2"
              />
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="statements" className="space-y-4">
        <TabsList>
          <TabsTrigger value="statements">Bank Statements</TabsTrigger>
          <TabsTrigger value="reconciliation" disabled={!selectedStatement}>
            Reconciliation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="statements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bank Statements</CardTitle>
              <CardDescription>
                Manage your imported bank statements
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingStatements ? (
                <div className="text-center py-4">Loading statements...</div>
              ) : bankStatements.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Bank Statements</h3>
                  <p className="text-muted-foreground mb-4">
                    Import your first bank statement to start reconciliation
                  </p>
                  <BankStatementImport 
                    onImportComplete={() => queryClient.invalidateQueries({ queryKey: ['bankStatements', currentAccount?.id] })}
                  />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Statement Date</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead>Opening Balance</TableHead>
                      <TableHead>Closing Balance</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bankStatements.map((statement) => (
                      <TableRow 
                        key={statement.id}
                        className={selectedStatement?.id === statement.id ? 'bg-muted' : ''}
                      >
                        <TableCell>
                          {format(parseISO(statement.statement_date), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell>
                          {format(parseISO(statement.statement_period_start), 'MMM d')} - {format(parseISO(statement.statement_period_end), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell>{formatCurrency(statement.opening_balance)}</TableCell>
                        <TableCell>{formatCurrency(statement.closing_balance)}</TableCell>
                        <TableCell>{getStatusBadge(statement.status)}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedStatement(statement)}
                            >
                              {selectedStatement?.id === statement.id ? 'Selected' : 'Select'}
                            </Button>
                            {statement.file_url && (
                              <Button variant="outline" size="sm">
                                <Download className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reconciliation" className="space-y-4">
          {selectedStatement && (
            <>
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Reconciliation for {format(parseISO(selectedStatement.statement_date), 'MMMM yyyy')}</CardTitle>
                      <CardDescription>
                        Match bank transactions with your recorded transactions
                      </CardDescription>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" onClick={handleAutoMatch}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Auto Match
                      </Button>
                      {reconciliationSummary?.unmatched_transactions === 0 ? (
                        <Button onClick={() => completeReconciliation(selectedStatement.id)}>
                          Complete Reconciliation
                        </Button>
                      ) : (
                        <AlertDialog open={showCompletionDialog} onOpenChange={setShowCompletionDialog}>
                          <AlertDialogTrigger asChild>
                            <Button>
                              Complete Reconciliation
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Complete Reconciliation with Unmatched Transactions?</AlertDialogTitle>
                              <AlertDialogDescription>
                                There are {reconciliationSummary?.unmatched_transactions} unmatched transactions remaining. 
                                Completing the reconciliation now will mark these transactions as reconciled but unmatched.
                                <br /><br />
                                Are you sure you want to proceed?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => {
                                completeReconciliation(selectedStatement.id)
                                setShowCompletionDialog(false)
                              }}>
                                Complete Anyway
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {reconciliationSummary && reconciliationSummary.unmatched_transactions > 0 && (
                    <Alert className="mb-4">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        {reconciliationSummary.unmatched_transactions} transactions remain unmatched. 
                        You can still complete the reconciliation if needed, but it's recommended to match all transactions first.
                      </AlertDescription>
                    </Alert>
                  )}

                  {isLoadingTransactions ? (
                    <div className="text-center py-4">Loading transactions...</div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {bankTransactions.map((bankTx) => (
                          <TableRow key={bankTx.id}>
                            <TableCell>
                              {format(parseISO(bankTx.transaction_date), 'MMM d, yyyy')}
                            </TableCell>
                            <TableCell className="max-w-[200px] truncate">
                              {bankTx.description}
                            </TableCell>
                            <TableCell>
                              <span className={bankTx.transaction_type === 'credit' ? 'text-green-600' : 'text-red-600'}>
                                {bankTx.transaction_type === 'credit' ? '+' : '-'}{formatCurrency(Math.abs(bankTx.amount))}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge variant={bankTx.transaction_type === 'credit' ? 'default' : 'secondary'}>
                                {bankTx.transaction_type}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {getMatchStatusBadge(bankTx.match_status, bankTx.match_confidence)}
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                {bankTx.match_status === 'unmatched' ? (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedBankTransaction(bankTx)
                                      setShowMatchingDialog(true)
                                    }}
                                  >
                                    <Link className="w-4 h-4 mr-1" />
                                    Match
                                  </Button>
                                ) : (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleUnmatch(bankTx.id)}
                                  >
                                    <Unlink className="w-4 h-4 mr-1" />
                                    Unmatch
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Manual Matching Dialog */}
      <Dialog open={showMatchingDialog} onOpenChange={setShowMatchingDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Match Bank Transaction</DialogTitle>
            <DialogDescription>
              Select a transaction from your records to match with this bank transaction
            </DialogDescription>
          </DialogHeader>
          
          {selectedBankTransaction && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Bank Transaction</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <Label>Date</Label>
                      <p>{format(parseISO(selectedBankTransaction.transaction_date), 'MMM d, yyyy')}</p>
                    </div>
                    <div>
                      <Label>Description</Label>
                      <p className="truncate">{selectedBankTransaction.description}</p>
                    </div>
                    <div>
                      <Label>Amount</Label>
                      <p className={selectedBankTransaction.transaction_type === 'credit' ? 'text-green-600' : 'text-red-600'}>
                        {selectedBankTransaction.transaction_type === 'credit' ? '+' : '-'}{formatCurrency(Math.abs(selectedBankTransaction.amount))}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Select Matching Transaction</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="max-h-60 overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {transactions
                          .filter(tx => {
                            // Filter transactions that are close in amount and date
                            const amountMatch = Math.abs(Math.abs(tx.amount) - Math.abs(selectedBankTransaction.amount)) < 0.01
                            const dateMatch = Math.abs(new Date(tx.date).getTime() - new Date(selectedBankTransaction.transaction_date).getTime()) < 7 * 24 * 60 * 60 * 1000 // Within 7 days
                            return amountMatch || dateMatch
                          })
                          .slice(0, 10) // Limit to 10 suggestions
                          .map((tx) => (
                            <TableRow key={tx.id}>
                              <TableCell>{format(new Date(tx.date), 'MMM d, yyyy')}</TableCell>
                              <TableCell className="max-w-[200px] truncate">{tx.description}</TableCell>
                              <TableCell>
                                <span className={tx.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                                  {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                                </span>
                              </TableCell>
                              <TableCell>{tx.category}</TableCell>
                              <TableCell>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleManualMatch(tx.id)}
                                >
                                  Match
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}