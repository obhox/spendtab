import jsPDF from 'jspdf';
import { formatInvoiceDateLong } from './invoice-utils';

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

interface UserProfile {
  first_name?: string | null;
  last_name?: string | null;
  company_name?: string | null;
  email?: string | null;
}

export interface InvoicePDFData extends Invoice {
  client: Client;
  items: InvoiceItem[];
  userProfile: UserProfile;
}

/**
 * Format currency amount for display
 */
const formatCurrency = (amount: number, currencyCode: string = 'NGN'): string => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 2
  }).format(amount);
};

/**
 * Convert hex color to RGB array
 */
const hexToRgb = (hex: string): [number, number, number] => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
      ]
    : [0, 0, 0];
};

/**
 * Generate PDF for invoice
 */
export const generateInvoicePDF = (invoiceData: InvoicePDFData, currencyCode: string = 'USD'): jsPDF => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let yPos = margin;

  // Colors - SpendTab theme
  const primaryColor = '#6366F1'; // Purple
  const primaryRgb = hexToRgb(primaryColor);
  const grayColor = '#6B7280';
  const grayRgb = hexToRgb(grayColor);
  const darkColor = '#1F2937';
  const darkRgb = hexToRgb(darkColor);

  // ========== HEADER ==========
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkRgb[0], darkRgb[1], darkRgb[2]);
  doc.text('INVOICE', margin, yPos);

  // Invoice number and status on right
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(grayRgb[0], grayRgb[1], grayRgb[2]);
  const invoiceNumberText = `Invoice #${invoiceData.invoice_number}`;
  const invoiceNumberWidth = doc.getTextWidth(invoiceNumberText);
  doc.text(invoiceNumberText, pageWidth - margin - invoiceNumberWidth, yPos - 2);

  // Status badge
  yPos += 2;
  const statusX = pageWidth - margin - 35;
  const statusColor =
    invoiceData.status === 'paid' ? [16, 185, 129] :
    invoiceData.status === 'overdue' ? [239, 68, 68] :
    invoiceData.status === 'sent' ? [59, 130, 246] :
    invoiceData.status === 'cancelled' ? [107, 114, 128] :
    [139, 92, 246]; // draft - purple

  doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.roundedRect(statusX, yPos - 6, 33, 9, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(invoiceData.status.toUpperCase(), statusX + 16.5, yPos, { align: 'center' });

  yPos += 10;
  doc.setDrawColor(primaryRgb[0], primaryRgb[1], primaryRgb[2]);
  doc.setLineWidth(0.5);
  doc.line(margin, yPos, pageWidth - margin, yPos);

  // ========== FROM/TO SECTION ==========
  yPos += 12;
  const colWidth = (pageWidth - 2 * margin) / 2;

  // FROM (User/Company)
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkRgb[0], darkRgb[1], darkRgb[2]);
  doc.text('FROM:', margin, yPos);

  yPos += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  const companyName = invoiceData.userProfile.company_name ||
                     `${invoiceData.userProfile.first_name || ''} ${invoiceData.userProfile.last_name || ''}`.trim() ||
                     'Your Company';
  doc.text(companyName, margin, yPos);

  if (invoiceData.userProfile.email) {
    yPos += 5;
    doc.setFontSize(10);
    doc.setTextColor(grayRgb[0], grayRgb[1], grayRgb[2]);
    doc.text(invoiceData.userProfile.email, margin, yPos);
  }

  // TO (Client) - Same starting line as FROM
  let toYPos = yPos - (invoiceData.userProfile.email ? 11 : 6);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkRgb[0], darkRgb[1], darkRgb[2]);
  doc.setFontSize(10);
  doc.text('BILL TO:', margin + colWidth, toYPos);

  toYPos += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text(invoiceData.client.name, margin + colWidth, toYPos);

  if (invoiceData.client.email) {
    toYPos += 5;
    doc.setFontSize(10);
    doc.setTextColor(grayRgb[0], grayRgb[1], grayRgb[2]);
    doc.text(invoiceData.client.email, margin + colWidth, toYPos);
  }

  if (invoiceData.client.address) {
    toYPos += 5;
    doc.text(invoiceData.client.address, margin + colWidth, toYPos);
  }

  if (invoiceData.client.city && invoiceData.client.state) {
    toYPos += 5;
    const cityLine = `${invoiceData.client.city}, ${invoiceData.client.state} ${invoiceData.client.postal_code || ''}`.trim();
    doc.text(cityLine, margin + colWidth, toYPos);
  }

  // Advance yPos to the max of both columns
  yPos = Math.max(yPos, toYPos);

  // ========== DATE SECTION ==========
  yPos += 12;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkRgb[0], darkRgb[1], darkRgb[2]);
  doc.setFontSize(10);
  doc.text('Invoice Date:', margin, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(formatInvoiceDateLong(invoiceData.invoice_date), margin + 30, yPos);

  yPos += 6;
  doc.setFont('helvetica', 'bold');
  doc.text('Due Date:', margin, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(formatInvoiceDateLong(invoiceData.due_date), margin + 30, yPos);

  if (invoiceData.paid_date) {
    yPos += 6;
    doc.setFont('helvetica', 'bold');
    doc.text('Paid Date:', margin, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(formatInvoiceDateLong(invoiceData.paid_date), margin + 30, yPos);
  }

  // ========== LINE ITEMS TABLE ==========
  yPos += 15;

  // Table header
  doc.setFillColor(primaryRgb[0], primaryRgb[1], primaryRgb[2]);
  doc.rect(margin, yPos - 6, pageWidth - 2 * margin, 10, 'F');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);

  const descCol = margin + 2;
  const qtyCol = pageWidth - margin - 85;
  const priceCol = pageWidth - margin - 60;
  const amountCol = pageWidth - margin - 2;

  doc.text('DESCRIPTION', descCol, yPos);
  doc.text('QTY', qtyCol, yPos);
  doc.text('PRICE', priceCol, yPos);
  doc.text('AMOUNT', amountCol, yPos, { align: 'right' });

  yPos += 8;
  doc.setTextColor(darkRgb[0], darkRgb[1], darkRgb[2]);
  doc.setFont('helvetica', 'normal');

  // Table rows
  invoiceData.items.forEach((item, index) => {
    // Check if we need a new page
    if (yPos > pageHeight - 60) {
      doc.addPage();
      yPos = margin;
    }

    // Alternating row background
    if (index % 2 === 1) {
      doc.setFillColor(250, 250, 250);
      doc.rect(margin, yPos - 5.5, pageWidth - 2 * margin, 8, 'F');
    }

    // Truncate description if too long
    let description = item.description;
    const maxDescWidth = qtyCol - descCol - 5;
    const descWidth = doc.getTextWidth(description);
    if (descWidth > maxDescWidth) {
      while (doc.getTextWidth(description + '...') > maxDescWidth && description.length > 0) {
        description = description.slice(0, -1);
      }
      description += '...';
    }

    doc.text(description, descCol, yPos);
    doc.text(item.quantity.toString(), qtyCol, yPos);
    doc.text(formatCurrency(item.unit_price, currencyCode), priceCol, yPos);
    doc.text(formatCurrency(item.amount, currencyCode), amountCol, yPos, { align: 'right' });

    yPos += 8;
  });

  // ========== TOTALS SECTION ==========
  yPos += 5;
  doc.setDrawColor(grayRgb[0], grayRgb[1], grayRgb[2]);
  doc.setLineWidth(0.3);
  doc.line(pageWidth - margin - 90, yPos, pageWidth - margin, yPos);

  yPos += 8;
  const totalsLabelX = pageWidth - margin - 60;
  const totalsAmountX = pageWidth - margin - 2;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(darkRgb[0], darkRgb[1], darkRgb[2]);
  doc.text('Subtotal:', totalsLabelX, yPos);
  doc.text(formatCurrency(invoiceData.subtotal, currencyCode), totalsAmountX, yPos, { align: 'right' });

  yPos += 6;
  doc.text(`Tax (${invoiceData.tax_rate}%):`, totalsLabelX, yPos);
  doc.text(formatCurrency(invoiceData.tax_amount, currencyCode), totalsAmountX, yPos, { align: 'right' });

  yPos += 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('TOTAL:', totalsLabelX, yPos);
  doc.text(formatCurrency(invoiceData.total_amount, currencyCode), totalsAmountX, yPos, { align: 'right' });

  // ========== NOTES AND TERMS ==========
  if (invoiceData.notes || invoiceData.terms) {
    yPos += 15;

    if (invoiceData.notes) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(darkRgb[0], darkRgb[1], darkRgb[2]);
      doc.text('Notes:', margin, yPos);

      yPos += 6;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(grayRgb[0], grayRgb[1], grayRgb[2]);
      const notesLines = doc.splitTextToSize(invoiceData.notes, pageWidth - 2 * margin);
      doc.text(notesLines, margin, yPos);
      yPos += notesLines.length * 5;
    }

    if (invoiceData.terms) {
      yPos += 5;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(darkRgb[0], darkRgb[1], darkRgb[2]);
      doc.text('Payment Terms:', margin, yPos);

      yPos += 6;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(grayRgb[0], grayRgb[1], grayRgb[2]);
      const termsLines = doc.splitTextToSize(invoiceData.terms, pageWidth - 2 * margin);
      doc.text(termsLines, margin, yPos);
    }
  }

  // ========== FOOTER ==========
  doc.setFontSize(8);
  doc.setTextColor(grayRgb[0], grayRgb[1], grayRgb[2]);
  doc.text(
    'Generated with SpendTab',
    pageWidth / 2,
    pageHeight - 10,
    { align: 'center' }
  );

  return doc;
};

/**
 * Download invoice PDF
 */
export const downloadInvoicePDF = (invoiceData: InvoicePDFData, currencyCode: string = 'USD') => {
  const doc = generateInvoicePDF(invoiceData, currencyCode);
  doc.save(`Invoice-${invoiceData.invoice_number}.pdf`);
};

/**
 * Get PDF as data URL for preview
 */
export const previewInvoicePDF = (invoiceData: InvoicePDFData, currencyCode: string = 'USD'): string => {
  const doc = generateInvoicePDF(invoiceData, currencyCode);
  return doc.output('dataurlstring');
};
