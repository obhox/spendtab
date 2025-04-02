"use client"

import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { useBudgetQuery } from "@/lib/hooks/useBudgetQuery"

interface Budget {
  id: string
  name: string
  amount: number
  spent: number
  period?: string
  startDate?: string
  endDate?: string
}

export function BudgetOverview() {
  const { budgets = [], isLoading } = useBudgetQuery()

  // Helper to safely get spent amount
  const getSpentAmount = (budget: Budget): number => {
    // Ensure spent is a number, default to 0 if null, undefined, or NaN
    const spentValue = budget.spent;
    return typeof spentValue === 'number' && !isNaN(spentValue) ? spentValue : 0;
  }

  // Helper to calculate percentage
  const calculatePercentage = (spent: number, amount: number): number => {
    // Ensure amount is a positive number for calculation
    if (typeof amount !== 'number' || isNaN(amount) || amount <= 0) {
        return 0;
    }
    // Ensure spent is a number
    if (typeof spent !== 'number' || isNaN(spent)) {
        spent = 0; // Treat NaN spent as 0
    }
    // Calculate percentage and clamp between 0 and potentially over 100
    const percentage = Math.round((spent / amount) * 100);
    return Math.max(0, percentage); // Ensure it's at least 0
  }

  // Helper for currency formatting
  const formatCurrency = (value: number): string => {
    // Ensure value is a number before formatting
    if (typeof value !== 'number' || isNaN(value)) {
        value = 0;
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value)
  }

  // Calculate totals using reduce
  const totals = budgets.reduce(
    (acc, budget) => {
      // Ensure budget.amount is a valid number, default to 0 if not
      const amount = typeof budget.amount === 'number' && !isNaN(budget.amount) ? budget.amount : 0;
      const spent = getSpentAmount(budget); // Use validated spent amount
      return {
        allocated: acc.allocated + amount,
        spent: acc.spent + spent
      };
    },
    { allocated: 0, spent: 0 }
  )

  // --- Responsive Loading State ---
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[150px] sm:h-[180px] md:h-[200px] bg-muted/5 rounded-lg border border-dashed">
        <div className="flex flex-col items-center space-y-2">
          {/* Use theme color for spinner */}
          <div className="h-6 w-6 sm:h-8 sm:w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-xs sm:text-sm text-muted-foreground">Loading budget data...</p>
        </div>
      </div>
    )
  }

  // --- Responsive Empty State ---
  if (budgets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center h-[150px] sm:h-[180px] md:h-[200px] bg-muted/5 rounded-lg border border-dashed p-4 space-y-2">
        <p className="text-sm sm:text-base font-medium text-muted-foreground">No budget data available</p>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-xs sm:max-w-sm md:max-w-md">
          Set up budgets to track your spending against planned allocations.
        </p>
        <Link href="/budgets" className="mt-4">
          <Button size="sm" variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Create Budget
          </Button>
        </Link>
      </div>
    )
  }

  // --- Responsive Budget List & Totals ---
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Limit displayed budgets if needed, e.g., slice(0, 5) */}
      {budgets.slice(0, 5).map((budget) => {
        const amount = typeof budget.amount === 'number' && !isNaN(budget.amount) ? budget.amount : 0; // Validated amount
        const spent = getSpentAmount(budget); // Validated spent
        const percentUsed = calculatePercentage(spent, amount); // Uses validated inputs

        // Determine color classes based on percentage
        const getStatusColorClasses = () => {
          // Define colors for the TEXT and TRACK BACKGROUND
          if (percentUsed > 100) return { text: "text-red-600", bg: "bg-red-100 dark:bg-red-900/30" }; // Overspent
          // Use theme's destructive color for text and a light version for background when > 90%
          if (percentUsed > 90) return { text: "text-destructive", bg: "bg-destructive/10" };
          if (percentUsed > 75) return { text: "text-amber-600", bg: "bg-amber-100 dark:bg-amber-900/30" }; // Amber
          return { text: "text-green-600", bg: "bg-green-100 dark:bg-green-900/30" }; // Default/Green
        };
        const statusColors = getStatusColorClasses();

        return (
          <div key={budget.id} className="space-y-2">
            {/* Added gap-4 for spacing, items-start for alignment if text wraps */}
            <div className="flex items-start sm:items-center justify-between gap-4">
              <div className="space-y-0.5 overflow-hidden min-w-0"> {/* Added min-w-0 for better truncation */}
                <p className="text-sm sm:text-base font-medium truncate" title={budget.name}> {/* Added truncate and title */}
                  {budget.name || "Unnamed Budget"} {/* Fallback name */}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {formatCurrency(spent)} of {formatCurrency(amount)}
                </p>
              </div>
              {/* Added shrink-0 to prevent percentage wrapping */}
              <p className={`text-sm sm:text-base font-semibold shrink-0 ${statusColors.text}`}>
                {percentUsed}%
              </p>
            </div>
            {/* ================================================== */}
            {/* THE CHANGE IS HERE: indicatorClassName is removed */}
            {/* Apply background color to the Progress track (container). */}
            {/* The indicator inside will use the default theme color (usually primary). */}
            <Progress
              value={Math.min(percentUsed, 100)} // Cap visual progress bar fill at 100%
              className={`h-2 rounded ${statusColors.bg}`} // Apply track background color class
              // NO indicatorClassName prop here anymore!
            />
            {/* ================================================== */}
          </div>
        )
      })}

      {/* Separator and Totals Section - Only show if budgets exist */}
      {budgets.length > 0 && (
        <div className="pt-4 sm:pt-6 border-t border-border/50">
          {/* Kept grid-cols-3, adjusted gap and text size */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
            {/* Responsive text size */}
            <div className="text-xs sm:text-sm">
              {/* Use foreground/medium for label clarity */}
              <p className="text-muted-foreground mb-0.5">Total Budget</p>
              <p className="font-medium text-foreground">{formatCurrency(totals.allocated)}</p>
            </div>
            <div className="text-xs sm:text-sm">
              <p className="text-muted-foreground mb-0.5">Total Spent</p>
              <p className="font-medium text-foreground">{formatCurrency(totals.spent)}</p>
            </div>
            <div className="text-xs sm:text-sm">
              <p className="text-muted-foreground mb-0.5">Remaining</p>
              {/* Color remaining amount red if negative */}
              <p className={`font-medium ${totals.allocated - totals.spent < 0 ? 'text-destructive' : 'text-foreground'}`}>
                {formatCurrency(totals.allocated - totals.spent)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
