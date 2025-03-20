"use client"

import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from "react"
import { supabase } from "../supabase"
import { v4 as uuidv4 } from 'uuid'
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
}

// Create the context with a default value
const CategoryContext = createContext<CategoryContextType | undefined>(undefined)

// Provider component
export function CategoryProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { currentAccount, isAccountSwitching } = useAccounts()
  
  // Use refs to prevent duplicate requests and enable caching
  const isFetchingRef = useRef(false)
  const categoryCacheRef = useRef<Record<string, Category[]>>({})

  // Fetch categories with caching
  const fetchCategories = useCallback(async (forceFetch = false) => {
    if (!currentAccount || isAccountSwitching) {
      setIsLoading(false)
      return
    }
    
    // Prevent duplicate fetches
    if (isFetchingRef.current) {
      return
    }
    
    // Check cache first
    if (!forceFetch && categoryCacheRef.current[currentAccount.id]) {
      setCategories(categoryCacheRef.current[currentAccount.id])
      setIsLoading(false)
      
      // Still fetch in background to update cache, but don't show loading state
      isFetchingRef.current = true
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .eq('account_id', currentAccount.id)
          .order('name', { ascending: true })
        
        if (error) throw error
        
        if (data) {
          const formattedData = data.map(item => ({
            id: item.id,
            name: item.name,
            type: item.type,
            icon: item.icon || undefined,
            color: item.color || undefined,
            is_default: item.is_default,
            account_id: item.account_id
          }))
          
          // Only update if data has changed
          const currentData = JSON.stringify(categories)
          const newData = JSON.stringify(formattedData)
          
          if (currentData !== newData) {
            setCategories(formattedData)
            categoryCacheRef.current[currentAccount.id] = formattedData
          }
        }
      } catch (error: any) {
        console.error('Error fetching categories in background:', error)
      } finally {
        isFetchingRef.current = false
      }
      return
    }

    try {
      setIsLoading(true)
      isFetchingRef.current = true
      
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('account_id', currentAccount.id)
        .order('name', { ascending: true })
      
      if (error) {
        toast(error.message)
        throw error
      }
      
      if (data) {
        const formattedData = data.map(item => ({
          id: item.id,
          name: item.name,
          type: item.type,
          icon: item.icon || undefined,
          color: item.color || undefined,
          is_default: item.is_default,
          account_id: item.account_id
        }))
        
        setCategories(formattedData)
        categoryCacheRef.current[currentAccount.id] = formattedData
      }
    } catch (error: any) {
      console.error('Error fetching categories:', error)
      setError(error.message || 'Failed to load categories')
      toast(error.message || 'Failed to load categories')
    } finally {
      setIsLoading(false)
      isFetchingRef.current = false
    }
  }, [currentAccount, isAccountSwitching, categories])

  // Load initial data from Supabase
  useEffect(() => {
    if (!currentAccount) {
      setIsLoading(false)
      return
    }
    
    // Use cached data if available
    if (categoryCacheRef.current[currentAccount.id]) {
      setCategories(categoryCacheRef.current[currentAccount.id])
      setIsLoading(false)
    } else {
      // Reset categories only if switching to a new account without cached data
      setCategories([])
      setError(null)
      fetchCategories()
    }

    // Set up periodic refresh
    const refreshInterval = setInterval(() => {
      if (currentAccount) {
        fetchCategories(true);
      }
    }, 30000); // Refresh every 30 seconds

    return () => {
      clearInterval(refreshInterval);
    }
  }, [currentAccount, fetchCategories])

  // Calculate derived categories - memoize these if performance is still an issue
  const incomeCategories = categories.filter(cat => cat.type === 'income')
  const expenseCategories = categories.filter(cat => cat.type === 'expense')

  // Add a new category
  const addCategory = async (category: Omit<Category, "id" | "is_default" | "account_id">) => {
    if (!currentAccount) return

    try {
      setError(null)
      
      // Generate a temporary ID for optimistic update
      const tempId = uuidv4()
      
      // Optimistically update the UI
      const newCategoryForUI = { 
        id: tempId,
        name: category.name,
        type: category.type,
        icon: category.icon,
        color: category.color,
        is_default: false,
        account_id: currentAccount.id
      }
      
      setCategories(prev => [...prev, newCategoryForUI])
      
      // Update cache
      if (categoryCacheRef.current[currentAccount.id]) {
        categoryCacheRef.current[currentAccount.id] = [...categoryCacheRef.current[currentAccount.id], newCategoryForUI]
      }
      
      const newCategory = {
        ...category,
        is_default: false,
        account_id: currentAccount.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      const { error } = await supabase
        .from('categories')
        .insert(newCategory)
      
      if (error) {
        // Rollback optimistic update
        setCategories(prev => prev.filter(c => c.id !== tempId))
        if (categoryCacheRef.current[currentAccount.id]) {
          categoryCacheRef.current[currentAccount.id] = categoryCacheRef.current[currentAccount.id].filter(c => c.id !== tempId)
        }
        toast(error.message)
        throw error
      }
      
    } catch (error: any) {
      console.error('Error adding category:', error)
      setError(error.message || 'Failed to add category')
      toast(error.message || 'Failed to add category')
    }
  }

  // Update an existing category
  const updateCategory = async (id: string, updatedCategory: Omit<Category, "id" | "is_default" | "account_id">) => {
    if (!currentAccount) return

    try {
      setError(null)
      
      // Check if this is a default category
      const categoryToUpdate = categories.find(cat => cat.id === id)
      if (!categoryToUpdate) {
        throw new Error('Category not found')
      }
      
      // Save the previous state for rollback
      const previousCategories = [...categories]
      
      // Optimistically update the UI
      const updatedCategories = categories.map(category =>
        category.id === id 
          ? { 
              ...category, 
              ...updatedCategory 
            } 
          : category
      )
      
      setCategories(updatedCategories)
      
      // Update cache
      if (categoryCacheRef.current[currentAccount.id]) {
        categoryCacheRef.current[currentAccount.id] = updatedCategories
      }
      
      const updateData = {
        ...updatedCategory,
        updated_at: new Date().toISOString()
      }
      
      const { error } = await supabase
        .from('categories')
        .update(updateData)
        .eq('id', id)
        .eq('account_id', currentAccount.id)
      
      if (error) {
        // Rollback optimistic update
        setCategories(previousCategories)
        if (categoryCacheRef.current[currentAccount.id]) {
          categoryCacheRef.current[currentAccount.id] = previousCategories
        }
        toast(error.message)
        throw error
      }
      
    } catch (error: any) {
      console.error('Error updating category:', error)
      setError(error.message || 'Failed to update category')
      toast(error.message || 'Failed to update category')
    }
  }

  // Delete a category
  const deleteCategory = async (id: string) => {
    if (!currentAccount) return

    try {
      setError(null)
      
      // Check if this is a default category
      const categoryToDelete = categories.find(cat => cat.id === id)
      if (!categoryToDelete) {
        throw new Error('Category not found')
      }
      
      if (categoryToDelete.is_default) {
        const errorMsg = 'Cannot delete default categories'
        toast(errorMsg)
        throw new Error(errorMsg)
      }
      
      // Save previous state for rollback
      const previousCategories = [...categories]
      
      // Optimistically update the UI
      const updatedCategories = categories.filter(category => category.id !== id)
      setCategories(updatedCategories)
      
      // Update cache
      if (categoryCacheRef.current[currentAccount.id]) {
        categoryCacheRef.current[currentAccount.id] = updatedCategories
      }
      
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)
        .eq('account_id', currentAccount.id)
      
      if (error) {
        // Rollback optimistic update
        setCategories(previousCategories)
        if (categoryCacheRef.current[currentAccount.id]) {
          categoryCacheRef.current[currentAccount.id] = previousCategories
        }
        toast(error.message)
        throw error
      }
      
    } catch (error: any) {
      console.error('Error deleting category:', error)
      setError(error.message || 'Failed to delete category')
      toast(error.message || 'Failed to delete category')
    }
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
        error,
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

