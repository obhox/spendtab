import { jsPDF } from 'jspdf';
import { formatInvoiceDate } from './invoice-utils';

interface InvoiceItem {
  id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
}

interface Client {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  country?: string;
}

interface Invoice {
  id: string;
  invoice_number: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  invoice_date: string;
  due_date: string;
  paid_date?: string | null;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total_amount: number;
  notes?: string | null;
  terms?: string | null;
}

interface BusinessSettings {
  business_name?: string | null;
  business_email?: string | null;
  business_phone?: string | null;
  business_address?: string | null;
  business_city?: string | null;
  business_state?: string | null;
  business_postal_code?: string | null;
  business_country?: string | null;
  business_website?: string | null;
  bank_name?: string | null;
  account_name?: string | null;
  account_number?: string | null;
}

export interface InvoicePDFData extends Invoice {
  client: Client;
  items: InvoiceItem[];
  businessSettings?: BusinessSettings | null;
}

/**
 * Format currency amount for display
 */
const formatCurrency = (amount: number, currencyCode: string = 'NGN'): string => {
  // Format number with commas
  const formatted = amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  // Use currency code instead of symbol to avoid encoding issues
  if (currencyCode === 'NGN') {
    return `NGN ${formatted}`;
  } else if (currencyCode === 'USD') {
    return `$ ${formatted}`;
  } else {
    return `${currencyCode} ${formatted}`;
  }
};

/**
 * Generate PDF for invoice - matches the preview layout exactly
 */
