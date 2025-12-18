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
  const formatted = amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  if (currencyCode === 'NGN') {
    return `NGN ${formatted}`;
  } else if (currencyCode === 'USD') {
    return `$ ${formatted}`;
  } else {
    return `${currencyCode} ${formatted}`;
  }
};

/**
 * Generate minimalistic, clean PDF for invoice
 */
export const generateInvoicePDF = (invoiceData: InvoicePDFData, currencyCode: string = 'NGN'): jsPDF => {
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 30;
    let yPos = margin;

    // Minimalist colors - only black and grays
    const black = [0, 0, 0];
    const darkGray = [60, 60, 60];
    const gray = [120, 120, 120];
    const lightGray = [200, 200, 200];

    // ========== HEADER ==========
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(black[0], black[1], black[2]);
    doc.text('INVOICE', margin, yPos);

    // Invoice number
    yPos += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(gray[0], gray[1], gray[2]);
    doc.text(`#${invoiceData.invoice_number}`, margin, yPos);

    // Status (simple text, no badge)
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.text(invoiceData.status.toUpperCase(), pageWidth - margin, yPos, { align: 'right' });

    yPos += 25;

    // ========== FROM/TO SECTION ==========
    const colWidth = (pageWidth - 2 * margin) / 2;
    const startY = yPos;

    // FROM
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(gray[0], gray[1], gray[2]);
    doc.text('FROM', margin, yPos);
    yPos += 6;

    const settings = invoiceData.businessSettings;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(black[0], black[1], black[2]);

    if (settings?.business_name) {
      doc.setFont('helvetica', 'bold');
      doc.text(settings.business_name, margin, yPos);
      doc.setFont('helvetica', 'normal');
      yPos += 5;
    }

    doc.setFontSize(9);
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);

    if (settings?.business_email) {
      doc.text(settings.business_email, margin, yPos);
      yPos += 4.5;
    }
    if (settings?.business_phone) {
      doc.text(settings.business_phone, margin, yPos);
      yPos += 4.5;
    }
    if (settings?.business_address) {
      doc.text(settings.business_address, margin, yPos);
      yPos += 4.5;
      if (settings.business_city && settings.business_state) {
        doc.text(`${settings.business_city}, ${settings.business_state}`, margin, yPos);
        yPos += 4.5;
      }
    }
    if (settings?.business_website) {
      doc.text(settings.business_website, margin, yPos);
      yPos += 4.5;
    }

    // BILL TO
    let toYPos = startY;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(gray[0], gray[1], gray[2]);
    doc.text('BILL TO', margin + colWidth, toYPos);
    toYPos += 6;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(black[0], black[1], black[2]);
    doc.text(invoiceData.client.name, margin + colWidth, toYPos);
    doc.setFont('helvetica', 'normal');
    toYPos += 5;

    doc.setFontSize(9);
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);

    if (invoiceData.client.email) {
      doc.text(invoiceData.client.email, margin + colWidth, toYPos);
      toYPos += 4.5;
    }
    if (invoiceData.client.phone) {
      doc.text(invoiceData.client.phone, margin + colWidth, toYPos);
      toYPos += 4.5;
    }
    if (invoiceData.client.address) {
      doc.text(invoiceData.client.address, margin + colWidth, toYPos);
      toYPos += 4.5;
      if (invoiceData.client.city && invoiceData.client.state) {
        doc.text(`${invoiceData.client.city}, ${invoiceData.client.state}`, margin + colWidth, toYPos);
        toYPos += 4.5;
      }
    }

    yPos = Math.max(yPos, toYPos) + 20;

    // ========== DATES SECTION ==========
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(gray[0], gray[1], gray[2]);

    const dateColWidth = (pageWidth - 2 * margin) / 3;
    doc.text('DATE', margin, yPos);
    doc.text('DUE DATE', margin + dateColWidth, yPos);
    if (invoiceData.paid_date) {
      doc.text('PAID DATE', margin + dateColWidth * 2, yPos);
    }

    yPos += 5;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(black[0], black[1], black[2]);
    doc.text(formatInvoiceDate(invoiceData.invoice_date), margin, yPos);
    doc.text(formatInvoiceDate(invoiceData.due_date), margin + dateColWidth, yPos);
    if (invoiceData.paid_date) {
      doc.text(formatInvoiceDate(invoiceData.paid_date), margin + dateColWidth * 2, yPos);
    }

    yPos += 20;

    // ========== LINE ITEMS TABLE ==========
    // Simple line for header
    doc.setDrawColor(black[0], black[1], black[2]);
    doc.setLineWidth(0.5);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 6;

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(gray[0], gray[1], gray[2]);

    doc.text('DESCRIPTION', margin, yPos);
    doc.text('QTY', pageWidth - margin - 85, yPos);
    doc.text('PRICE', pageWidth - margin - 55, yPos);
    doc.text('AMOUNT', pageWidth - margin, yPos, { align: 'right' });

    yPos += 6;

    // Items
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    invoiceData.items.forEach((item, index) => {
      if (yPos > pageHeight - 70) {
        doc.addPage();
        yPos = margin;
      }

      doc.setTextColor(black[0], black[1], black[2]);

      // Truncate long descriptions
      let description = item.description;
      const maxWidth = pageWidth - margin - 100;
      while (doc.getTextWidth(description) > maxWidth && description.length > 0) {
        description = description.slice(0, -1);
      }
      if (description.length < item.description.length) {
        description += '...';
      }

      doc.text(description, margin, yPos);

      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
      doc.text(item.quantity.toString(), pageWidth - margin - 85, yPos);
      doc.text(formatCurrency(item.unit_price, currencyCode), pageWidth - margin - 55, yPos);

      doc.setTextColor(black[0], black[1], black[2]);
      doc.text(formatCurrency(item.amount, currencyCode), pageWidth - margin, yPos, { align: 'right' });

      yPos += 8;

      // Subtle line between items
      if (index < invoiceData.items.length - 1) {
        doc.setDrawColor(lightGray[0], lightGray[1], lightGray[2]);
        doc.setLineWidth(0.1);
        doc.line(margin, yPos - 1, pageWidth - margin, yPos - 1);
      }
    });

    // Line after items
    yPos += 5;
    doc.setDrawColor(black[0], black[1], black[2]);
    doc.setLineWidth(0.5);
    doc.line(margin, yPos, pageWidth - margin, yPos);

    yPos += 15;

    // ========== TOTALS ==========
    const totalsX = pageWidth - margin - 75;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.text('Subtotal', totalsX, yPos);
    doc.setTextColor(black[0], black[1], black[2]);
    doc.text(formatCurrency(invoiceData.subtotal, currencyCode), pageWidth - margin, yPos, { align: 'right' });

    yPos += 6;
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.text(`Tax (${invoiceData.tax_rate}%)`, totalsX, yPos);
    doc.setTextColor(black[0], black[1], black[2]);
    doc.text(formatCurrency(invoiceData.tax_amount, currencyCode), pageWidth - margin, yPos, { align: 'right' });

    yPos += 10;
    doc.setDrawColor(black[0], black[1], black[2]);
    doc.setLineWidth(1);
    doc.line(totalsX, yPos, pageWidth - margin, yPos);

    yPos += 8;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(black[0], black[1], black[2]);
    doc.text('Total', totalsX, yPos);
    doc.text(formatCurrency(invoiceData.total_amount, currencyCode), pageWidth - margin, yPos, { align: 'right' });

    yPos += 25;

    // ========== NOTES & TERMS ==========
    if (invoiceData.notes || invoiceData.terms) {
      if (yPos > pageHeight - 60) {
        doc.addPage();
        yPos = margin;
      }

      if (invoiceData.notes) {
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(gray[0], gray[1], gray[2]);
        doc.text('NOTES', margin, yPos);
        yPos += 5;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
        const notesLines = doc.splitTextToSize(invoiceData.notes, pageWidth - 2 * margin);
        doc.text(notesLines, margin, yPos);
        yPos += notesLines.length * 5 + 10;
      }

      if (invoiceData.terms) {
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(gray[0], gray[1], gray[2]);
        doc.text('PAYMENT TERMS', margin, yPos);
        yPos += 5;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
        const termsLines = doc.splitTextToSize(invoiceData.terms, pageWidth - 2 * margin);
        doc.text(termsLines, margin, yPos);
        yPos += termsLines.length * 5 + 10;
      }
    }

    // ========== BANK DETAILS ==========
    if (settings?.bank_name || settings?.account_number) {
      if (yPos > pageHeight - 50) {
        doc.addPage();
        yPos = margin;
      }

      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(gray[0], gray[1], gray[2]);
      doc.text('BANK DETAILS', margin, yPos);
      yPos += 5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);

      if (settings.bank_name) {
        doc.text(`Bank: ${settings.bank_name}`, margin, yPos);
        yPos += 4.5;
      }
      if (settings.account_name) {
        doc.text(`Account Name: ${settings.account_name}`, margin, yPos);
        yPos += 4.5;
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
