import { supabase } from './supabase'
import { getCurrentUser } from './auth-utils'

// Helper function to get user ID for database operations
export async function getUserId() {
  const user = await getCurrentUser()
  return user?.id
}

// Generic function to fetch user's data with pagination
export async function fetchUserData<T>(
  table: string,
  options: {
    page?: number,
    pageSize?: number,
    orderBy?: { column: string, ascending: boolean },
    filter?: Record<string, any>
  } = {}
) {
  const userId = await getUserId()
  if (!userId) {
    throw new Error('User not authenticated')
  }
  
  const {
    page = 1,
    pageSize = 20,
    orderBy = { column: 'created_at', ascending: false },
    filter = {}
  } = options
  
  // Calculate range for pagination
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  
  // Start building query
  let query = supabase
    .from(table)
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .range(from, to)
  
  // Add ordering
  query = query.order(orderBy.column, { ascending: orderBy.ascending })
  
  // Add filters
  Object.entries(filter).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        query = query.in(key, value)
      } else if (typeof value === 'object' && value !== null) {
        // Handle range filters like { gte: 100, lte: 200 }
        Object.entries(value).forEach(([operator, operatorValue]) => {
          if (operatorValue !== undefined && operatorValue !== null) {
            query = query[operator as any](key, operatorValue)
          }
        })
      } else {
        query = query.eq(key, value)
      }
    }
  })
  
  // Execute query
  const { data, error, count } = await query
  
  if (error) {
    throw error
  }
  
  return {
    data: data as T[],
    count: count || 0,
    page,
    pageSize,
    totalPages: count ? Math.ceil(count / pageSize) : 0
  }
}

// Generic function to insert data with proper user ID
export async function insertData<T>(
  table: string,
  data: Omit<T, 'id' | 'user_id' | 'created_at' | 'updated_at'>
) {
  const userId = await getUserId()
  if (!userId) {
    throw new Error('User not authenticated')
  }
  
  const dataWithUser = {
    ...data,
    user_id: userId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
  
  const { data: result, error } = await supabase
    .from(table)
    .insert(dataWithUser)
    .select()
  
  if (error) {
    throw error
  }
  
  return result?.[0] as T
}

// Generic function to update data
export async function updateData<T>(
  table: string,
  id: string,
  data: Partial<Omit<T, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
) {
  const userId = await getUserId()
  if (!userId) {
    throw new Error('User not authenticated')
  }
  
  const dataWithTimestamp = {
    ...data,
    updated_at: new Date().toISOString()
  }
  
  const { data: result, error } = await supabase
    .from(table)
    .update(dataWithTimestamp)
    .eq('id', id)
    .eq('user_id', userId) // Security check
    .select()
  
  if (error) {
    throw error
  }
  
  return result?.[0] as T
}

// Generic function to delete data
export async function deleteData(
  table: string,
  id: string
) {
  const userId = await getUserId()
  if (!userId) {
    throw new Error('User not authenticated')
  }
  
  const { error } = await supabase
    .from(table)
    .delete()
    .eq('id', id)
    .eq('user_id', userId) // Security check
  
  if (error) {
    throw error
  }
  
  return true
}
