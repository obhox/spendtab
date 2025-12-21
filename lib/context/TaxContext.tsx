'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useTaxQuery, TaxSettings } from '../hooks/useTaxQuery';
import { useTransactionQuery } from '../hooks/useTransactionQuery';
import { useInvoiceQuery } from '../hooks/useInvoiceQuery';

interface TaxContextType {
  taxSettings: TaxSettings | null | undefined;
  isLoading: boolean;
  updateSettings: (settings: Partial<TaxSettings>) => void;
  isUpdating: boolean;
  // Computed values
  turnoverYTD: number;
  taxableIncome: number;
  estimatedTax: number;
  taxLiability: {
    incomeTax: number;
    educationTax: number;
    itLevy: number;
    totalTax: number;
  };
  vatLiability: {
    vatCollected: number;
    vatPaid: number;
    netVatLiability: number;
  };
  isSmallBusinessQualified: boolean;
}

const TaxContext = createContext<TaxContextType | undefined>(undefined);

export function TaxProvider({ children }: { children: ReactNode }) {
  const { taxSettings, isLoading, updateSettings, isUpdating } = useTaxQuery();
  const { transactions } = useTransactionQuery();
  const { invoices } = useInvoiceQuery();

  // Simple calculation logic
  const currentYear = new Date().getFullYear();
  const yearTransactions = transactions.filter(t => new Date(t.date).getFullYear() === currentYear);
  
  const turnoverYTD = yearTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpenses = yearTransactions
    .filter(t => t.type === 'expense' && t.tax_deductible) // Only deductible expenses
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const taxableIncome = Math.max(0, turnoverYTD - totalExpenses);

  // Small Business Qualification (Finance Act 2023: < N50M)
  // Turnover <= 50M AND not professional service
  const isSmallBusinessQualified = 
    (taxSettings?.business_type === 'small_company' || taxSettings?.business_type === 'company') &&
    turnoverYTD <= 50000000 &&
    !taxSettings?.is_professional_service;

  // Tax Calculation
  let incomeTax = 0;
  let educationTax = 0;
  let itLevy = 0;

  if (taxSettings?.business_type === 'individual') {
    // Progressive Tax Bands (Simplified based on standard PAYE/PIT)
    // First 300k @ 7%
    // Next 300k @ 11%
    // Next 500k @ 15%
    // Next 500k @ 19%
    // Next 1.6M @ 21%
    // Above 3.2M @ 24%
    
    // CRA Calculation (Higher of 1% Gross or 200k + 20% of Gross Income)
    // Note: Gross Income for CRA usually implies Consolidated Salary. For business, it's less clear but often applied to Net Profit.
    // We will apply to Net Profit (taxableIncome) as "Gross Income" for the individual business owner.
    
    const baseForCRA = taxableIncome;
    const cra = Math.max(baseForCRA * 0.01, 200000 + (baseForCRA * 0.20));
    
    // Chargeable Income
    let chargeableIncome = Math.max(0, baseForCRA - cra);
    
    // Band 1: First 300k @ 7%
    const band1 = Math.min(chargeableIncome, 300000);
    incomeTax += band1 * 0.07;
    chargeableIncome -= band1;
    
    // Band 2: Next 300k @ 11%
    const band2 = Math.min(chargeableIncome, 300000);
    incomeTax += band2 * 0.11;
    chargeableIncome -= band2;

    // Band 3: Next 500k @ 15%
    const band3 = Math.min(chargeableIncome, 500000);
    incomeTax += band3 * 0.15;
    chargeableIncome -= band3;

    // Band 4: Next 500k @ 19%
    const band4 = Math.min(chargeableIncome, 500000);
    incomeTax += band4 * 0.19;
    chargeableIncome -= band4;

    // Band 5: Next 1.6M @ 21%
    const band5 = Math.min(chargeableIncome, 1600000);
    incomeTax += band5 * 0.21;
    chargeableIncome -= band5;

    // Band 6: Above 3.2M @ 24%
    incomeTax += chargeableIncome * 0.24;

  } else if (taxSettings?.business_type === 'small_company' || taxSettings?.business_type === 'company') {
    if (isSmallBusinessQualified) {
      incomeTax = 0;
    } else if (turnoverYTD <= 100000000) {
       // Medium Company (50M - 100M): 20%
       incomeTax = taxableIncome * 0.20;
    } else {
       // Large Company (> 100M): 30%
       incomeTax = taxableIncome * 0.30;
    }

    // Tertiary Education Tax (2.5% or 3% of Assessable Profit) - Let's use 3% for 2025
    if (!isSmallBusinessQualified) {
        educationTax = taxableIncome * 0.03;
    }
    
    // IT Levy (1% of PBT for turnover > 100M)
    // Only for specific sectors (Banking, Insurance, GSM, etc.) - Simplified here to check turnover only
    if (turnoverYTD > 100000000) {
        itLevy = taxableIncome * 0.01;
    }
  }

  const totalTax = incomeTax + educationTax + itLevy;

  // VAT Calculation
  // Calculate VAT collected from paid invoices
  const currentYearInvoices = invoices.filter(inv =>
    inv.status === 'paid' &&
    inv.paid_date &&
    new Date(inv.paid_date).getFullYear() === currentYear
  );

  const vatCollected = currentYearInvoices.reduce((sum, inv) => {
    return sum + Number(inv.tax_amount || 0);
  }, 0);

  // VAT paid on expenses (if tracked in transaction notes/description)
  // For now, we'll set this to 0, but you can expand this later
  const vatPaid = 0;

  const netVatLiability = vatCollected - vatPaid;

  return (
    <TaxContext.Provider value={{
      taxSettings,
      isLoading,
      updateSettings,
      isUpdating,
      turnoverYTD,
      taxableIncome,
      estimatedTax: totalTax,
      taxLiability: {
        incomeTax,
        educationTax,
        itLevy,
        totalTax
      },
      vatLiability: {
        vatCollected,
        vatPaid,
        netVatLiability
      },
      isSmallBusinessQualified
    }}>
      {children}
    </TaxContext.Provider>
  );
}

export function useTax() {
  const context = useContext(TaxContext);
  if (context === undefined) {
    throw new Error('useTax must be used within a TaxProvider');
  }
  return context;
}
