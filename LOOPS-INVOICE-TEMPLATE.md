# Loops.so Invoice Email Template

## Template Configuration

**Template Name:** Invoice Notification
**Type:** Transactional Email

## Email Subject
```
Invoice {{invoiceNumber}} from {{businessName}}
```

## Template Variables

These variables will be sent from your application:

| Variable | Description | Example |
|----------|-------------|---------|
| `clientName` | Customer's name | John Doe |
| `businessName` | Your business name | Acme Corp |
| `invoiceNumber` | Invoice number | INV-2025-001 |
| `totalAmount` | Formatted amount | 1,234.56 |
| `currencySymbol` | Currency | NGN or $ |
| `dueDate` | Due date | December 25, 2025 |
| `invoiceDate` | Invoice date | December 19, 2025 |
| `invoiceLink` | Public invoice URL | https://... |
| `businessEmail` | Your email (optional) | hello@acme.com |
| `status` | Invoice status | sent |

## HTML Template Example

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 30px 40px; text-align: center; border-bottom: 1px solid #e5e5e5;">
              <h1 style="margin: 0 0 10px 0; font-size: 32px; font-weight: 700; color: #000000;">
                New Invoice
              </h1>
              <p style="margin: 0; font-size: 16px; color: #666666;">
                From {{businessName}}
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px 0; font-size: 16px; color: #000000;">
                Hello {{clientName}},
              </p>

              <p style="margin: 0 0 30px 0; font-size: 16px; color: #000000; line-height: 1.6;">
                Thank you for your business! Your invoice is ready and available for viewing.
              </p>

              <!-- Invoice Details Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 30px 0; border: 1px solid #e5e5e5; border-radius: 8px; background-color: #f9f9f9;">
                <tr>
                  <td style="padding: 24px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="font-size: 14px; color: #666666;">Invoice Number</span>
                        </td>
                        <td align="right" style="padding: 8px 0;">
                          <span style="font-size: 14px; font-weight: 600; color: #000000;">{{invoiceNumber}}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="font-size: 14px; color: #666666;">Invoice Date</span>
                        </td>
                        <td align="right" style="padding: 8px 0;">
                          <span style="font-size: 14px; color: #000000;">{{invoiceDate}}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="font-size: 14px; color: #666666;">Due Date</span>
                        </td>
                        <td align="right" style="padding: 8px 0;">
                          <span style="font-size: 14px; font-weight: 600; color: #dc2626;">{{dueDate}}</span>
                        </td>
                      </tr>
                      <tr>
                        <td colspan="2" style="padding-top: 20px; border-top: 1px solid #e5e5e5; margin-top: 12px;">
                          <table width="100%" cellpadding="0" cellspacing="0" style="padding-top: 12px;">
                            <tr>
                              <td>
                                <span style="font-size: 16px; font-weight: 600; color: #666666;">Total Amount</span>
                              </td>
                              <td align="right">
                                <span style="font-size: 24px; font-weight: 700; color: #000000;">
                                  {{currencySymbol}} {{totalAmount}}
                                </span>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 30px 0;">
                <tr>
                  <td align="center">
                    <a href="{{invoiceLink}}" style="display: inline-block; padding: 16px 40px; background-color: #000000; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600;">
                      View & Download Invoice
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 8px 0; font-size: 14px; color: #666666; text-align: center;">
                Or copy this link:
              </p>
              <p style="margin: 0 0 20px 0; font-size: 12px; color: #999999; text-align: center; word-break: break-all;">
                {{invoiceLink}}
              </p>

              <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 30px 0;">

              <p style="margin: 0; font-size: 14px; color: #666666; line-height: 1.6; text-align: center;">
                If you have any questions about this invoice, please contact us{{#if businessEmail}} at
                <a href="mailto:{{businessEmail}}" style="color: #000000; text-decoration: none; font-weight: 600;">{{businessEmail}}</a>{{/if}}.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; border-top: 1px solid #e5e5e5; background-color: #f9f9f9; border-radius: 0 0 8px 8px; text-align: center;">
              <p style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #000000;">
                {{businessName}}
              </p>
              <p style="margin: 0; font-size: 12px; color: #999999;">
                Powered by SpendTab
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

## Plain Text Version

```
Invoice {{invoiceNumber}} from {{businessName}}

Hello {{clientName}},

Thank you for your business! Your invoice is ready and available for viewing.

Invoice Details:
- Invoice Number: {{invoiceNumber}}
- Invoice Date: {{invoiceDate}}
- Due Date: {{dueDate}}
- Total Amount: {{currencySymbol}} {{totalAmount}}

View & Download Invoice:
{{invoiceLink}}

If you have any questions about this invoice, please contact us{{#if businessEmail}} at {{businessEmail}}{{/if}}.

Best regards,
{{businessName}}

---
Powered by SpendTab
```

## Setup Instructions

1. **Create Template in Loops.so:**
   - Go to your Loops.so dashboard
   - Navigate to Transactional → Create Template
   - Name: "Invoice Notification"
   - Copy the HTML template above into the editor
   - Customize colors and styling to match your brand

2. **Configure Variables:**
   - Loops.so will automatically detect the variables in your template
   - Test the template with sample data to ensure formatting is correct

3. **Get Template ID:**
   - After saving, copy your template ID
   - Add it to `.env.local`: `INVOICE_EMAIL_TEMPLATE_ID=your_template_id_here`

4. **Customize (Optional):**
   - Add your logo
   - Change button colors
   - Adjust spacing and fonts
   - Add additional information

## Testing

Use Loops.so's built-in testing feature with sample data:

```json
{
  "clientName": "John Doe",
  "businessName": "Acme Corporation",
  "invoiceNumber": "INV-2025-001",
  "totalAmount": "1,234.56",
  "currencySymbol": "NGN",
  "dueDate": "January 15, 2025",
  "invoiceDate": "December 19, 2024",
  "invoiceLink": "https://yourapp.com/invoice/abc123xyz",
  "businessEmail": "billing@acme.com",
  "status": "sent"
}
```

## Tips

- Keep the design clean and professional
- Make the CTA button highly visible
- Test on mobile devices
- Include both HTML and plain text versions
- Use conditional logic for optional fields (like businessEmail)
