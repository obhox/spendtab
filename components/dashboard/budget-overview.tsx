"use client"

import { useEffect, useState } from "react"
import { Progress } from "@/components/ui/progress"
import { useBudgets } from "@/lib/context/BudgetContext"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

interface BudgetCategory {
  id: string
  name: string
  allocated: number
  spent: number
  color: string
}

// Colors for different categories
const categoryColors: Record<string, string> = {
  "Marketing": "bg-blue-600",
  "Operations": "bg-green-600",
  "Software": "bg-purple-600",
  "Equipment": "bg-amber-600",
  "Supplies": "bg-cyan-600",
  "Training": "bg-pink-600",
  "Travel": "bg-indigo-600",
  "Utilities": "bg-teal-600",
  "Other": "bg-slate-600"
};

export function BudgetOverview() {
  const { budgets, isLoading } = useBudgets()
  const [categories, setCategories] = useState<BudgetCategory[]>([]);
  const [totals, setTotals] = useState({ allocated: 0, spent: 0 });
  
  // Transform budget data into category summaries
  useEffect(() => {
    if (budgets.length > 0) {
      // Group budgets by category and sum up amounts
      const categoryMap = new Map<string, { allocated: number, spent: number }>();
      
      budgets.forEach(budget => {
        const category = budget.category;
        const existing = categoryMap.get(category) || { allocated: 0, spent: 0 };
        
        categoryMap.set(category, {
          allocated: existing.allocated + budget.amount,
          spent: existing.spent + budget.spent
        });
      });
      
      // Convert map to array
      const categoryArray = Array.from(categoryMap.entries()).map(([name, values], index) => ({
        id: index.toString(),
        name,
        allocated: values.allocated,
        spent: values.spent,
        color: categoryColors[name] || "bg-slate-600"
      }));
      
      // Sort by percentage of budget used (descending)
      categoryArray.sort((a, b) => 
        (b.spent / b.allocated) - (a.spent / a.allocated)
      );
      
      // Calculate totals
      const totalAllocated = categoryArray.reduce((sum, cat) => sum + cat.allocated, 0);
      const totalSpent = categoryArray.reduce((sum, cat) => sum + cat.spent, 0);
      
      setCategories(categoryArray.slice(0, 5)); // Show top 5 categories
      setTotals({ allocated: totalAllocated, spent: totalSpent });
    }
  }, [budgets]);

  if (isLoading) {
    return <div className="py-2 text-sm text-center">Loading budget data...</div>
  }

  if (categories.length === 0) {
    return (
      <div className="py-6 flex flex-col items-center justify-center text-center space-y-2">
        <p className="text-sm font-medium text-muted-foreground">No budget data available</p>
        <p className="text-xs text-muted-foreground mb-4">
          Set up budgets to track your spending against planned allocations
        </p>
        <Link href="/budgets">
          <Button size="sm" variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Create Budget
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {categories.map((category) => {
        const percentUsed = Math.round((category.spent / category.allocated) * 100);
        
        return (
          <div key={category.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">{category.name}</p>
                <p className="text-xs text-muted-foreground">${category.spent.toLocaleString()} of ${category.allocated.toLocaleString()}</p>
              </div>
              <p className={`text-sm font-medium ${
                percentUsed > 90 ? "text-red-600" : 
                percentUsed > 75 ? "text-amber-600" : 
                "text-green-600"
              }`}>
                {percentUsed}%
              </p>
            </div>
            <Progress 
              value={percentUsed} 
              className="h-2"
            />
          </div>
        )
      })}
      
      <div className="pt-2">
        <p className="text-xs text-center text-muted-foreground">
          Total Budget: ${totals.allocated.toLocaleString()} • 
          Spent: ${totals.spent.toLocaleString()} • 
          Remaining: ${(totals.allocated - totals.spent).toLocaleString()}
        </p>
      </div>
    </div>
  )
}
