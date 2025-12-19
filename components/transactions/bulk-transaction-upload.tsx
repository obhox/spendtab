"use client"

import React, { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Upload, X, FileText, Loader2, Download, AlertCircle, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import { useTransactionQuery } from '@/lib/hooks/useTransactionQuery'
import { useAccounts } from '@/lib/context/AccountContext'
import { format } from 'date-fns'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

interface BulkTransactionUploadProps {
  children: React.ReactNode
  onSuccess?: () => void
}

interface ParsedTransaction {
  date: string
  description: string
  category: string
  amount: number
  type: "income" | "expense"
  payment_source: string
  notes?: string
  row: number
}

interface ValidationError {
  row: number
  field: string
  message: string
}

export function BulkTransactionUpload({ children, onSuccess }: BulkTransactionUploadProps) {
  const [open, setOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [parsedTransactions, setParsedTransactions] = useState<ParsedTransaction[]>([])
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([])
  const [step, setStep] = useState<'upload' | 'preview' | 'processing'>('upload')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { addTransaction } = useTransactionQuery()
  const { currentAccount } = useAccounts()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    
    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  const parseCSV = (csvText: string): ParsedTransaction[] => {
    const lines = csvText.trim().split('\n')
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
    
    // Expected headers mapping
    const headerMap: Record<string, string> = {
      'date': 'date',
      'description': 'description',
      'category': 'category',
      'amount': 'amount',
      'type': 'type',
      'payment_source': 'payment_source',
      'payment source': 'payment_source',
      'notes': 'notes'
    }

    const transactions: ParsedTransaction[] = []
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim())
      const transaction: any = { row: i + 1 }
      
      headers.forEach((header, index) => {
        const mappedField = headerMap[header]
        if (mappedField && values[index]) {
          let value: any = values[index].replace(/"/g, '') // Remove quotes
          
          // Type conversion
          if (mappedField === 'amount') {
            value = parseFloat(value)
          } else if (mappedField === 'date') {
            // Try to parse date in various formats
            const dateValue = new Date(value)
            if (!isNaN(dateValue.getTime())) {
              value = format(dateValue, 'yyyy-MM-dd')
            }
          }
          
          transaction[mappedField] = value
        }
      })
      
      if (transaction.date && transaction.description && transaction.amount) {
        transactions.push(transaction as ParsedTransaction)
      }
    }
    
    return transactions
  }

  const validateTransactions = (transactions: ParsedTransaction[]): ValidationError[] => {
    const errors: ValidationError[] = []
    
    transactions.forEach((transaction) => {
      // Required fields validation
      if (!transaction.date) {
        errors.push({ row: transaction.row, field: 'date', message: 'Date is required' })
      }
      if (!transaction.description) {
        errors.push({ row: transaction.row, field: 'description', message: 'Description is required' })
      }
      if (!transaction.category) {
        errors.push({ row: transaction.row, field: 'category', message: 'Category is required' })
      }
      if (!transaction.amount || transaction.amount === 0) {
        errors.push({ row: transaction.row, field: 'amount', message: 'Amount must be greater than 0' })
      }
      if (!transaction.type || !['income', 'expense'].includes(transaction.type)) {
        errors.push({ row: transaction.row, field: 'type', message: 'Type must be "income" or "expense"' })
      }
      if (!transaction.payment_source) {
        errors.push({ row: transaction.row, field: 'payment_source', message: 'Payment source is required' })
      }
      
      // Date format validation
      if (transaction.date && isNaN(new Date(transaction.date).getTime())) {
        errors.push({ row: transaction.row, field: 'date', message: 'Invalid date format' })
      }
    })
    
    return errors
  }

  const handleFileSelect = async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      toast.error('Please select a CSV file')
      return
    }

    setIsUploading(true)
    try {
      const text = await file.text()
      const transactions = parseCSV(text)
      const errors = validateTransactions(transactions)
      
      setParsedTransactions(transactions)
      setValidationErrors(errors)
      setStep('preview')
      
      if (errors.length > 0) {
        toast.warning(`Found ${errors.length} validation errors. Please review before importing.`)
      } else {
        toast.success(`Successfully parsed ${transactions.length} transactions`)
      }
    } catch (error) {
      console.error('Error parsing CSV:', error)
      toast.error('Error parsing CSV file. Please check the format.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleImport = async () => {
    if (validationErrors.length > 0) {
      toast.error('Please fix validation errors before importing')
      return
    }

    if (!currentAccount?.id) {
      toast.error('No account selected')
      return
    }

    setStep('processing')
    let successCount = 0
    let errorCount = 0

    for (const transaction of parsedTransactions) {
      try {
        const transactionData = {
          date: transaction.date,
          description: transaction.description,
          category: transaction.category,
          amount: transaction.type === 'expense' ? -Math.abs(transaction.amount) : Math.abs(transaction.amount),
          type: transaction.type,
          payment_source: transaction.payment_source,
          notes: transaction.notes || '',
          account_id: currentAccount.id
        }

        await addTransaction(transactionData)
        successCount++
      } catch (error) {
        console.error(`Error importing transaction on row ${transaction.row}:`, error)
        errorCount++
      }
    }

    if (successCount > 0) {
      toast.success(`Successfully imported ${successCount} transactions`)
    }
    if (errorCount > 0) {
      toast.error(`Failed to import ${errorCount} transactions`)
    }

    setOpen(false)
    resetState()
    if (onSuccess) onSuccess()
  }

  const resetState = () => {
    setParsedTransactions([])
    setValidationErrors([])
    setStep('upload')
    setIsUploading(false)
  }

  const downloadTemplate = () => {
    const template = `date,description,category,amount,type,payment_source,notes
2024-01-15,Coffee Shop,Food & Dining,12.50,expense,credit_card,Morning coffee
2024-01-16,Freelance Payment,Income,500.00,income,bank_transfer,Project completion`
    
    const blob = new Blob([template], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'transaction_template.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      setOpen(newOpen)
      if (!newOpen) resetState()
    }}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Import Transactions</DialogTitle>
          <DialogDescription>
            Upload a CSV file to import multiple transactions at once
          </DialogDescription>
        </DialogHeader>

        {step === 'upload' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>CSV File</Label>
              <Button variant="outline" size="sm" onClick={downloadTemplate}>
                <Download className="mr-2 h-4 w-4" />
                Download Template
              </Button>
            </div>
            
            <Card 
              className={`cursor-pointer transition-colors ${
                dragActive 
                  ? 'border-primary bg-primary/5' 
                  : 'border-muted-foreground/25 hover:border-muted-foreground/50'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={openFileDialog}
            >
              <CardContent className="p-6">
                <div className="flex flex-col items-center justify-center space-y-2 text-center">
                  {isUploading ? (
                    <>
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Processing CSV file...</p>
                    </>
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <p className="text-sm font-medium">Drop your CSV file here or click to browse</p>
                      <p className="text-xs text-muted-foreground">Supports CSV files up to 10MB</p>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            <Input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>CSV Format:</strong> Your file should include columns: date, description, category, amount, type, payment_source. 
                Optional columns: notes.
              </AlertDescription>
            </Alert>
          </div>
        )}

        {step === 'preview' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">{parsedTransactions.length} transactions</Badge>
                {validationErrors.length > 0 && (
                  <Badge variant="destructive">{validationErrors.length} errors</Badge>
                )}
              </div>
              <Button variant="outline" onClick={() => setStep('upload')}>
                Upload Different File
              </Button>
            </div>

            {validationErrors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Validation Errors:</strong>
                  <ul className="mt-2 space-y-1">
                    {validationErrors.slice(0, 5).map((error, index) => (
                      <li key={index} className="text-xs">
                        Row {error.row}: {error.field} - {error.message}
                      </li>
                    ))}
                    {validationErrors.length > 5 && (
                      <li className="text-xs">... and {validationErrors.length - 5} more errors</li>
                    )}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            <div className="max-h-60 overflow-y-auto border rounded">
              <table className="w-full text-xs">
                <thead className="bg-muted">
                  <tr>
                    <th className="p-2 text-left">Date</th>
                    <th className="p-2 text-left">Description</th>
                    <th className="p-2 text-left">Category</th>
                    <th className="p-2 text-left">Amount</th>
                    <th className="p-2 text-left">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedTransactions.slice(0, 10).map((transaction, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-2">{transaction.date}</td>
                      <td className="p-2">{transaction.description}</td>
                      <td className="p-2">{transaction.category}</td>
                      <td className="p-2">${transaction.amount}</td>
                      <td className="p-2">{transaction.type}</td>
                    </tr>
                  ))}
                  {parsedTransactions.length > 10 && (
                    <tr>
                      <td colSpan={5} className="p-2 text-center text-muted-foreground">
                        ... and {parsedTransactions.length - 10} more transactions
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {step === 'processing' && (
          <div className="flex flex-col items-center justify-center space-y-4 py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Importing transactions...</p>
          </div>
        )}

        <DialogFooter>
          {step === 'preview' && (
            <>
              <Button variant="outline" onClick={() => setStep('upload')}>
                Back
              </Button>
              <Button 
                onClick={handleImport} 
                disabled={validationErrors.length > 0}
              >
                Import {parsedTransactions.length} Transactions
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}