import jsPDF from 'jspdf';
import { Currency } from '@/components/currency-switcher';

interface ExportOptions {
  type: 'profit-loss' | 'cash-flow' | 'expense';
  data: any;
  currency?: Currency;
}

const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

const formatProfitLossData = (data: any) => {
  const rows = [];
  
  // Add revenue items
  data.revenue.forEach((category: any) => {
    rows.push({
      type: 'Revenue',
      category: category.name,
      subcategory: '',
      amount: category.amount
    });
    
    category.subItems?.forEach((subItem: any) => {
      rows.push({
        type: 'Revenue',
        category: category.name,
        subcategory: subItem.name,
        amount: subItem.amount
      });
    });
  });
  
  // Add expense items
  data.expenses.forEach((category: any) => {
    rows.push({
      type: 'Expense',
      category: category.name,
      subcategory: '',
      amount: category.amount
    });
    
    category.subItems?.forEach((subItem: any) => {
      rows.push({
        type: 'Expense',
        category: category.name,
        subcategory: subItem.name,
        amount: subItem.amount
      });
    });
  });
  
  return rows;
};

const formatCashFlowData = (data: any) => {
  const rows = [];
  
  // Add cash inflows
  data.cashIn.forEach((category: any) => {
    rows.push({
      type: 'Cash In',
      category: category.name,
      subcategory: '',
      amount: category.amount
    });
    
    category.subItems?.forEach((subItem: any) => {
      rows.push({
        type: 'Cash In',
        category: category.name,
        subcategory: subItem.name,
        amount: subItem.amount
      });
    });
  });
  
  // Add cash outflows
  data.cashOut.forEach((category: any) => {
    rows.push({
      type: 'Cash Out',
      category: category.name,
      subcategory: '',
      amount: category.amount
    });
    
    category.subItems?.forEach((subItem: any) => {
      rows.push({
        type: 'Cash Out',
        category: category.name,
        subcategory: subItem.name,
        amount: subItem.amount
      });
    });
  });
  
  return rows;
};

const formatExpenseData = (data: any) => {
  return data.expenses.map((expense: any) => ({
    date: expense.date,
    category: expense.category,
    description: expense.description,
    amount: expense.amount,
    paymentMethod: expense.paymentMethod
  }));
};

const formatCurrencyValue = (value: number, currency?: Currency): string => {
  if (currency) {
    return new Intl.NumberFormat(currency.locale, {
      style: 'currency',
      currency: currency.code,
      minimumFractionDigits: 2
    }).format(value);
  }

  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2
  }).format(value);
};

export const exportReport = async ({ type, data, currency }: ExportOptions): Promise<void> => {
  try {
    let formattedData;
    let fileName = `${type}-report-${formatDate(new Date())}.pdf`;
    
    // Format data based on report type
    switch (type) {
      case 'profit-loss':
        formattedData = formatProfitLossData(data);
        break;
      case 'cash-flow':
        formattedData = formatCashFlowData(data);
        break;
      case 'expense':
        formattedData = formatExpenseData(data);
        break;
      default:
        throw new Error('Invalid report type');
    }

    // Create PDF document
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 10;
    
    // Add title
    doc.setFontSize(16);
    doc.text(`${type.toUpperCase()} REPORT`, pageWidth / 2, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Generated on: ${formatDate(new Date())}`, pageWidth / 2, 30, { align: 'center' });
    
    // Add table headers
    let yPos = 40;
    const headers = Object.keys(formattedData[0]);
    const columnWidth = (pageWidth - (margin * 2)) / headers.length;
    
    // Draw table header background
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, yPos - 5, pageWidth - (margin * 2), 8, 'F');
    
    // Add headers
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    headers.forEach((header, index) => {
      doc.text(
        header.toUpperCase(),
        margin + (columnWidth * index) + (columnWidth / 2),
        yPos,
        { align: 'center' }
      );
    });
    
    // Add table data
    doc.setFont('helvetica', 'normal');
    yPos += 10;
    
    formattedData.forEach((row: any) => {
      // Check if we need a new page
      if (yPos >= pageHeight - margin) {
        doc.addPage();
        yPos = margin + 10;
        
        // Redraw header on new page
        doc.setFillColor(240, 240, 240);
        doc.rect(margin, yPos - 5, pageWidth - (margin * 2), 8, 'F');
        doc.setFont('helvetica', 'bold');
        headers.forEach((header, index) => {
          doc.text(
            header.toUpperCase(),
            margin + (columnWidth * index) + (columnWidth / 2),
            yPos,
            { align: 'center' }
          );
        });
        doc.setFont('helvetica', 'normal');
        yPos += 10;
      }
      
      // Draw alternating row background
      if ((formattedData.indexOf(row) % 2) === 1) {
        doc.setFillColor(250, 250, 250);
        doc.rect(margin, yPos - 5, pageWidth - (margin * 2), 8, 'F');
      }
      
      // Add row data
      headers.forEach((header, index) => {
        let value = row[header]?.toString() || '';
        
        // Format amount values
        if (header === 'amount' && !isNaN(row[header])) {
          value = formatCurrencyValue(row[header], currency);
        }
        
        doc.text(
          value,
          margin + (columnWidth * index) + (columnWidth / 2),
          yPos,
          { align: 'center' }
        );
      });
      
      yPos += 8;
    });
    
    // Save PDF
    await new Promise((resolve, reject) => {
      try {
        doc.save(fileName);
        resolve(undefined);
      } catch (err) {
        reject(err);
      }
    });
  } catch (error) {
    console.error('Error exporting report:', error);
    throw error;
  }
};