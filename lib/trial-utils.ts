import { supabase } from './supabase'

export async function checkTrialStatus(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('subscription_tier, trial_end_date')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Error checking trial status:', error)
    return { isTrialExpired: false, daysRemaining: 0, trialEndDate: null }
  }

  if (data.subscription_tier === 'pro') {
    return { isTrialExpired: false, daysRemaining: null, trialEndDate: null }
  }

  if (!data.trial_end_date) {
    return { isTrialExpired: false, daysRemaining: 21, trialEndDate: null }
  }

  const trialEndDate = new Date(data.trial_end_date)
  const now = new Date()
  const isTrialExpired = now > trialEndDate
  const daysRemaining = Math.max(0, Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))

  return {
    isTrialExpired,
    daysRemaining,
    trialEndDate: data.trial_end_date
  }
}

export function formatTrialEndDate(trialEndDate: string | null): string {
  if (!trialEndDate) return ''
  
  const endDate = new Date(trialEndDate)
  const now = new Date()
  const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  
  if (daysRemaining <= 0) {
    return 'Trial expired'
  } else if (daysRemaining === 1) {
    return '1 day remaining'
  } else {
    return `${daysRemaining} days remaining`
  }
}

export function shouldShowTrialExpirationPopup(isTrialExpired: boolean, subscriptionTier?: string): boolean {
  // Don't show popup for pro users
  if (subscriptionTier === 'pro') return false
  
  if (!isTrialExpired) return false
  
  // Check if user clicked "Remind Me Later" recently
  const remindLaterTimestamp = localStorage.getItem('trialExpirationRemindLater')
  if (remindLaterTimestamp) {
    const remindLaterTime = parseInt(remindLaterTimestamp)
    const now = Date.now()
    const twentyFourHours = 24 * 60 * 60 * 1000 // 24 hours in milliseconds
    
    // If less than 24 hours have passed since "Remind Me Later", don't show popup
    if (now - remindLaterTime < twentyFourHours) {
      return false
    }
  }
  
  return true
}