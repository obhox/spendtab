'use client'

import { useState } from 'react'
import { MoreHorizontal, Edit, Trash2, AlertTriangle, Calendar } from 'lucide-react'
import { format } from 'date-fns'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { useLiabilities, type Liability } from '@/lib/context/LiabilityContext'
import { LiabilityForm } from './liability-form'
import { toast } from 'sonner'
import { useFormatCurrency } from '@/components/currency-switcher'

const getLiabilityTypeColor = (type: string) => {
  switch (type) {
    case 'current':
      return 'bg-orange-100 text-orange-800'
    case 'long_term':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getLiabilityTypeLabel = (type: string) => {
  switch (type) {
    case 'current':
      return 'Current'
    case 'long_term':
      return 'Long-term'
    default:
      return type
  }
}

const isOverdue = (dueDate?: string) => {
  if (!dueDate) return false
  return new Date(dueDate) < new Date()
}

const isDueSoon = (dueDate?: string) => {
  if (!dueDate) return false
  const due = new Date(dueDate)
  const today = new Date()
  const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
  return due >= today && due <= thirtyDaysFromNow
}

interface LiabilityTableProps {
  searchTerm: string
  filterType?: 'current' | 'long_term' | 'alerts'
}

export function LiabilityTable({ searchTerm, filterType }: LiabilityTableProps) {
  const { liabilities, deleteLiability, isLoading } = useLiabilities()
  const formatCurrency = useFormatCurrency()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [liabilityToDelete, setLiabilityToDelete] = useState<Liability | null>(null)

  // Filter liabilities based on search term and type
  const filteredLiabilities = liabilities.filter(liability => {
    const matchesSearch = liability.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      liability.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      liability.description?.toLowerCase().includes(searchTerm.toLowerCase())
    
    let matchesType = true
    if (filterType === 'current' || filterType === 'long_term') {
      matchesType = liability.liability_type === filterType
    } else if (filterType === 'alerts') {
      matchesType = isOverdue(liability.due_date) || isDueSoon(liability.due_date)
    }
    
    return matchesSearch && matchesType
  })

  const handleDeleteLiability = async () => {
    if (!liabilityToDelete) return

    try {
      await deleteLiability(liabilityToDelete.id)
      toast.success('Liability deleted successfully')
      setDeleteDialogOpen(false)
      setLiabilityToDelete(null)
    } catch (error) {
      toast.error('Failed to delete liability')
      console.error('Error deleting liability:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-muted animate-pulse rounded" />
        ))}
      </div>
    )
  }

  if (filteredLiabilities.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          {searchTerm ? 'No liabilities found matching your search.' : 'No liabilities found. Add your first liability to get started.'}
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[150px]">Liability Name</TableHead>
              <TableHead className="min-w-[120px]">Category</TableHead>
              <TableHead className="min-w-[100px] hidden sm:table-cell">Type</TableHead>
              <TableHead className="text-right min-w-[120px]">Current Balance</TableHead>
              <TableHead className="text-right min-w-[100px] hidden md:table-cell">Interest Rate</TableHead>
              <TableHead className="text-right min-w-[120px] hidden lg:table-cell">Min. Payment</TableHead>
              <TableHead className="min-w-[120px] hidden lg:table-cell">Due Date</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLiabilities.map((liability) => {
              const overdue = isOverdue(liability.due_date)
              const dueSoon = isDueSoon(liability.due_date)
              
              return (
                <TableRow key={liability.id}>
                  <TableCell className="min-w-[150px]">
                    <div>
                      <div className="font-medium flex items-center">
                        {liability.name}
                        {overdue && (
                          <AlertTriangle className="h-4 w-4 text-red-500 ml-2" />
                        )}
                        {dueSoon && !overdue && (
                          <Calendar className="h-4 w-4 text-orange-500 ml-2" />
                        )}
                      </div>
                      {liability.description && (
                        <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                          {liability.description}
                        </div>
                      )}
                      {/* Show type on mobile */}
                      <div className="sm:hidden mt-1">
                        <Badge className={getLiabilityTypeColor(liability.liability_type)}>
                          {getLiabilityTypeLabel(liability.liability_type)}
                        </Badge>
                      </div>
                      {/* Show due date on mobile */}
                      <div className="lg:hidden mt-1">
                        {liability.due_date && (
                          <div className={`text-xs ${overdue ? 'text-red-600' : dueSoon ? 'text-orange-600' : 'text-muted-foreground'}`}>
                            Due: {format(new Date(liability.due_date), 'MMM d, yyyy')}
                            {overdue && <span className="ml-1">(Overdue)</span>}
                            {dueSoon && !overdue && <span className="ml-1">(Due soon)</span>}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="min-w-[120px]">{liability.category}</TableCell>
                  <TableCell className="min-w-[100px] hidden sm:table-cell">
                    <Badge className={getLiabilityTypeColor(liability.liability_type)}>
                      {getLiabilityTypeLabel(liability.liability_type)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium min-w-[120px]">
                    <div>
                      {formatCurrency(liability.current_balance)}
                      {/* Show interest rate and min payment on mobile */}
                      <div className="md:hidden text-xs text-muted-foreground mt-1">
                        {liability.interest_rate && <div>Rate: {liability.interest_rate.toFixed(2)}%</div>}
                        {liability.minimum_payment && <div>Min: {formatCurrency(liability.minimum_payment)}</div>}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right min-w-[100px] hidden md:table-cell">
                    {liability.interest_rate ? `${liability.interest_rate.toFixed(2)}%` : '-'}
                  </TableCell>
                  <TableCell className="text-right min-w-[120px] hidden lg:table-cell">
                    {liability.minimum_payment ? formatCurrency(liability.minimum_payment) : '-'}
                  </TableCell>
                  <TableCell className="min-w-[120px] hidden lg:table-cell">
                    {liability.due_date ? (
                      <div className={`${overdue ? 'text-red-600' : dueSoon ? 'text-orange-600' : ''}`}>
                        {format(new Date(liability.due_date), 'MMM d, yyyy')}
                        {overdue && (
                          <div className="text-xs text-red-600">Overdue</div>
                        )}
                        {dueSoon && !overdue && (
                          <div className="text-xs text-orange-600">Due soon</div>
                        )}
                      </div>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <LiabilityForm liability={liability}>
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                        </LiabilityForm>
                        <DropdownMenuItem
                          className="text-red-600"
                          onSelect={() => {
                            setLiabilityToDelete(liability)
                            setDeleteDialogOpen(true)
                          }}
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
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Liability</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{liabilityToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteLiability}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}