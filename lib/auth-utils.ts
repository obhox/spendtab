import { supabase } from './supabase'
import { ensureUserHasAccount } from './account-utils'

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
  const user = await getCurrentUser()
  if (!user) return null
  
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
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  
  if (error) {
    throw error
  }

  if (data.user) {
    await ensureUserHasAccount(data.user)
  }
  
  return data
}

export async function signUp(email: string, password: string, firstName?: string, lastName?: string, companyName?: string) {
  try {
    // Create the user account first
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

    if (data.user) {
      await ensureUserHasAccount(data.user)
    }

    // Send welcome email
    try {
      await fetch('/api/email/welcome', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: email,
          firstName: firstName || '',
          fullName: firstName && lastName ? `${firstName} ${lastName}` : undefined
        })
      })
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError)
      // Don't throw error here as signup was successful
    }
    
    return { success: true, user: data.user }
  } catch (error: any) {
    console.error('Error signing up:', error.message)
    return { success: false, error: error.message }
  }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    throw error
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

export async function updatePassword(password: string, token?: string) {
  if (token) {
    const { error } = await supabase.auth.updateUser({
      password: password
    })
    
    if (error) {
      throw error
    }
  } else {
    const { error } = await supabase.auth.updateUser({
      password: password
    })
    
    if (error) {
      throw error
    }
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
  try {
    // First attempt to get current session in case we're returning from OAuth redirect
    const { data: { session: existingSession }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      throw sessionError
    }

    // If we have a session from redirect or immediate sign-in
    if (existingSession?.user) {
      // Ensure user has a default account
      await ensureUserHasAccount(existingSession.user)
      
      // Send welcome email
      try {
        await fetch('/api/email/welcome', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: existingSession.user.email,
            firstName: existingSession.user.user_metadata?.given_name || '',
            fullName: existingSession.user.user_metadata?.name
          })
        })
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError)
        // Don't throw error as sign-in was successful
      }
      
      // Redirect to dashboard after successful authentication
      window.location.href = '/dashboard'
      return { session: existingSession }
    }

    // If no session, initiate Google OAuth
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })
    
    if (error) {
      throw error
    }
    
    return data
  } catch (error) {
    console.error('Google sign-in error:', error)
    throw error
  }
}
