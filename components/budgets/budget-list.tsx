"use client"

import { useState, useEffect } from "react"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Edit, MoreHorizontal, Trash2, Plus } from 'lucide-react'
import { BudgetForm } from "./budget-form"
import { useToast } from "@/hooks/use-toast"
import { useBudgets } from "@/lib/context/BudgetContext"


interface Budget {
  id: string
  name: string
  amount: number
  spent?: number
  startDate: string
  endDate: string
}

export function BudgetList() {
  const { budgets, deleteBudget, isLoading: isLoadingBudgets } = useBudgets()
  
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null)
  const { toast } = useToast()

  // Calculate percentage spent
  const calculatePercentage = (spent: number, total: number): number => {
    return Math.round((spent / total) * 100)
  }

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  // Format date
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Handle delete
  const handleDelete = async () => {
    if (selectedBudget) {
      await deleteBudget(selectedBudget.id)
      
      toast({
        title: "Budget deleted",
        description: `${selectedBudget.name} has been deleted.`,
        variant: "default"
      })
      
      setIsDeleteDialogOpen(false)
      setSelectedBudget(null)
    }
  }
  // Get progress bar color based on percentage
  const getProgressColor = (percentage: number): string => {
    if (percentage > 100) return "bg-red-500"
    if (percentage < 50) return "bg-green-500"
    if (percentage < 75) return "bg-yellow-500"
    return "bg-red-500"
  }
  if (isLoadingBudgets) {
    return <div className="flex justify-center items-center py-8">Loading budgets...</div>;
  }

  if (budgets.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        <div className="flex flex-col items-center justify-center space-y-3">
          <p>No budgets found</p>
          <p className="text-sm">Create your first budget to start tracking your spending</p>
          <BudgetForm>
            <Button size="sm" variant="outline" className="mt-2">
              <Plus className="mr-2 h-4 w-4" />
              Create Budget
            </Button>
          </BudgetForm>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[250px]">Name</TableHead>
            <TableHead>Period</TableHead>
            <TableHead className="text-right">Budget</TableHead>
            <TableHead className="text-right">Spent</TableHead>
            <TableHead>Progress</TableHead>
            <TableHead className="w-[70px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {budgets.map((budget) => {
            const spent = budget.spent || 0
            const percentage = calculatePercentage(spent, budget.amount)
            return (
              <TableRow key={budget.id}>
                <TableCell className="font-medium">{budget.name}</TableCell>
                <TableCell>{formatDate(budget.startDate)} - {formatDate(budget.endDate)}</TableCell>
                <TableCell className="text-right">{formatCurrency(budget.amount)}</TableCell>
                <TableCell className="text-right">{formatCurrency(spent)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Progress value={percentage} className={getProgressColor(percentage)} />
                    <span className={`text-xs w-10 ${percentage > 100 ? 'text-red-500' : ''}`}>{percentage}%</span>
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <BudgetForm budget={budget}>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                      </BudgetForm>
                      <DropdownMenuItem 
                        onClick={() => {
                          setSelectedBudget(budget)
                          setIsDeleteDialogOpen(true)
                        }}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the budget
              from your records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
