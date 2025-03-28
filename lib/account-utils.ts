import { supabase } from './supabase'

export async function ensureUserHasAccount(user: any) {
  if (!user) return

  // Check if user already has an account
  const { data: accountData, error: accountCheckError } = await supabase
    .from('accounts')
    .select('id')
    .eq('owner_id', user.id)
    .limit(1)

  if (accountCheckError) {
    console.error('Error checking for existing account:', accountCheckError)
    return
  }

  // Create default account if none exists
  if (!accountData || accountData.length === 0) {
    try {
      const { error: accountError } = await supabase
        .from('accounts')
        .insert({
          name: 'Default Account',
          description: 'Your default account',
          owner_id: user.id
        })

      if (accountError) {
        console.error('Failed to create default account:', accountError)
      }
    } catch (accountError: any) {
      console.error('Failed to create default account:', accountError)
    }
  }
}