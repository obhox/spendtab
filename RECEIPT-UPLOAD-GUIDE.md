# Receipt Upload Feature

This document explains the receipt upload functionality that allows users to upload receipt images directly to Supabase Storage instead of entering URLs manually.

## Overview

The receipt upload feature provides:
- **Drag & Drop Interface**: Users can drag receipt images directly into the upload area
- **File Type Validation**: Supports JPEG, PNG, WebP, and PDF files
- **File Size Limits**: Maximum 10MB per file
- **Secure Storage**: Files are stored in Supabase Storage with Row Level Security
- **User Isolation**: Each user can only access their own receipts
- **Automatic URL Generation**: Uploaded files get public URLs automatically

## Components

### 1. ReceiptUpload Component (`components/ui/receipt-upload.tsx`)
- Drag & drop interface for file uploads
- File validation and error handling
- Progress indicators during upload
- Preview and management of uploaded receipts
- Delete functionality for uploaded files

### 2. Storage Utilities (`lib/storage-utils.ts`)
- `uploadReceiptImage()`: Handles file upload to Supabase Storage
- `deleteReceiptImage()`: Removes files from storage
- `getReceiptFileInfo()`: Retrieves file metadata
- `initializeReceiptsBucket()`: Sets up the storage bucket

## Setup Instructions

### 1. Database Setup
Run the SQL commands from `lib/receipt-storage-setup.sql` in your Supabase SQL Editor:

```sql
-- Creates the receipts bucket with proper configuration
-- Sets up Row Level Security policies
-- Enables file size limits and MIME type restrictions
```

### 2. Environment Variables
Ensure your `.env.local` file contains:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # Optional, for admin operations
```

### 3. Bucket Initialization (Optional)
Run the setup script to programmatically create the bucket:
```bash
node scripts/setup-receipt-storage.js
```

## Security Features

### Row Level Security (RLS)
- Users can only upload files to their own folder (`user_id/filename`)
- Users can only view, update, and delete their own files
- All operations are authenticated and user-scoped

### File Validation
- **MIME Types**: Only allows image/jpeg, image/png, image/webp, application/pdf
- **File Size**: Maximum 10MB per file
- **Naming**: Automatic unique filename generation to prevent conflicts

### Storage Structure
Files are organized by user ID:
```
receipts/
├── user_id_1/
│   ├── transaction_123_abc123.jpg
│   └── transaction_456_def456.pdf
└── user_id_2/
    ├── transaction_789_ghi789.png
    └── transaction_012_jkl012.webp
```

## Usage in Transaction Form

The receipt upload component is integrated into the tax optimization section of the transaction form:

```tsx
<ReceiptUpload
  value={field.value}
  onChange={field.onChange}
  transactionId={transaction?.id}
/>
```

### Props
- `value`: Current receipt URL (if any)
- `onChange`: Callback when receipt URL changes
- `transactionId`: Optional transaction ID for file naming
- `disabled`: Disable upload functionality

## File Management

### Upload Process
1. User selects or drags a file
2. File validation (type, size)
3. Upload to Supabase Storage
4. Generate public URL
5. Update form field with URL

### Delete Process
1. User clicks delete button
2. Extract file path from URL
3. Verify user ownership
4. Remove from Supabase Storage
5. Clear form field

## Error Handling

The system handles various error scenarios:
- **Invalid file types**: Shows user-friendly error message
- **File too large**: Warns about 10MB limit
- **Upload failures**: Network or storage errors
- **Permission errors**: Unauthorized access attempts
- **Missing authentication**: User not logged in

## Performance Considerations

- **File Size Limits**: 10MB maximum to ensure reasonable upload times
- **Image Optimization**: Consider implementing client-side image compression
- **CDN**: Supabase Storage provides global CDN for fast access
- **Caching**: Files are cached with 1-hour cache control headers

## Troubleshooting

### Common Issues

1. **Bucket doesn't exist**
   - Run the SQL setup script in Supabase
   - Check bucket creation in Storage dashboard

2. **Upload permissions denied**
   - Verify RLS policies are set up correctly
   - Check user authentication status

3. **File not accessible**
   - Ensure bucket is set to public
   - Verify file path structure

4. **Large file uploads failing**
   - Check file size (10MB limit)
   - Verify network connection stability

### Debug Steps

1. Check browser console for errors
2. Verify Supabase environment variables
3. Test authentication status
4. Check Storage dashboard for uploaded files
5. Verify RLS policies in SQL Editor

## Future Enhancements

Potential improvements for the receipt upload feature:
- **Image compression**: Automatic client-side image optimization
- **OCR integration**: Extract text from receipts automatically
- **Thumbnail generation**: Create preview thumbnails
- **Bulk upload**: Support multiple file uploads
- **Cloud backup**: Additional backup to other cloud providers
- **Receipt templates**: Standardized receipt formats