"use client"

import { useState, useEffect } from "react"
import { Globe } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Common currencies with their symbols and codes
const currencies = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "CHF", symbol: "Fr", name: "Swiss Franc" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "KRW", symbol: "₩", name: "South Korean Won" },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar" },
  { code: "HKD", symbol: "HK$", name: "Hong Kong Dollar" },
  { code: "NOK", symbol: "kr", name: "Norwegian Krone" },
  { code: "SEK", symbol: "kr", name: "Swedish Krona" },
  { code: "DKK", symbol: "kr", name: "Danish Krone" },
  { code: "PLN", symbol: "zł", name: "Polish Zloty" },
  { code: "RUB", symbol: "₽", name: "Russian Ruble" },
  { code: "BRL", symbol: "R$", name: "Brazilian Real" },
  { code: "MXN", symbol: "$", name: "Mexican Peso" },
  { code: "ZAR", symbol: "R", name: "South African Rand" },
  { code: "TRY", symbol: "₺", name: "Turkish Lira" },
  { code: "NZD", symbol: "NZ$", name: "New Zealand Dollar" },
  { code: "THB", symbol: "฿", name: "Thai Baht" },
  { code: "MYR", symbol: "RM", name: "Malaysian Ringgit" },
  { code: "IDR", symbol: "Rp", name: "Indonesian Rupiah" },
  { code: "PHP", symbol: "₱", name: "Philippine Peso" },
  { code: "VND", symbol: "₫", name: "Vietnamese Dong" },
  { code: "NGN", symbol: "₦", name: "Nigerian Naira" },


]

export function CurrencySwitcher() {
  const [selectedCurrency, setSelectedCurrency] = useState("USD")

  // Load saved currency from localStorage on component mount
  useEffect(() => {
    const savedCurrency = localStorage.getItem("selectedCurrency")
    if (savedCurrency && currencies.find(c => c.code === savedCurrency)) {
      setSelectedCurrency(savedCurrency)
    }
  }, [])

  // Save currency to localStorage when changed
  const handleCurrencyChange = (currencyCode: string) => {
    setSelectedCurrency(currencyCode)
    localStorage.setItem("selectedCurrency", currencyCode)
    
    // Dispatch a custom event to notify other components of currency change
    window.dispatchEvent(new CustomEvent("currencyChanged", { 
      detail: { 
        code: currencyCode, 
        symbol: currencies.find(c => c.code === currencyCode)?.symbol || "$" 
      } 
    }))
  }

  const currentCurrency = currencies.find(c => c.code === selectedCurrency)

  return (
    <Select value={selectedCurrency} onValueChange={handleCurrencyChange}>
      <SelectTrigger className="w-full sm:w-[140px] h-9">
        <Globe className="mr-2 h-4 w-4 opacity-70" />
        <SelectValue>
          <span className="font-medium">{currentCurrency?.symbol} {currentCurrency?.code}</span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="max-h-[300px]">
        {currencies.map((currency) => (
          <SelectItem key={currency.code} value={currency.code}>
            <div className="flex items-center gap-2">
              <span className="font-medium">{currency.symbol}</span>
              <span>{currency.code}</span>
              <span className="text-muted-foreground text-sm">- {currency.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

// Hook to use the selected currency in other components
export function useSelectedCurrency() {
  const [currency, setCurrency] = useState({ code: "USD", symbol: "$" })

  useEffect(() => {
    // Get initial currency from localStorage
    const savedCurrency = localStorage.getItem("selectedCurrency") || "USD"
    const currencyData = currencies.find(c => c.code === savedCurrency)
    if (currencyData) {
      setCurrency({ code: currencyData.code, symbol: currencyData.symbol })
    }

    // Listen for currency changes
    const handleCurrencyChange = (event: CustomEvent) => {
      setCurrency(event.detail)
    }

    window.addEventListener("currencyChanged", handleCurrencyChange as EventListener)
    
    return () => {
      window.removeEventListener("currencyChanged", handleCurrencyChange as EventListener)
    }
  }, [])

  return currency
}

// Utility function to format currency
export function formatCurrency(amount: number, currencyCode?: string, currencySymbol?: string): string {
  const code = currencyCode || "USD"
  const symbol = currencySymbol || "$"
  
  // For display purposes, we'll just use the symbol since we're not doing actual conversion
  return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}