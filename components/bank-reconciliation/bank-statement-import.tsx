"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Upload, CalendarIcon, Plus, FileText, AlertTriangle } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { useBankReconciliation } from '@/lib/context/BankReconciliationContext'
import { useAccounts } from '@/lib/context/AccountContext'
import { toast } from 'sonner'

interface BankStatementImportProps {
  onImportComplete?: () => void
}

export function BankStatementImport({ onImportComplete }: BankStatementImportProps) {
  const { currentAccount } = useAccounts()
  const { addBankStatement, addBankTransaction } = useBankReconciliation()
  
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [importMethod, setImportMethod] = useState<'manual' | 'file'>('manual')
  
  // Manual entry form state
  const [statementDate, setStatementDate] = useState<Date>()
  const [periodStart, setPeriodStart] = useState<Date>()
  const [periodEnd, setPeriodEnd] = useState<Date>()
  const [openingBalance, setOpeningBalance] = useState('')
  const [closingBalance, setClosingBalance] = useState('')
  const [transactionsText, setTransactionsText] = useState('')
  
  // File upload state
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [parsedData, setParsedData] = useState<{
    transactions: Array<{
      date: string
      description: string
      amount: number
      type: 'credit' | 'debit'
    }>
    openingBalance?: number
    closingBalance?: number
    statementDate?: Date
    periodStart?: Date
    periodEnd?: Date
  } | null>(null)

  const handleManualImport = async () => {
    if (!currentAccount || !statementDate || !periodStart || !periodEnd) {
      toast('Please fill in all required fields')
      return
    }

    setIsLoading(true)
    try {
      // Create bank statement
      const statement = await addBankStatement({
        account_id: currentAccount.id,
        statement_date: format(statementDate, 'yyyy-MM-dd'),
        opening_balance: parseFloat(openingBalance) || 0,
        closing_balance: parseFloat(closingBalance) || 0,
        statement_period_start: format(periodStart, 'yyyy-MM-dd'),
        statement_period_end: format(periodEnd, 'yyyy-MM-dd'),
        status: 'pending',
        notes: 'Manually imported statement',
      })

      // Parse and add transactions if provided
      if (transactionsText.trim()) {
        const lines = transactionsText.trim().split('\n')
        for (const line of lines) {
          const parts = line.split(',').map(p => p.trim())
          if (parts.length >= 3) {
            try {
              const [dateStr, description, amountStr, typeStr] = parts
              const amount = parseFloat(amountStr)
              const transactionType = typeStr?.toLowerCase() === 'credit' || amount > 0 ? 'credit' : 'debit'
              
              await addBankTransaction({
                bank_statement_id: statement.id,
                transaction_date: dateStr,
                description: description,
                amount: Math.abs(amount),
                transaction_type: transactionType,
                match_status: 'unmatched',
                match_confidence: 0,
              })
            } catch (error) {
              console.error('Error parsing transaction line:', line, error)
            }
          }
        }
      }

      toast('Bank statement imported successfully')
      setIsOpen(false)
      resetForm()
      onImportComplete?.()
    } catch (error: any) {
      toast(`Failed to import statement: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setStatementDate(undefined)
    setPeriodStart(undefined)
    setPeriodEnd(undefined)
    setOpeningBalance('')
    setClosingBalance('')
    setTransactionsText('')
    setUploadedFile(null)
    setParsedData(null)
  }

  const parseCSVFile = (content: string): typeof parsedData => {
    const lines = content.trim().split('\n')
    const transactions: any[] = []
    let openingBalance: number | undefined
    let closingBalance: number | undefined
    let statementDate: Date | undefined
    let periodStart: Date | undefined
    let periodEnd: Date | undefined

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue

      // Check for metadata lines (optional)
      if (line.toLowerCase().includes('opening balance:')) {
        const match = line.match(/opening balance:\s*([+-]?\d+\.?\d*)/i)
        if (match) openingBalance = parseFloat(match[1])
        continue
      }
      if (line.toLowerCase().includes('closing balance:')) {
        const match = line.match(/closing balance:\s*([+-]?\d+\.?\d*)/i)
        if (match) closingBalance = parseFloat(match[1])
        continue
      }
      if (line.toLowerCase().includes('statement date:')) {
        const match = line.match(/statement date:\s*(\d{4}-\d{2}-\d{2})/i)
        if (match) statementDate = new Date(match[1])
        continue
      }
      if (line.toLowerCase().includes('period start:')) {
        const match = line.match(/period start:\s*(\d{4}-\d{2}-\d{2})/i)
        if (match) periodStart = new Date(match[1])
        continue
      }
      if (line.toLowerCase().includes('period end:')) {
        const match = line.match(/period end:\s*(\d{4}-\d{2}-\d{2})/i)
        if (match) periodEnd = new Date(match[1])
        continue
      }

      // Parse transaction lines
      const parts = line.split(',').map(p => p.trim().replace(/^"|"$/g, ''))
      if (parts.length >= 3) {
        try {
          const [dateStr, description, amountStr, typeStr] = parts
          const amount = parseFloat(amountStr)
          
          // Determine transaction type
          let transactionType: 'credit' | 'debit'
          if (typeStr) {
            transactionType = typeStr.toLowerCase().includes('credit') || typeStr.toLowerCase().includes('deposit') ? 'credit' : 'debit'
          } else {
            transactionType = amount > 0 ? 'credit' : 'debit'
          }

          transactions.push({
            date: dateStr,
            description: description,
            amount: Math.abs(amount),
            type: transactionType
          })
        } catch (error) {
          console.warn('Could not parse transaction line:', line)
        }
      }
    }

    return {
      transactions,
      openingBalance,
      closingBalance,
      statementDate,
      periodStart,
      periodEnd
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploadedFile(file)
    setIsLoading(true)

    try {
      const content = await file.text()
      const parsed = parseCSVFile(content)
      setParsedData(parsed)
      
      // Auto-fill form fields if available in the file
      if (parsed.statementDate) setStatementDate(parsed.statementDate)
      if (parsed.periodStart) setPeriodStart(parsed.periodStart)
      if (parsed.periodEnd) setPeriodEnd(parsed.periodEnd)
      if (parsed.openingBalance !== undefined) setOpeningBalance(parsed.openingBalance.toString())
      if (parsed.closingBalance !== undefined) setClosingBalance(parsed.closingBalance.toString())

      toast(`File parsed successfully! Found ${parsed.transactions.length} transactions.`)
    } catch (error: any) {
      toast(`Failed to parse file: ${error.message}`)
      setUploadedFile(null)
      setParsedData(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileImport = async () => {
    if (!currentAccount || !parsedData) {
      toast('No file data to import')
      return
    }

    // Use parsed data or form data as fallback
    const finalStatementDate = statementDate || parsedData.statementDate || new Date()
    const finalPeriodStart = periodStart || parsedData.periodStart || new Date()
    const finalPeriodEnd = periodEnd || parsedData.periodEnd || new Date()
    const finalOpeningBalance = parseFloat(openingBalance) || parsedData.openingBalance || 0
    const finalClosingBalance = parseFloat(closingBalance) || parsedData.closingBalance || 0

    setIsLoading(true)
    try {
      // Create bank statement
      const statement = await addBankStatement({
        account_id: currentAccount.id,
        statement_date: format(finalStatementDate, 'yyyy-MM-dd'),
        opening_balance: finalOpeningBalance,
        closing_balance: finalClosingBalance,
        statement_period_start: format(finalPeriodStart, 'yyyy-MM-dd'),
        statement_period_end: format(finalPeriodEnd, 'yyyy-MM-dd'),
        status: 'pending',
        notes: `Imported from file: ${uploadedFile?.name}`,
      })

      // Add transactions from parsed data
      for (const transaction of parsedData.transactions) {
        try {
          await addBankTransaction({
            bank_statement_id: statement.id,
            transaction_date: transaction.date,
            description: transaction.description,
            amount: transaction.amount,
            transaction_type: transaction.type,
            match_status: 'unmatched',
            match_confidence: 0,
          })
        } catch (error) {
          console.error('Error adding transaction:', transaction, error)
        }
      }

      toast(`Bank statement imported successfully with ${parsedData.transactions.length} transactions`)
      setIsOpen(false)
      resetForm()
      onImportComplete?.()
    } catch (error: any) {
      toast(`Failed to import statement: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Upload className="w-4 h-4 mr-2" />
          Import Statement
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import Bank Statement</DialogTitle>
          <DialogDescription>
            Add a new bank statement for reconciliation
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Import Method Selection */}
          <div className="flex space-x-4">
            <Button
              variant={importMethod === 'manual' ? 'default' : 'outline'}
              onClick={() => setImportMethod('manual')}
              className="flex-1"
            >
              <Plus className="w-4 h-4 mr-2" />
              Manual Entry
            </Button>
            <Button
              variant={importMethod === 'file' ? 'default' : 'outline'}
              onClick={() => setImportMethod('file')}
              className="flex-1"
            >
              <FileText className="w-4 h-4 mr-2" />
              File Upload
            </Button>
          </div>

          {importMethod === 'manual' && (
            <div className="space-y-4">
              {/* Statement Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Statement Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Statement Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !statementDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {statementDate ? format(statementDate, "PPP") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={statementDate}
                            onSelect={setStatementDate}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <Label>Opening Balance</Label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={openingBalance}
                        onChange={(e) => setOpeningBalance(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Period Start</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !periodStart && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {periodStart ? format(periodStart, "PPP") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={periodStart}
                            onSelect={setPeriodStart}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <Label>Period End</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !periodEnd && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {periodEnd ? format(periodEnd, "PPP") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={periodEnd}
                            onSelect={setPeriodEnd}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Closing Balance</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={closingBalance}
                      onChange={(e) => setClosingBalance(e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Transactions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Transactions (Optional)</CardTitle>
                  <CardDescription>
                    Enter transactions in CSV format: Date, Description, Amount, Type
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder={`2024-01-15, Coffee Shop, -4.50, debit
2024-01-16, Salary Deposit, 2500.00, credit
2024-01-17, Grocery Store, -85.32, debit`}
                    value={transactionsText}
                    onChange={(e) => setTransactionsText(e.target.value)}
                    rows={6}
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Format: YYYY-MM-DD, Description, Amount, Type (credit/debit)
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {importMethod === 'file' && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Upload Bank Statement</h3>
                <p className="text-muted-foreground mb-4">
                  Upload a CSV file with your bank statement data
                </p>
                <Input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="max-w-xs mx-auto"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Supported format: CSV files with Date, Description, Amount, Type columns
                </p>
              </div>

              {uploadedFile && (
                <Alert>
                  <FileText className="h-4 w-4" />
                  <AlertDescription>
                    File uploaded: {uploadedFile.name} ({(uploadedFile.size / 1024).toFixed(1)} KB)
                  </AlertDescription>
                </Alert>
              )}

              {parsedData && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Parsed Data Preview</CardTitle>
                    <CardDescription>
                      Review the data extracted from your file
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <Label>Transactions Found</Label>
                        <p className="font-medium">{parsedData.transactions.length}</p>
                      </div>
                      <div>
                        <Label>Opening Balance</Label>
                        <p className="font-medium">
                          {parsedData.openingBalance !== undefined 
                            ? `$${parsedData.openingBalance.toFixed(2)}` 
                            : 'Not specified'}
                        </p>
                      </div>
                      <div>
                        <Label>Closing Balance</Label>
                        <p className="font-medium">
                          {parsedData.closingBalance !== undefined 
                            ? `$${parsedData.closingBalance.toFixed(2)}` 
                            : 'Not specified'}
                        </p>
                      </div>
                      <div>
                        <Label>Statement Date</Label>
                        <p className="font-medium">
                          {parsedData.statementDate 
                            ? format(parsedData.statementDate, 'PPP') 
                            : 'Not specified'}
                        </p>
                      </div>
                    </div>

                    {parsedData.transactions.length > 0 && (
                      <div>
                        <Label>Sample Transactions</Label>
                        <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                          {parsedData.transactions.slice(0, 5).map((transaction, index) => (
                            <div key={index} className="text-xs p-2 bg-muted rounded flex justify-between">
                              <span>{transaction.date} - {transaction.description}</span>
                              <span className={transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}>
                                {transaction.type === 'credit' ? '+' : '-'}${transaction.amount.toFixed(2)}
                              </span>
                            </div>
                          ))}
                          {parsedData.transactions.length > 5 && (
                            <p className="text-xs text-muted-foreground">
                              ... and {parsedData.transactions.length - 5} more transactions
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Allow manual override of parsed data */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Statement Date (Override)</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !statementDate && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {statementDate ? format(statementDate, "PPP") : "Use parsed date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={statementDate}
                              onSelect={setStatementDate}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="space-y-2">
                        <Label>Opening Balance (Override)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Use parsed value"
                          value={openingBalance}
                          onChange={(e) => setOpeningBalance(e.target.value)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={importMethod === 'manual' ? handleManualImport : handleFileImport}
              disabled={isLoading || (importMethod === 'file' && !parsedData)}
            >
              {isLoading ? 'Importing...' : 'Import Statement'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}