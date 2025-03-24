"use client"

import { createContext, ReactNode, useContext, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "../supabase"
import { useAccounts } from './AccountContext'
import { toast } from "sonner"

// Category data interface
export interface Category {
  id: string
  name: string
  type: "income" | "expense"
  icon?: string
  color?: string
  is_default: boolean
  account_id: string
}

// Context interface
interface CategoryContextType {
  categories: Category[]
  incomeCategories: Category[]
  expenseCategories: Category[]
  addCategory: (category: Omit<Category, "id" | "is_default" | "account_id">) => Promise<void>
  updateCategory: (id: string, category: Omit<Category, "id" | "is_default" | "account_id">) => Promise<void>
  deleteCategory: (id: string) => Promise<void>
  isLoading: boolean
  error: string | null
  errorDetails?: Error | null
}

// Create the context with a default value
const CategoryContext = createContext<CategoryContextType | undefined>(undefined)

// Cache time constants
const CACHE_TIME = 30 * 60 * 1000 // 30 minutes
const STALE_TIME = 5 * 60 * 1000 // 5 minutes

// Provider component
export function CategoryProvider({ children }: { children: ReactNode }) {
  const { currentAccount, isAccountSwitching } = useAccounts()
  const queryClient = useQueryClient()
  const [error, setError] = useState<string | null>(null)
  const [errorDetails, setErrorDetails] = useState<Error | null>(null)

  // Fetch categories query
  const { data: categories = [], isLoading, error: queryError } = useQuery<Category[], Error>({
    queryKey: ['categories', currentAccount?.id],
    queryFn: async () => {
      if (!currentAccount || isAccountSwitching) {
        return []
      }

      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('account_id', currentAccount.id)
        .order('name', { ascending: true })

      if (error) {
        const errorMessage = error.message || 'Failed to fetch categories'
        setError(errorMessage)
        setErrorDetails(error)
        // toast(errorMessage)
        return []
      }

      return data?.map(item => ({
        id: item.id,
        name: item.name,
        type: item.type,
        icon: item.icon || undefined,
        color: item.color || undefined,
        is_default: item.is_default,
        account_id: item.account_id
      })) || []
    },
    enabled: !!currentAccount && !isAccountSwitching,
    gcTime: CACHE_TIME,
    staleTime: STALE_TIME,
    refetchInterval: 30000 // Refetch every 30 seconds
  })

  // Calculate derived categories
  const incomeCategories = categories.filter(cat => cat.type === 'income')
  const expenseCategories = categories.filter(cat => cat.type === 'expense')

  const addCategoryMutation = useMutation({
    mutationFn: async (category: Omit<Category, "id" | "is_default" | "account_id">) => {
      if (!currentAccount) throw new Error('No account selected')

      const { data, error } = await supabase
        .from('categories')
        .insert({
          ...category,
          account_id: currentAccount.id,
          is_default: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        const errorMessage = error.message || 'Failed to fetch categories'
        setError(errorMessage)
        setErrorDetails(error)
        // toast(errorMessage)
        return []
      }

      return data
    },
    onMutate: async (newCategory) => {
      await queryClient.cancelQueries({ queryKey: ['categories', currentAccount?.id] })
      const previousCategories = queryClient.getQueryData<Category[]>(['categories', currentAccount?.id])

      const optimisticCategory = {
        ...newCategory,
        id: `temp-${Date.now()}`,
        is_default: false,
        account_id: currentAccount?.id || ''
      }

      queryClient.setQueryData<Category[]>(['categories', currentAccount?.id], old => [
        ...(old || []),
        optimisticCategory
      ])

      return { previousCategories }
    },
    onError: (error: Error, _, context: any) => {
      queryClient.setQueryData(['categories', currentAccount?.id], context.previousCategories)
      // toast(error.message || 'Failed to add category')
    },
    onSuccess: (newCategory) => {
      queryClient.setQueryData<Category[]>(['categories', currentAccount?.id], old => {
        return (old || []).map(cat => cat.id.startsWith('temp-') ? newCategory : cat)
      })
      // toast('Category added successfully')
    }
  })

  const updateCategoryMutation = useMutation<Category, Error, { id: string } & Omit<Category, "id" | "is_default" | "account_id">>({    
    mutationFn: async ({ id, ...category }) => {
      if (!currentAccount) throw new Error('No account selected')

      const categoryToUpdate = categories.find(cat => cat.id === id)
      if (!categoryToUpdate) throw new Error('Category not found')

      const { error } = await supabase
        .from('categories')
        .update({
          ...category,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('account_id', currentAccount.id)

      if (error) {
        const errorMessage = error.message || 'Failed to update category'
        setError(errorMessage)
        setErrorDetails(error)
        // toast(errorMessage)
        throw error
      }

      return {
        ...category,
        id,
        is_default: categoryToUpdate.is_default,
        account_id: currentAccount.id
      }
    },
    onMutate: async ({ id, ...newCategory }) => {
      await queryClient.cancelQueries({ queryKey: ['categories', currentAccount?.id] })
      const previousCategories = queryClient.getQueryData<Category[]>(['categories', currentAccount?.id])

      queryClient.setQueryData<Category[]>(['categories', currentAccount?.id], old => {
        return (old || []).map(category =>
          category.id === id
            ? { ...category, ...newCategory }
            : category
        )
      })

      return { previousCategories }
    },
    onError: (error: Error, _, context: any) => {
      queryClient.setQueryData(['categories', currentAccount?.id], context.previousCategories)
      // toast(error.message || 'Failed to update category')
    },
    onSuccess: (updatedCategory: Category) => {
      queryClient.setQueryData<Category[]>(['categories', currentAccount?.id], (old): Category[] => {
        const categories = old || []
        return categories.map(cat => cat.id === updatedCategory.id ? { ...cat, ...updatedCategory, is_default: cat.is_default, account_id: cat.account_id } : cat)
      })
      // toast('Category updated successfully')
    }
  })

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!currentAccount) throw new Error('No account selected')

      const categoryToDelete = categories.find(cat => cat.id === id)
      if (!categoryToDelete) throw new Error('Category not found')
      if (categoryToDelete.is_default) throw new Error('Cannot delete default categories')

      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)
        .eq('account_id', currentAccount.id)

      if (error) {
        const errorMessage = error.message || 'Failed to fetch categories'
        setError(errorMessage)
        setErrorDetails(error)
        // toast(errorMessage)
        return []
      }

      return id
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['categories', currentAccount?.id] })
      const previousCategories = queryClient.getQueryData<Category[]>(['categories', currentAccount?.id])

      queryClient.setQueryData<Category[]>(['categories', currentAccount?.id], old => {
        return (old || []).filter(category => category.id !== id)
      })

      return { previousCategories }
    },
    onError: (error: Error, _, context: any) => {
      queryClient.setQueryData(['categories', currentAccount?.id], context.previousCategories)
      // toast(error.message || 'Failed to delete category')
    },
    onSuccess: (deletedId) => {
      queryClient.setQueryData<Category[]>(['categories', currentAccount?.id], old => {
        return (old || []).filter(cat => cat.id !== deletedId)
      })
      // toast('Category deleted successfully')
    }
  })

  const addCategory = async (category: Omit<Category, "id" | "is_default" | "account_id">) => {
    await addCategoryMutation.mutateAsync(category)
  }

  const updateCategory = async (id: string, category: Omit<Category, "id" | "is_default" | "account_id">) => {
    await updateCategoryMutation.mutateAsync({ id, ...category })
  }

  const deleteCategory = async (id: string) => {
    await deleteCategoryMutation.mutateAsync(id)
  }

  return (
    <CategoryContext.Provider
      value={{
        categories,
        incomeCategories,
        expenseCategories,
        addCategory,
        updateCategory,
        deleteCategory,
        isLoading,
        error: error || queryError?.message || null,
        errorDetails: errorDetails
      }}
    >
      {children}
    </CategoryContext.Provider>
  )
}

export function useCategories() {
  const context = useContext(CategoryContext)
  if (context === undefined) {
    throw new Error('useCategories must be used within a CategoryProvider')
  }
  return context
}

