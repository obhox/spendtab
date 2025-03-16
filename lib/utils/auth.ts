import { createBrowserClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function getCurrentUser() {
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
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null
  
  return {
    first_name: user.user_metadata?.first_name || '',
    last_name: user.user_metadata?.last_name || '',
    company_name: user.user_metadata?.company_name || ''
  }
}

export async function updateUserProfile({ first_name, last_name, company_name, password }: {
  first_name?: string
  last_name?: string
  company_name?: string
  password?: string
}) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const updateData: any = {
    data: {
      first_name,
      last_name,
      company_name
    }
  }

  if (password) {
    updateData.password = password
  }

  const { error } = await supabase.auth.updateUser(updateData)
  
  if (error) {
    throw error
  }
}

export async function signIn(email: string, password: string) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  
  if (error) {
    throw error
  }

  // After successful sign in, the session will be automatically handled by the client
  return data
  
  return data
}

export async function signUp(email: string, password: string, firstName?: string, lastName?: string, companyName?: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          company_name: companyName
        }
      }
    })
    
    if (error) {
      throw error
    }
    
    return { success: true, user: data.user }
  } catch (error: any) {
    console.error('Error signing up:', error.message)
    return { success: false, error: error.message }
  }
}

export async function signOut() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    throw error
  }
}

export async function resetPassword(email: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  })
  
  if (error) {
    throw error
  }
}

export async function updatePassword(password: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { error } = await supabase.auth.updateUser({
    password,
  })
  
  if (error) {
    throw error
  }
}

export function supabaseAuthStateChange(callback: (user: any) => void) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (event, session) => {
      callback(session?.user || null)
    }
  )
  
  return subscription
}

export async function signInWithGoogle() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })
    
    if (error) {
      throw error
    }
    
    if (!data.url) {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        throw sessionError
      }
    }
    
    return data
  } catch (error) {
    console.error('Google sign-in error:', error)
    throw error
  }
}