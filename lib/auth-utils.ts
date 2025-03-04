import { supabase } from './supabase'

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

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  
  if (error) {
    throw error
  }
  
  return data
}

export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })
  
  if (error) {
    throw error
  }
  
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    throw error
  }
}

export async function getUserProfile() {
  const user = await getCurrentUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('first_name, last_name, company_name')
    .eq('id', user.id)
    .single()

  if (error) {
    console.error('Error fetching user profile:', error)
    return null
  }

  return data
}

export async function updateUserProfile({
  first_name,
  last_name,
  company_name,
  password,
}: {
  first_name?: string
  last_name?: string
  company_name?: string
  password?: string
}) {
  const user = await getCurrentUser()
  if (!user) throw new Error('No user logged in')

  // Update profile data
  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      first_name,
      last_name,
      company_name,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (profileError) {
    throw profileError
  }

  // Update password if provided
  if (password) {
    const { error: passwordError } = await supabase.auth.updateUser({
      password,
    })

    if (passwordError) {
      throw passwordError
    }
  }
}

export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  })
  
  if (error) {
    throw error
  }
}

export async function updatePassword(password: string) {
  const { error } = await supabase.auth.updateUser({
    password,
  })
  
  if (error) {
    throw error
  }
}

export function supabaseAuthStateChange(callback: (user: any) => void) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (event, session) => {
      callback(session?.user || null)
    }
  )
  
  return subscription
}

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/dashboard`
    }
  })
  
  if (error) {
    throw error
  }
  
  return data
}
