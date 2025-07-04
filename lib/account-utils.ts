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
        return
      }

      // Fetch the newly created account to get its ID
      const { data: newAccount, error: newAccountError } = await supabase
        .from('accounts')
        .select('id')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (newAccountError || !newAccount) {
        console.error('Error fetching newly created account:', newAccountError)
        return
      }

      const accountId = newAccount.id

      // Create default 'Uncategorized' categories for income and expenses
      const defaultCategories = [
        {
          name: 'Uncategorized',
          type: 'income',
          account_id: accountId,
          user_id: user.id
        },
        {
          name: 'Uncategorized',
          type: 'expense',
          account_id: accountId,
          user_id: user.id
        }
      ]

      const { error: categoryError } = await supabase
        .from('categories')
        .insert(defaultCategories)

      if (categoryError) {
        console.error('Failed to create default categories:', categoryError)
      }
    } catch (error: any) {
      console.error('An unexpected error occurred:', error)
    }
  }
}