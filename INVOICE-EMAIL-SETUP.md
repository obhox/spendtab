# Invoice Email Setup Guide

This guide will help you set up invoice email notifications using Loops.so.

## Overview

When you mark an invoice as "sent", the system will:
1. Generate a secure, unique share token for the invoice
2. Create a public link to view/download the invoice
3. Send an email to the customer with invoice details and the link

## Step 1: Run the Database Migration

First, add the `share_token` field to your invoices table:

1. Go to your Supabase SQL Editor
2. Open the file `lib/invoice-share-token-migration.sql`
3. Copy and paste the entire SQL script
4. Run the script

This will:
- Add a `share_token` column to the invoices table
- Create functions to generate and manage secure tokens
- Add necessary indexes for performance

## Step 2: Create the Loops.so Email Template

1. Log in to your Loops.so dashboard
2. Go to **Transactional Emails** → **Create Template**
3. Name it "Invoice Notification" or similar
4. Use the template design below

### Template Variables

Your template will receive these variables:

- `clientName` - The customer's name
- `businessName` - Your business name
- `invoiceNumber` - Invoice number (e.g., INV-2025-001)
- `totalAmount` - Formatted total amount (e.g., 1,234.56)
- `currencySymbol` - Currency symbol (NGN, $, etc.)
- `dueDate` - Formatted due date (e.g., December 25, 2025)
- `invoiceDate` - Formatted invoice date
- `invoiceLink` - Public link to view/download the invoice
- `businessEmail` - Your business email (optional)
- `status` - Invoice status (sent, paid, etc.)

### Suggested Email Template

**Subject:** Invoice {{invoiceNumber}} from {{businessName}}

**Body:**
```
Hello {{clientName}},

Thank you for your business! Your invoice is ready.

Invoice Details:
• Invoice Number: {{invoiceNumber}}
• Amount Due: {{currencySymbol}} {{totalAmount}}
• Invoice Date: {{invoiceDate}}
• Due Date: {{dueDate}}

[View Invoice Button] → Link to: {{invoiceLink}}

You can view, download, or print your invoice by clicking the button above.

If you have any questions about this invoice, please feel free to contact us{{#if businessEmail}} at {{businessEmail}}{{/if}}.

Best regards,
{{businessName}}
```

### Design Tips

- Make the "View Invoice" button prominent with a clear call-to-action
- Use your brand colors
- Include your business logo if available
- Keep it clean and professional

## Step 3: Configure Environment Variables

1. After creating the template in Loops.so, copy its Template ID
2. Add it to your `.env.local` file:

```env
# Loops.so Template IDs
INVOICE_EMAIL_TEMPLATE_ID=your_template_id_here

# App URL (update this for production)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

3. For production, update `NEXT_PUBLIC_APP_URL` to your actual domain:
```env
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

## Step 4: Test the Feature

1. Create a test invoice with a client that has a valid email address
2. Click the "Mark as Sent" action on the invoice
3. The system will:
   - Update the invoice status to "sent"
   - Generate a secure share token
   - Send an email via Loops.so

4. Check that:
   - The email arrives at the customer's inbox
   - The invoice link works and displays the invoice correctly
   - The customer can download the PDF

## How It Works

### Invoice Share Token

- Each invoice gets a unique, secure token when marked as sent
- The token is stored in the database and never changes for that invoice
- Public URL format: `yourdomain.com/invoice/[token]`
- Anyone with the link can view the invoice (no login required)

### Public Invoice View

The public invoice page (`/invoice/[token]`) shows:
- Invoice details (number, dates, amounts)
- Client information
- Line items
- Notes and payment terms
- Bank details (if configured)
- Download PDF button

### Security Considerations

- Tokens are cryptographically random (24 bytes, base64 encoded)
- Tokens are unique and indexed for fast lookups
- No sensitive user data is exposed on public pages
- Only invoice data associated with that token is displayed

## Customization

### Changing the Email Template

Update your template in Loops.so anytime. Changes take effect immediately.

### Customizing the Public Invoice Page

Edit `app/invoice/[token]/page.tsx` to:
- Change the layout
- Add your branding
- Modify what information is displayed
- Add additional features

### Currency Support

The system currently supports:
- NGN (Nigerian Naira)
- USD (US Dollar)

To add more currencies, update the formatting logic in `invoice-actions.tsx`.

## Troubleshooting

### Email not sending
- Check that `LOOPS_API_KEY` is set correctly
- Verify `INVOICE_EMAIL_TEMPLATE_ID` matches your template
- Check Loops.so logs for delivery status

### Invoice link not working
- Ensure the database migration ran successfully
- Verify `NEXT_PUBLIC_APP_URL` is set correctly
- Check that the token exists in the database

### Client has no email
- The system will show an error if the client doesn't have an email
- Add an email address to the client before marking as sent

## Support

For issues with:
- **Loops.so**: Contact Loops.so support
- **Database migrations**: Check Supabase logs
- **Code issues**: Review the application logs

## Files Modified

- `lib/invoice-share-token-migration.sql` - Database migration
- `app/invoice/[token]/page.tsx` - Public invoice view
- `app/api/email/send-invoice.ts` - Email sending API
- `components/invoices/invoice-actions.tsx` - Invoice actions
- `.env.local` - Environment configuration
