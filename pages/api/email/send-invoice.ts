import type { NextApiRequest, NextApiResponse } from 'next';

if (!process.env.LOOPS_API_KEY) {
  throw new Error('Missing LOOPS_API_KEY environment variable');
}

if (!process.env.INVOICE_EMAIL_TEMPLATE_ID) {
  throw new Error('Missing INVOICE_EMAIL_TEMPLATE_ID environment variable');
}

const LOOPS_API_KEY = process.env.LOOPS_API_KEY;
const INVOICE_EMAIL_TEMPLATE_ID = process.env.INVOICE_EMAIL_TEMPLATE_ID;

type SendInvoiceRequestBody = {
  invoiceNumber: string;
  clientEmail: string;
  clientName: string;
  businessName: string;
  totalAmount: string;
  currencySymbol: string;
  dueDate: string;
  invoiceDate: string;
  shareToken: string;
  businessEmail?: string;
  status: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      invoiceNumber,
      clientEmail,
      clientName,
      businessName,
      totalAmount,
      currencySymbol,
      dueDate,
      invoiceDate,
      shareToken,
      businessEmail,
      status
    } = req.body as SendInvoiceRequestBody;

    // Validate required fields
    if (!invoiceNumber || !clientEmail || !clientName || !shareToken) {
      return res.status(400).json({
        error: 'Missing required fields'
      });
    }

    // Generate the public invoice link
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const invoiceLink = `${baseUrl}/invoice/${shareToken}`;

    // Send email using Loops.so API
    const loopsResponse = await fetch('https://app.loops.so/api/v1/transactional', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOOPS_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transactionalId: INVOICE_EMAIL_TEMPLATE_ID,
        email: clientEmail,
        dataVariables: {
          clientName: clientName,
          businessName: businessName || 'Your Business',
          invoiceNumber: invoiceNumber,
          totalAmount: totalAmount,
          currencySymbol: currencySymbol || 'NGN',
          dueDate: dueDate,
          invoiceDate: invoiceDate,
          invoiceLink: invoiceLink,
          businessEmail: businessEmail || '',
          status: status || 'sent'
        }
      })
    });

    if (!loopsResponse.ok) {
      const errorText = await loopsResponse.text();
      console.error('Loops.so API error:', errorText);
      return res.status(400).json({ error: `Failed to send email: ${errorText}` });
    }

    const responseData = await loopsResponse.json();
    console.log('Invoice email sent successfully via Loops.so:', responseData);

    return res.status(200).json({
      message: 'Invoice email sent successfully',
      invoiceLink: invoiceLink
    });
  } catch (error) {
    console.error('Server error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return res.status(500).json({ error: errorMessage });
  }
}
