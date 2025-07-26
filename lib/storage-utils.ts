import { supabase } from './supabase'
import { getCurrentUser } from './auth-utils'

// Storage bucket name for receipts
export const RECEIPTS_BUCKET = 'receipts'

/**
 * Upload a receipt image to Supabase Storage
 * @param file - The image file to upload
 * @param transactionId - The transaction ID to associate with the receipt
 * @returns Promise with the public URL of the uploaded image
 */
export async function uploadReceiptImage(file: File, transactionId?: string): Promise<string> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      throw new Error('User not authenticated')
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type. Please upload an image (JPEG, PNG, WebP) or PDF file.')
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      throw new Error('File size too large. Please upload a file smaller than 10MB.')
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}/${transactionId || Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from(RECEIPTS_BUCKET)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Upload error:', error)
      throw new Error(`Failed to upload receipt: ${error.message}`)
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(RECEIPTS_BUCKET)
      .getPublicUrl(data.path)

    return urlData.publicUrl
  } catch (error) {
    console.error('Receipt upload error:', error)
    throw error
  }
}

/**
 * Delete a receipt image from Supabase Storage
 * @param receiptUrl - The public URL of the receipt to delete
 */
export async function deleteReceiptImage(receiptUrl: string): Promise<void> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      throw new Error('User not authenticated')
    }

    // Extract file path from URL
    const url = new URL(receiptUrl)
    const pathParts = url.pathname.split('/')
    const bucketIndex = pathParts.findIndex(part => part === RECEIPTS_BUCKET)
    
    if (bucketIndex === -1) {
      throw new Error('Invalid receipt URL')
    }

    const filePath = pathParts.slice(bucketIndex + 1).join('/')
    
    // Verify the file belongs to the current user
    if (!filePath.startsWith(user.id + '/')) {
      throw new Error('Unauthorized: Cannot delete receipt that does not belong to you')
    }

    const { error } = await supabase.storage
      .from(RECEIPTS_BUCKET)
      .remove([filePath])

    if (error) {
      console.error('Delete error:', error)
      throw new Error(`Failed to delete receipt: ${error.message}`)
    }
  } catch (error) {
    console.error('Receipt deletion error:', error)
    throw error
  }
}

/**
 * Initialize the receipts storage bucket (run this once during setup)
 */
export async function initializeReceiptsBucket(): Promise<void> {
  try {
    // Create bucket if it doesn't exist
    const { error: bucketError } = await supabase.storage.createBucket(RECEIPTS_BUCKET, {
      public: true,
      allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'],
      fileSizeLimit: 10485760 // 10MB
    })

    if (bucketError && !bucketError.message.includes('already exists')) {
      console.error('Bucket creation error:', bucketError)
      throw bucketError
    }

    console.log('Receipts bucket initialized successfully')
  } catch (error) {
    console.error('Bucket initialization error:', error)
    throw error
  }
}

/**
 * Get file info from receipt URL
 * @param receiptUrl - The public URL of the receipt
 * @returns File information including name and size
 */
export async function getReceiptFileInfo(receiptUrl: string): Promise<{ name: string; size?: number } | null> {
  try {
    const url = new URL(receiptUrl)
    const pathParts = url.pathname.split('/')
    const bucketIndex = pathParts.findIndex(part => part === RECEIPTS_BUCKET)
    
    if (bucketIndex === -1) {
      return null
    }

    const filePath = pathParts.slice(bucketIndex + 1).join('/')
    const fileName = filePath.split('/').pop() || 'receipt'

    return {
      name: fileName,
      size: undefined // Size info would require additional API call
    }
  } catch (error) {
    console.error('Error getting file info:', error)
    return null
  }
}