export const generateInvoicePDF = (invoiceData: InvoicePDFData, currencyCode: string = 'NGN'): jsPDF => {
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    let yPos = margin;

    // ========== HEADER ==========
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(17, 24, 39); // gray-900
    doc.text('INVOICE', margin, yPos);

    yPos += 6;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(75, 85, 99); // gray-600
    doc.text(`#${invoiceData.invoice_number}`, margin, yPos);

    // Status badge on right
    const statusColors = {
      draft: { bg: [139, 92, 246], text: 'DRAFT' },
      sent: { bg: [59, 130, 246], text: 'SENT' },
      paid: { bg: [16, 185, 129], text: 'PAID' },
      overdue: { bg: [239, 68, 68], text: 'OVERDUE' },
      cancelled: { bg: [107, 114, 128], text: 'CANCELLED' }
    };
    const status = statusColors[invoiceData.status];
    const statusWidth = 30;
    doc.setFillColor(status.bg[0], status.bg[1], status.bg[2]);
    doc.roundedRect(pageWidth - margin - statusWidth, margin - 4, statusWidth, 8, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text(status.text, pageWidth - margin - statusWidth / 2, margin, { align: 'center' });

    yPos += 15;

    // ========== FROM/TO SECTION ==========
    const colWidth = (pageWidth - 2 * margin) / 2;
    const startY = yPos;

    // FROM
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(107, 114, 128); // gray-500
    doc.text('FROM', margin, yPos);
    yPos += 6;

    const settings = invoiceData.businessSettings;
    if (settings?.business_name) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(17, 24, 39); // gray-900
      doc.text(settings.business_name, margin, yPos);
      yPos += 5;
    }

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(75, 85, 99); // gray-600

    if (settings?.business_email) {
      doc.text(settings.business_email, margin, yPos);
      yPos += 4;
    }
    if (settings?.business_phone) {
      doc.text(settings.business_phone, margin, yPos);
      yPos += 4;
    }
    if (settings?.business_address) {
      doc.text(settings.business_address, margin, yPos);
      yPos += 4;
      if (settings.business_city && settings.business_state) {
        doc.text(`${settings.business_city}, ${settings.business_state}`, margin, yPos);
        yPos += 4;
      }
    }
    if (settings?.business_website) {
      doc.text(settings.business_website, margin, yPos);
      yPos += 4;
    }

    // BILL TO
    let toYPos = startY;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(107, 114, 128); // gray-500
    doc.text('BILL TO', margin + colWidth, toYPos);
    toYPos += 6;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(17, 24, 39); // gray-900
    doc.text(invoiceData.client.name, margin + colWidth, toYPos);
    toYPos += 5;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(75, 85, 99); // gray-600

    if (invoiceData.client.email) {
      doc.text(invoiceData.client.email, margin + colWidth, toYPos);
      toYPos += 4;
    }
    if (invoiceData.client.phone) {
      doc.text(invoiceData.client.phone, margin + colWidth, toYPos);
      toYPos += 4;
    }
    if (invoiceData.client.address) {
      doc.text(invoiceData.client.address, margin + colWidth, toYPos);
      toYPos += 4;
      if (invoiceData.client.city && invoiceData.client.state) {
        doc.text(`${invoiceData.client.city}, ${invoiceData.client.state}`, margin + colWidth, toYPos);
        toYPos += 4;
      }
    }

    yPos = Math.max(yPos, toYPos) + 10;

    // ========== DATES SECTION ==========
    doc.setFillColor(249, 250, 251); // gray-50
    doc.rect(margin, yPos - 3, pageWidth - 2 * margin, 14, 'F');

    const dateColWidth = (pageWidth - 2 * margin) / 3;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(107, 114, 128); // gray-500
    doc.text('Invoice Date', margin + 2, yPos + 1);
    doc.text('Due Date', margin + dateColWidth + 2, yPos + 1);
    if (invoiceData.paid_date) {
      doc.text('Paid Date', margin + dateColWidth * 2 + 2, yPos + 1);
    }

    yPos += 5;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(17, 24, 39); // gray-900
    doc.text(formatInvoiceDate(invoiceData.invoice_date), margin + 2, yPos + 1);
    doc.text(formatInvoiceDate(invoiceData.due_date), margin + dateColWidth + 2, yPos + 1);
    if (invoiceData.paid_date) {
      doc.text(formatInvoiceDate(invoiceData.paid_date), margin + dateColWidth * 2 + 2, yPos + 1);
    }

    yPos += 12;

    // ========== LINE ITEMS TABLE ==========
    // Table header
    doc.setDrawColor(17, 24, 39); // gray-900
    doc.setLineWidth(0.5);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 1;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(17, 24, 39); // gray-900

    doc.text('Description', margin, yPos + 4);
    doc.text('Qty', pageWidth - margin - 85, yPos + 4);
    doc.text('Price', pageWidth - margin - 55, yPos + 4);
    doc.text('Amount', pageWidth - margin, yPos + 4, { align: 'right' });

    yPos += 7;
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 1;

    // Table rows
    doc.setFont('helvetica', 'normal');
    invoiceData.items.forEach((item, index) => {
      if (yPos > pageHeight - 60) {
        doc.addPage();
        yPos = margin;
      }

      doc.setDrawColor(229, 231, 235); // gray-200
      doc.setLineWidth(0.3);

      doc.setFontSize(9);
      doc.setTextColor(17, 24, 39); // gray-900
      doc.text(item.description, margin, yPos + 4);

      doc.setTextColor(75, 85, 99); // gray-600
      doc.text(item.quantity.toString(), pageWidth - margin - 85, yPos + 4);
      doc.text(formatCurrency(item.unit_price, currencyCode), pageWidth - margin - 55, yPos + 4);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(17, 24, 39); // gray-900
      doc.text(formatCurrency(item.amount, currencyCode), pageWidth - margin, yPos + 4, { align: 'right' });
      doc.setFont('helvetica', 'normal');

      yPos += 8;
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 1;
    });

    yPos += 8;

    // ========== TOTALS ==========
    const totalsX = pageWidth - margin - 70;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(75, 85, 99); // gray-600
    doc.text('Subtotal:', totalsX, yPos);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(17, 24, 39); // gray-900
    doc.text(formatCurrency(invoiceData.subtotal, currencyCode), pageWidth - margin, yPos, { align: 'right' });

    yPos += 6;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(75, 85, 99); // gray-600
    doc.text(`Tax (${invoiceData.tax_rate}%):`, totalsX, yPos);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(17, 24, 39); // gray-900
    doc.text(formatCurrency(invoiceData.tax_amount, currencyCode), pageWidth - margin, yPos, { align: 'right' });

    yPos += 8;
    doc.setDrawColor(17, 24, 39); // gray-900
    doc.setLineWidth(0.5);
    doc.line(totalsX, yPos - 3, pageWidth - margin, yPos - 3);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(17, 24, 39); // gray-900
    doc.text('Total:', totalsX, yPos);
    doc.text(formatCurrency(invoiceData.total_amount, currencyCode), pageWidth - margin, yPos, { align: 'right' });

    yPos += 15;

    // ========== NOTES & TERMS ==========
    if (invoiceData.notes || invoiceData.terms) {
      doc.setDrawColor(229, 231, 235); // gray-200
      doc.setLineWidth(0.3);
      doc.line(margin, yPos - 5, pageWidth - margin, yPos - 5);

      if (invoiceData.notes) {
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(17, 24, 39); // gray-900
        doc.text('Notes', margin, yPos);
        yPos += 5;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(75, 85, 99); // gray-600
        const notesLines = doc.splitTextToSize(invoiceData.notes, pageWidth - 2 * margin);
        doc.text(notesLines, margin, yPos);
        yPos += notesLines.length * 4 + 5;
      }

      if (invoiceData.terms) {
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(17, 24, 39); // gray-900
        doc.text('Payment Terms', margin, yPos);
        yPos += 5;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(75, 85, 99); // gray-600
        const termsLines = doc.splitTextToSize(invoiceData.terms, pageWidth - 2 * margin);
        doc.text(termsLines, margin, yPos);
        yPos += termsLines.length * 4 + 5;
      }
    }

    // ========== BANK DETAILS ==========
    if (settings?.bank_name || settings?.account_number) {
      if (yPos > pageHeight - 40) {
        doc.addPage();
        yPos = margin;
      }

      doc.setDrawColor(229, 231, 235); // gray-200
      doc.setLineWidth(0.3);
      doc.line(margin, yPos - 5, pageWidth - margin, yPos - 5);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(17, 24, 39); // gray-900
      doc.text('Bank Details', margin, yPos);
      yPos += 5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(75, 85, 99); // gray-600

      if (settings.bank_name) {
        doc.text(`Bank: ${settings.bank_name}`, margin, yPos);
        yPos += 4;
      }
      if (settings.account_name) {
        doc.text(`Account Name: ${settings.account_name}`, margin, yPos);
        yPos += 4;
      }
      if (settings.account_number) {
        doc.text(`Account Number: ${settings.account_number}`, margin, yPos);
      }
    }

    return doc;
  } catch (error) {
    console.error('Error in generateInvoicePDF:', error);
    throw error;
  }
};

/**
 * Download invoice PDF
 */
export const downloadInvoicePDF = (invoiceData: InvoicePDFData, currencyCode: string = 'NGN') => {
  try {
    const doc = generateInvoicePDF(invoiceData, currencyCode);
    doc.save(`Invoice-${invoiceData.invoice_number}.pdf`);
  } catch (error) {
    console.error('Error in downloadInvoicePDF:', error);
    throw error;
  }
};

/**
 * Get PDF as data URL for preview
 */
export const previewInvoicePDF = (invoiceData: InvoicePDFData, currencyCode: string = 'NGN'): string => {
  const doc = generateInvoicePDF(invoiceData, currencyCode);
  return doc.output('dataurlstring');
};
