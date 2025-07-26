"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Globe } from "lucide-react"

// Currency configuration interface
export interface Currency {
  code: string
  symbol: string
  name: string
  locale: string
}

// Top currencies + Nigerian Naira + Indian Rupees
export const SUPPORTED_CURRENCIES: Currency[] = [
  {
    code: "USD",
    symbol: "$",
    name: "US Dollar",
    locale: "en-US"
  },
  {
    code: "EUR",
    symbol: "€",
    name: "Euro",
    locale: "de-DE"
  },
  {
    code: "GBP",
    symbol: "£",
    name: "British Pound",
    locale: "en-GB"
  },
  {
    code: "INR",
    symbol: "₹",
    name: "Indian Rupee",
    locale: "en-IN"
  },
  {
    code: "NGN",
    symbol: "₦",
    name: "Nigerian Naira",
    locale: "en-NG"
  }
]

// Currency context
interface CurrencyContextType {
  selectedCurrency: Currency
  setSelectedCurrency: (currency: Currency) => void
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

// Currency provider component
export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(SUPPORTED_CURRENCIES[0]) // Default to USD

  // Load saved currency from localStorage on mount
  useEffect(() => {
    const savedCurrency = localStorage.getItem('selectedCurrency')
    if (savedCurrency) {
      try {
        const currency = JSON.parse(savedCurrency)
        const validCurrency = SUPPORTED_CURRENCIES.find(c => c.code === currency.code)
        if (validCurrency) {
          setSelectedCurrency(validCurrency)
        }
      } catch (error) {
        console.error('Error loading saved currency:', error)
      }
    }
  }, [])

  // Save currency to localStorage when it changes
  const handleSetSelectedCurrency = (currency: Currency) => {
    setSelectedCurrency(currency)
    localStorage.setItem('selectedCurrency', JSON.stringify(currency))
  }

  return (
    <CurrencyContext.Provider value={{ selectedCurrency, setSelectedCurrency: handleSetSelectedCurrency }}>
      {children}
    </CurrencyContext.Provider>
  )
}

// Hook to use currency context
export function useSelectedCurrency() {
  const context = useContext(CurrencyContext)
  if (context === undefined) {
    throw new Error('useSelectedCurrency must be used within a CurrencyProvider')
  }
  return context.selectedCurrency
}

// Hook to use currency setter
export function useCurrencyActions() {
  const context = useContext(CurrencyContext)
  if (context === undefined) {
    throw new Error('useCurrencyActions must be used within a CurrencyProvider')
  }
  return { setSelectedCurrency: context.setSelectedCurrency }
}

// Currency switcher UI component
export function CurrencySwitcher() {
  const selectedCurrency = useSelectedCurrency()
  const { setSelectedCurrency } = useCurrencyActions()

  return (
    <div className="flex items-center space-x-2">
      <Globe className="h-4 w-4 text-muted-foreground" />
      <Select
        value={selectedCurrency.code}
        onValueChange={(value) => {
          const currency = SUPPORTED_CURRENCIES.find(c => c.code === value)
          if (currency) {
            setSelectedCurrency(currency)
          }
        }}
      >
        <SelectTrigger className="w-[140px] h-8">
          <SelectValue>
            <span className="flex items-center space-x-1">
              <span>{selectedCurrency.symbol}</span>
              <span>{selectedCurrency.code}</span>
            </span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {SUPPORTED_CURRENCIES.map((currency) => (
            <SelectItem key={currency.code} value={currency.code}>
              <div className="flex items-center space-x-2">
                <span className="font-medium">{currency.symbol}</span>
                <span>{currency.code}</span>
                <span className="text-muted-foreground">- {currency.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

// Utility function to format currency
export function formatCurrency(amount: number, currencyCode?: string, currencySymbol?: string): string {
  // If specific currency code is provided, use it
  if (currencyCode) {
    const currency = SUPPORTED_CURRENCIES.find(c => c.code === currencyCode)
    if (currency) {
      return new Intl.NumberFormat(currency.locale, {
        style: 'currency',
        currency: currency.code,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount)
    }
  }

  // Fallback to USD formatting if no context available
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

// Enhanced utility function that uses the selected currency from context
export function formatCurrencyWithContext(amount: number): string {
  // This function should be used within components that have access to the currency context
  // For components that can't use hooks, use the formatCurrency function above
  return formatCurrency(amount)
}

// Hook to format currency with the current selected currency
export function useFormatCurrency() {
  const selectedCurrency = useSelectedCurrency()
  
  return (amount: number) => {
    return new Intl.NumberFormat(selectedCurrency.locale, {
      style: 'currency',
      currency: selectedCurrency.code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }
}

// Hook to determine if tax features should be shown (only for USD)
export function useTaxFeaturesVisible() {
  const selectedCurrency = useSelectedCurrency()
  return selectedCurrency.code === 'USD'
}