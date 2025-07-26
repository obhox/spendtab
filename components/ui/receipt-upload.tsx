"use client"

import React, { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Upload, X, FileText, Image, Loader2, ExternalLink } from 'lucide-react'
import { uploadReceiptImage, deleteReceiptImage, getReceiptFileInfo } from '@/lib/storage-utils'
import { toast } from 'sonner'

interface ReceiptUploadProps {
  value?: string
  onChange: (url: string | undefined) => void
  transactionId?: string
  disabled?: boolean
}

export function ReceiptUpload({ value, onChange, transactionId, disabled }: ReceiptUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (file: File) => {
    if (disabled) return

    setIsUploading(true)
    try {
      const url = await uploadReceiptImage(file, transactionId)
      onChange(url)
      toast.success('Receipt uploaded successfully!')
    } catch (error) {
      console.error('Upload failed:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to upload receipt')
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    
    if (disabled) return

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

  const handleRemove = async () => {
    if (!value || disabled) return

    try {
      await deleteReceiptImage(value)
      onChange(undefined)
      toast.success('Receipt removed successfully!')
    } catch (error) {
      console.error('Delete failed:', error)
      toast.error('Failed to remove receipt')
    }
  }

  const openFileDialog = () => {
    if (!disabled) {
      fileInputRef.current?.click()
    }
  }

  const getFileIcon = (url: string) => {
    if (url.toLowerCase().includes('.pdf')) {
      return <FileText className="h-4 w-4" />
    }
    return <Image className="h-4 w-4" />
  }

  const getFileName = (url: string) => {
    try {
      const urlObj = new URL(url)
      const pathParts = urlObj.pathname.split('/')
      return pathParts[pathParts.length - 1] || 'receipt'
    } catch {
      return 'receipt'
    }
  }

  if (value) {
    return (
      <div className="space-y-2">
        <Label>Receipt</Label>
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {getFileIcon(value)}
                <span className="text-sm font-medium truncate max-w-[200px]">
                  {getFileName(value)}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(value, '_blank')}
                  disabled={disabled}
                >
                  <ExternalLink className="h-3 w-3" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRemove}
                  disabled={disabled}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <Label>Receipt Upload</Label>
      <Card
        className={`border-2 border-dashed transition-colors cursor-pointer ${
          dragActive 
            ? 'border-primary bg-primary/5' 
            : 'border-muted-foreground/25 hover:border-muted-foreground/50'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                <p className="text-sm text-muted-foreground">Uploading receipt...</p>
              </>
            ) : (
              <>
                <Upload className="h-8 w-8 text-muted-foreground" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">
                    Drop your receipt here or click to browse
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Supports JPEG, PNG, WebP, and PDF files up to 10MB
                  </p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />
    </div>
  )
}