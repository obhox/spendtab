import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function getCurrentUser() {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )
  const { data: { session }, error } = await supabase.auth.getSession()
  
  if (error) {
    console.error('Error getting current user session:', error)
    return null
  }
  
  if (!session) {
    return null
  }
  
  return session.user
}

export async function getUserProfile() {
  const user = await getCurrentUser()
  if (!user) return null
  
  return {
    first_name: user.user_metadata?.first_name || '',
    last_name: user.user_metadata?.last_name || '',
    company_name: user.user_metadata?.company_name || ''
  }
}