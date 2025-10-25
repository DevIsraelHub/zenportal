#!/usr/bin/env tsx

/**
 * Debug billing portal API directly
 * Run with: npx tsx scripts/debug-billing-portal.ts
 */

import { prisma } from '../lib/prisma'
import { stripe } from '../lib/stripe'

async function debugBillingPortal() {
  console.log('🔍 Debugging Billing Portal API...\n')

  try {
    const userEmail = 'ejehisraelameh@gmail.com'

    console.log('1. Getting user data...')
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      include: { subscription: true }
    })

    if (!user) {
      console.log('❌ User not found')
      return
    }

    console.log('✅ User found:', {
      id: user.id,
      auth0Id: user.auth0Id,
      email: user.email,
      hasSubscription: !!user.subscription
    })

    if (!user.subscription) {
      console.log('❌ No subscription found')
      return
    }

    console.log('✅ Subscription found:', {
      id: user.subscription.id,
      status: user.subscription.status,
      plan: user.subscription.plan,
      stripeCustomerId: user.subscription.stripeCustomerId
    })

    console.log('\n2. Testing Stripe billing portal creation...')

    if (!user.subscription.stripeCustomerId) {
      console.log('❌ No Stripe customer ID found')
      return
    }

    try {
      const portal = await stripe.billingPortal.sessions.create({
        customer: user.subscription.stripeCustomerId,
        return_url: 'http://localhost:3000/dashboard/billing',
      })

      console.log('✅ Billing portal created successfully:', {
        url: portal.url,
        id: portal.id
      })

      console.log('\n3. Testing environment variables...')
      console.log('AUTH0_SECRET:', process.env.AUTH0_SECRET ? 'Set' : 'Missing')
      console.log('AUTH0_BASE_URL:', process.env.AUTH0_BASE_URL || 'Missing')
      console.log('AUTH0_ISSUER_BASE_URL:', process.env.AUTH0_ISSUER_BASE_URL || 'Missing')
      console.log('AUTH0_CLIENT_ID:', process.env.AUTH0_CLIENT_ID ? 'Set' : 'Missing')
      console.log('AUTH0_CLIENT_SECRET:', process.env.AUTH0_CLIENT_SECRET ? 'Set' : 'Missing')

    } catch (stripeError) {
      console.error('❌ Stripe billing portal error:', stripeError)
    }

    console.log('\n4. Testing API route simulation...')

    // Simulate what the API route does
    try {
      const baseUrl = process.env.APP_BASE_URL ||
        process.env.AUTH0_BASE_URL ||
        'http://localhost:3000'

      console.log('✅ Base URL resolved:', baseUrl)

      const portal = await stripe.billingPortal.sessions.create({
        customer: user.subscription.stripeCustomerId,
        return_url: `${baseUrl}/dashboard/billing`,
      })

      console.log('✅ API simulation successful:', {
        url: portal.url,
        returnUrl: `${baseUrl}/dashboard/billing`
      })

    } catch (apiError) {
      console.error('❌ API simulation error:', apiError)
    }

  } catch (error) {
    console.error('❌ Error during debugging:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the debug
debugBillingPortal()
