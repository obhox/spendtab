/**
 * Invoice Utility Functions
 * Helper functions for invoice calculations, status management, and formatting
 */

/**
 * Calculate invoice totals including subtotal, tax, and total amount
 */
export const calculateInvoiceTotals = (
  items: Array<{ quantity: number; unit_price: number }>,
  taxRate: number
) => {
  const subtotal = items.reduce((sum, item) => {
    return sum + (item.quantity * item.unit_price);
  }, 0);

  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount;

  return {
    subtotal: Number(subtotal.toFixed(2)),
    taxAmount: Number(taxAmount.toFixed(2)),
    total: Number(total.toFixed(2))
  };
};

/**
 * Get Tailwind CSS classes for invoice status badge
 */
export const getInvoiceStatusColor = (status: string): string => {
  switch (status) {
    case 'paid':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'sent':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'overdue':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'cancelled':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    case 'draft':
    default:
      return 'bg-purple-100 text-purple-800 border-purple-200';
  }
};

/**
 * Calculate number of days until invoice is due
 * Returns negative number if overdue
 */
export const getDaysUntilDue = (dueDate: string): number => {
  const due = new Date(dueDate);
  const now = new Date();
  // Reset time to midnight for accurate day comparison
  due.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);

  const diffTime = due.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

/**
 * Check if invoice is overdue
 */
export const isInvoiceOverdue = (dueDate: string, status: string): boolean => {
  // Paid and cancelled invoices cannot be overdue
  if (status === 'paid' || status === 'cancelled') {
    return false;
  }
  return getDaysUntilDue(dueDate) < 0;
};

/**
 * Get human-readable due date status
 */
export const getDueDateStatus = (dueDate: string, status: string): string => {
  if (status === 'paid') {
    return 'Paid';
  }

  if (status === 'cancelled') {
    return 'Cancelled';
  }

  const daysUntilDue = getDaysUntilDue(dueDate);

  if (daysUntilDue < 0) {
    const daysOverdue = Math.abs(daysUntilDue);
    return `${daysOverdue} day${daysOverdue === 1 ? '' : 's'} overdue`;
  } else if (daysUntilDue === 0) {
    return 'Due today';
  } else if (daysUntilDue === 1) {
    return 'Due tomorrow';
  } else {
    return `Due in ${daysUntilDue} days`;
  }
};

/**
 * Format invoice date for display
 */
export const formatInvoiceDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
};

/**
 * Format invoice date for PDF (long format)
 */
export const formatInvoiceDateLong = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
};

/**
 * Calculate line item amount
 */
export const calculateLineItemAmount = (quantity: number, unitPrice: number): number => {
  return Number((quantity * unitPrice).toFixed(2));
};

/**
 * Validate invoice data before submission
 */
export const validateInvoiceData = (data: {
  client_id: string;
  invoice_date: string;
  due_date: string;
  items: Array<{ description: string; quantity: number; unit_price: number }>;
}): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Check client
  if (!data.client_id || data.client_id.trim() === '') {
    errors.push('Client is required');
  }

  // Check dates
  const invoiceDate = new Date(data.invoice_date);
  const dueDate = new Date(data.due_date);

  if (dueDate < invoiceDate) {
    errors.push('Due date must be on or after invoice date');
  }

  // Check items
  if (!data.items || data.items.length === 0) {
    errors.push('At least one line item is required');
  } else {
    data.items.forEach((item, index) => {
      if (!item.description || item.description.trim() === '') {
        errors.push(`Line item ${index + 1}: Description is required`);
      }
      if (item.quantity <= 0) {
        errors.push(`Line item ${index + 1}: Quantity must be greater than 0`);
      }
      if (item.unit_price < 0) {
        errors.push(`Line item ${index + 1}: Unit price cannot be negative`);
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors
  };
};
