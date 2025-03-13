"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { supabase } from "../supabase"
import { v4 as uuidv4 } from 'uuid'
import { useAccounts } from './AccountContext'

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

  // Load initial data from Supabase
  useEffect(() => {
    async function fetchCategories() {
      setCategories([]) // Reset categories before fetching new account data
      setError(null) // Clear any previous errors
      
      if (!currentAccount || isAccountSwitching) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .eq('account_id', currentAccount.id)
          .order('name', { ascending: true })
        
        if (error) {
          throw error
        }
        
        if (data) {
          setCategories(data.map(item => ({
            id: item.id,
            name: item.name,
            type: item.type,
            icon: item.icon || undefined,
            color: item.color || undefined,
            is_default: item.is_default,
            account_id: item.account_id
          })))
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
        setError('Failed to load categories')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchCategories()

    // Clean up any existing subscription
    const cleanupSubscription = () => {
      const existingChannel = supabase.getChannels().find(ch => ch.topic.startsWith('realtime:categories-'));
      if (existingChannel) {
        supabase.removeChannel(existingChannel);
      }
    };

    // Set up real-time subscription only for current account
    let channel;
    if (currentAccount) {
      // Clean up any existing subscription first
      cleanupSubscription();
      
      // Set up new subscription for current account
      channel = supabase
        .channel(`categories-${currentAccount.id}`)
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'categories',
            filter: `account_id=eq.${currentAccount.id}`
          }, 
          () => {
            fetchCategories()
          }
        )
        .subscribe()
    }

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [currentAccount]) // Only depend on currentAccount changes

  // Calculate derived categories
  const incomeCategories = categories.filter(cat => cat.type === 'income')
  const expenseCategories = categories.filter(cat => cat.type === 'expense')

  // Add a new category
  const addCategory = async (category: Omit<Category, "id" | "is_default" | "account_id">) => {
    if (!currentAccount) return

    try {
      setIsLoading(true)
      
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
        throw error
      }
      
      // Optimistically update the UI
      setCategories(prev => [...prev, { 
        id: uuidv4(),
        name: category.name,
        type: category.type,
        icon: category.icon,
        color: category.color,
        is_default: false,
        account_id: currentAccount.id
      }])
      
    } catch (error) {
      console.error('Error adding category:', error)
      setError('Failed to add category')
    } finally {
      setIsLoading(false)
    }
  }

  // Update an existing category
  const updateCategory = async (id: string, updatedCategory: Omit<Category, "id" | "is_default" | "account_id">) => {
    if (!currentAccount) return

    try {
      setIsLoading(true)
      
      // Check if this is a default category
      const categoryToUpdate = categories.find(cat => cat.id === id)
      if (!categoryToUpdate) {
        throw new Error('Category not found')
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
        throw error
      }
      
      // Optimistically update the UI
      setCategories(prev =>
        prev.map(category =>
          category.id === id 
            ? { 
                ...category, 
                ...updatedCategory 
              } 
            : category
        )
      )
      
    } catch (error) {
      console.error('Error updating category:', error)
      setError('Failed to update category')
    } finally {
      setIsLoading(false)
    }
  }

  // Delete a category
  const deleteCategory = async (id: string) => {
    if (!currentAccount) return

    try {
      setIsLoading(true)
      
      // Check if this is a default category
      const categoryToDelete = categories.find(cat => cat.id === id)
      if (!categoryToDelete) {
        throw new Error('Category not found')
      }
      
      if (categoryToDelete.is_default) {
        throw new Error('Cannot delete default categories')
      }
      
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)
        .eq('account_id', currentAccount.id)
      
      if (error) {
        throw error
      }
      
      // Optimistically update the UI
      setCategories(prev => prev.filter(category => category.id !== id))
      
    } catch (error) {
      console.error('Error deleting category:', error)
      setError('Failed to delete category')
    } finally {
      setIsLoading(false)
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
