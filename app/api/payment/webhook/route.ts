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
  const email = data.customer.email
  const customerCode = data.customer.customer_code
  const subscriptionCode = data.subscription_code
  const amount = data.amount / 100 // Convert kobo to currency unit
  const paidAt = data.paid_at
  const planCode = data.plan?.plan_code
  const currency = data.currency

  console.log(`Processing charge.success for ${email}`)

  if (!email) return

  // Find user by email
  let userId = null
  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single()

  if (user) {
    userId = user.id
  } else {
    console.warn(`User with email ${email} not found in public.users during webhook processing`)
    return
  }

  // Sync with subscriptions table
  if (subscriptionCode) {
    const subscriptionData = {
      user_id: userId,
      status: 'active',
      plan_code: planCode,
      subscription_code: subscriptionCode,
      customer_code: customerCode,
      amount: amount,
      currency: currency,
      current_period_start: paidAt,
      // next_payment_date: We might not have this in charge.success, 
      // ideally we fetch from Paystack API or calculate based on plan
      updated_at: new Date().toISOString()
    }

    // Check if subscription exists
    const { data: existingSub } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('subscription_code', subscriptionCode)
      .single()

    if (existingSub) {
      await supabase
        .from('subscriptions')
        .update(subscriptionData)
        .eq('id', existingSub.id)
    } else {
      await supabase
        .from('subscriptions')
        .insert(subscriptionData)
    }

    // Update profile for backward compatibility
    const updateData: any = {
      subscription_status: 'active',
      paystack_customer_code: customerCode,
      paystack_subscription_code: subscriptionCode,
      subscription_plan_code: planCode,
      current_period_start: paidAt,
    }

    await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', userId)
  }
}

async function handleInvoicePaymentFailed(data: any, supabase: any) {
  const email = data.customer.email
  const subscriptionCode = data.subscription_code
  console.log(`Processing invoice.payment_failed for ${email}`)
  
  const { data: user } = await supabase.from('users').select('id').eq('email', email).single()
  if (user) {
    // Update subscriptions table
    if (subscriptionCode) {
      await supabase
        .from('subscriptions')
        .update({ status: 'past_due' })
        .eq('subscription_code', subscriptionCode)
    }

    // Update profiles table
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
    // Update subscriptions table
    if (subscriptionCode) {
      await supabase
        .from('subscriptions')
        .update({ status: 'cancelled' })
        .eq('subscription_code', subscriptionCode)
    }

    // Update profiles table
    await supabase
      .from('profiles')
      .update({ subscription_status: 'cancelled' })
      .eq('id', user.id)
  }
}
