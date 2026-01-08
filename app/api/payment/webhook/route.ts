
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(req: Request) {
  try {
    const body = await req.text()
    const signature = req.headers.get('x-paystack-signature')
    const secretKey = process.env.PAYSTACK_SECRET_KEY

    if (!secretKey) {
      console.error('PAYSTACK_SECRET_KEY is not set')
      return NextResponse.json({ error: 'Configuration error' }, { status: 500 })
    }

    if (!signature) {
      return NextResponse.json({ error: 'No signature provided' }, { status: 400 })
    }

    // Verify signature
    const hash = crypto.createHmac('sha512', secretKey).update(body).digest('hex')
    if (hash !== signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const event = JSON.parse(body)
    console.log('Received Paystack event:', event.event)

    // Initialize Supabase Admin Client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Supabase configuration missing')
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Handle different events
    switch (event.event) {
      case 'charge.success':
        await handleChargeSuccess(event.data, supabase)
        break
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data, supabase)
        break
      case 'subscription.disable':
        await handleSubscriptionDisable(event.data, supabase)
        break
      default:
        console.log('Unhandled event type:', event.event)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}

async function handleChargeSuccess(data: any, supabase: any) {
  // This event is sent for every successful payment (initial and recurring)
  // We care about subscription updates.
  
  const email = data.customer.email
  const customerCode = data.customer.customer_code
  const subscriptionCode = data.subscription_code // might be null for one-time payments but we are doing subscriptions
  const amount = data.amount
  const paidAt = data.paid_at
  const planCode = data.plan?.plan_code

  console.log(`Processing charge.success for ${email}`)

  if (!email) return

  // Find user by email (try public.users then auth.users like in success route)
  // Or find by paystack_customer_code if we already have it?
  
  // Let's try to match by email for now as it's most reliable if customer code isn't saved yet.
  let userId = null

  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single()

  if (user) {
    userId = user.id
  } else {
    // Fallback to auth.users lookup if needed, similar to success route logic
    // But for simplicity/speed in webhook, we hope public.users is up to date.
    // If not, we log warning.
    console.warn(`User with email ${email} not found in public.users during webhook processing`)
    return
  }

  // Update profile
  // Calculate period end based on plan interval?
  // Paystack doesn't always send 'next_payment_date' in charge.success, 
  // but it might be in the authorization or subscription object if fetched.
  // For now, let's assume monthly/yearly based on plan?
  // Actually, 'charge.success' usually implies access granted for the next cycle.
  
  // If we have subscription_code, it's a subscription payment.
  if (subscriptionCode) {
      // We should ideally fetch subscription details to get next_payment_date
      // But we can also just update status to active.
      
      const updateData: any = {
        subscription_status: 'active',
        paystack_customer_code: customerCode,
        paystack_subscription_code: subscriptionCode,
        subscription_plan_code: planCode,
        // We can update current_period_start to now
        current_period_start: paidAt,
        // We can't easily guess end date without plan details or paystack API call.
        // But we can approximate or fetch.
      }
      
      // Attempt to fetch subscription details from Paystack to get next_payment_date
      // using NEXT_PAYMENT_DATE or similar if available in payload?
      // event.data doesn't always have next_payment_date.
      
      await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId)
  }
}

async function handleInvoicePaymentFailed(data: any, supabase: any) {
  const email = data.customer.email
  console.log(`Processing invoice.payment_failed for ${email}`)
  
  // Find user and update status
  const { data: user } = await supabase.from('users').select('id').eq('email', email).single()
  if (user) {
    await supabase
      .from('profiles')
      .update({ subscription_status: 'past_due' })
      .eq('id', user.id)
  }
}

async function handleSubscriptionDisable(data: any, supabase: any) {
  const email = data.customer.email
  const subscriptionCode = data.subscription_code
  console.log(`Processing subscription.disable for ${email}`)

  const { data: user } = await supabase.from('users').select('id').eq('email', email).single()
  if (user) {
    await supabase
      .from('profiles')
      .update({ subscription_status: 'cancelled' })
      .eq('id', user.id)
  }
}
