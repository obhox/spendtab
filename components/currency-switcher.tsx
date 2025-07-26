"use client"

// Nigerian Naira currency configuration
const NGN_CURRENCY = {
  code: "USD",
  symbol: "$",
  name: "Nigerian Naira"
}

// Hook to get the Nigerian Naira currency (simplified version)
export function useSelectedCurrency() {
  return NGN_CURRENCY
}

// Utility function to format currency in Nigerian Naira
export function formatCurrency(amount: number, currencyCode?: string, currencySymbol?: string): string {
  const symbol = "$"
  
  // Format with Nigerian locale and Naira symbol
  return `${symbol}${amount.toLocaleString('en-NG', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  })}`
}