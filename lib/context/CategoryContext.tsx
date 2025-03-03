"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { supabase } from "../supabase"
import { v4 as uuidv4 } from 'uuid'

// Category data interface
export interface Category {
  id: string
  name: string
  type: "income" | "expense"
  icon?: string
  color?: string
  is_default: boolean
}

// Context interface
interface CategoryContextType {
  categories: Category[]
  incomeCategories: Category[]
  expenseCategories: Category[]
  addCategory: (category: Omit<Category, "id" | "is_default">) => Promise<void>
  updateCategory: (id: string, category: Omit<Category, "id" | "is_default">) => Promise<void>
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

  // Load initial data from Supabase
  useEffect(() => {
    async function fetchCategories() {
      try {
        setIsLoading(true)
        
        const { data, error } = await supabase
          .from('categories')
          .select('*')
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
            is_default: item.is_default
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

    // Set up real-time subscription
    const channel = supabase
      .channel('categories-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'categories' 
        }, 
        () => {
          fetchCategories()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  // Calculate derived categories
  const incomeCategories = categories.filter(cat => cat.type === 'income')
  const expenseCategories = categories.filter(cat => cat.type === 'expense')

  // Add a new category
  const addCategory = async (category: Omit<Category, "id" | "is_default">) => {
    try {
      setIsLoading(true)
      
      const newCategory = {
        ...category,
        is_default: false,
      }
      
      const { error } = await supabase
        .from('categories')
        .insert(newCategory)
      
      if (error) {
        throw error
      }
      
      // Fetch the new category from Supabase
      const { data: fetchedCategory, error: fetchError } = await supabase
        .from('categories')
        .select('*')
        .eq('name', category.name) // Assuming name is unique
        .single()

      if (fetchError) {
        console.error('Error fetching new category:', fetchError)
        setError('Failed to add category')
        return
      }

      if (fetchedCategory) {
        setCategories(prev => [...prev, {
          id: fetchedCategory.id,
          name: fetchedCategory.name,
          type: fetchedCategory.type,
          icon: fetchedCategory.icon,
          color: fetchedCategory.color,
          is_default: fetchedCategory.is_default
        }])
      }
      
    } catch (error) {
      console.error('Error adding category:', error)
      setError('Failed to add category')
    } finally {
      setIsLoading(false)
    }
  }

  // Update an existing category
  const updateCategory = async (id: string, updatedCategory: Omit<Category, "id" | "is_default">) => {
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
      
      if (error) {
        throw error
      }
      
      // Update the UI
      setCategories(prev => prev.filter(category => category.id !== id))
      
    } catch (error) {
      console.error('Error deleting category:', error)
      setError('Failed to delete category')
    } finally {
      setIsLoading(false)
    }
  }

  // Context value
  const value = {
    categories,
    incomeCategories,
    expenseCategories,
    addCategory,
    updateCategory,
    deleteCategory,
    isLoading,
    error,
  }

  return <CategoryContext.Provider value={value}>{children}</CategoryContext.Provider>
}

// Custom hook to use the category context
export function useCategories() {
  const context = useContext(CategoryContext)
  if (context === undefined) {
    throw new Error('useCategories must be used within a CategoryProvider')
  }
  return context
}
