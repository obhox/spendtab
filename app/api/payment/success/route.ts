
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    let body;
    try {
      body = await req.json();
    } catch (e) {
      console.error('Failed to parse request body:', e);
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { reference, email } = body;
    console.log('Payment success webhook received:', { reference, email });

    if (!reference || !email) {
      console.error('Missing reference or email:', { reference, email });
      return NextResponse.json({ error: 'Missing reference or email' }, { status: 400 })
    }

    let paystackData: any = null

    // Verify payment with Paystack
    const secretKey = process.env.PAYSTACK_SECRET_KEY
    
    if (secretKey) {
      try {
        console.log('Verifying payment with Paystack for reference:', reference)
        const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${secretKey}`,
            'Content-Type': 'application/json',
          },
        })
        
        const data = await response.json()
        
        if (!data.status || data.data.status !== 'success') {
          console.error('Paystack verification failed:', JSON.stringify(data, null, 2))
          return NextResponse.json({ error: 'Payment verification failed', details: data }, { status: 400 })
        }
        
        paystackData = data.data
        console.log('Paystack verification successful for:', reference)
        
      } catch (error) {
        console.error('Paystack verification error:', error)
        return NextResponse.json({ error: 'Payment verification error', details: error instanceof Error ? error.message : error }, { status: 500 })
      }
    } else {
      console.warn('PAYSTACK_SECRET_KEY not set. Skipping server-side verification.')
    }

    // Initialize Supabase Admin Client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Server configuration error: Missing Supabase keys');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Find user by email
    let userId = null

    // Try to find in public.users
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()
      
    if (user) {
      userId = user.id
    } else {
      console.warn('User not found in public.users, checking auth.users...', userError)
      
      // Fallback: check auth.users via admin API
      const { data: authData, error: authError } = await supabase.auth.admin.listUsers({
        perPage: 1000
      })
      
      if (authError) {
         console.error('Auth admin listUsers error:', authError)
         return NextResponse.json({ error: 'User lookup failed', details: authError }, { status: 500 })
      }
      
      const authUser = authData.users.find(u => u.email === email)
      
      if (authUser) {
        userId = authUser.id
        console.log('Found user in auth.users:', userId)
        
        // Self-heal: Insert into public.users
        const { error: insertUserError } = await supabase
          .from('users')
          .upsert({ id: userId, email: email })
          
        if (insertUserError) {
           console.error('Failed to insert into public.users:', insertUserError)
        }
        
        // Self-heal: Insert into public.profiles
        const { error: insertProfileError } = await supabase
          .from('profiles')
          .upsert({ 
            id: userId,
            subscription_status: 'trial',
            trial_start: new Date().toISOString(),
            trial_end: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
          })
           
        if (insertProfileError) {
           console.error('Failed to insert into public.profiles:', insertProfileError)
        }
        
      } else {
        console.error('User not found in auth.users either')
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }
    }

    if (!userId) {
       return NextResponse.json({ error: 'User ID resolution failed' }, { status: 500 })
    }

    // Update profile subscription status
    const updateData: any = { 
      subscription_status: 'active',
    }

    if (paystackData) {
        if (paystackData.customer) {
            updateData.paystack_customer_code = paystackData.customer.customer_code
        }
        if (paystackData.authorization) {
            updateData.paystack_auth_code = paystackData.authorization.authorization_code
        }
        if (paystackData.paid_at) {
            updateData.current_period_start = paystackData.paid_at
        }
        if (paystackData.plan) {
            // Check if plan is object or string
            updateData.subscription_plan_code = typeof paystackData.plan === 'object' ? paystackData.plan.plan_code : paystackData.plan
        }
        
        // Sync with subscriptions table
        // We prioritize subscription_code if available, otherwise fall back to user_id check
        const subscriptionCode = paystackData.subscription_code || (typeof paystackData.plan === 'object' ? paystackData.plan.subscription_code : null);
        const planCode = typeof paystackData.plan === 'object' ? paystackData.plan.plan_code : paystackData.plan;
        const amount = paystackData.amount ? paystackData.amount / 100 : null;
        
        const subscriptionData = {
           user_id: userId,
           status: 'active',
           plan_code: planCode,
           subscription_code: subscriptionCode,
           customer_code: paystackData.customer?.customer_code,
           amount: amount,
           currency: paystackData.currency,
           current_period_start: paystackData.paid_at,
           updated_at: new Date().toISOString()
        }
        
        // Try to find existing subscription
        let existingSub = null;
        
        if (subscriptionCode) {
           const { data } = await supabase
             .from('subscriptions')
             .select('id')
             .eq('subscription_code', subscriptionCode)
             .single()
           existingSub = data
        }
        
        if (!existingSub) {
            // Fallback: check by user_id
            const { data } = await supabase
             .from('subscriptions')
             .select('id')
             .eq('user_id', userId)
             .single()
            existingSub = data
        }

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
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', userId)

    if (updateError) {
      console.error('Profile update error:', updateError)
      return NextResponse.json({ error: 'Failed to update subscription', details: updateError }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Payment processing error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
