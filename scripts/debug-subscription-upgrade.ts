#!/usr/bin/env tsx

/**
 * Debug subscription upgrade issue by checking Stripe directly
 * Run with: npx tsx scripts/debug-subscription-upgrade.ts
 */

import { config } from 'dotenv'
import Stripe from 'stripe'

// Load environment variables
config()

async function debugSubscriptionUpgrade() {
  console.log('🔍 Debugging Subscription Upgrade Issue...\n')

  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      console.log('❌ STRIPE_SECRET_KEY not found in environment')
      return
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
    const userEmail = 'ejehisraelameh@gmail.com'

    console.log('1. Checking Stripe customers...')
    const customers = await stripe.customers.list({
      email: userEmail,
      limit: 10
    })

    if (customers.data.length === 0) {
      console.log('❌ No Stripe customers found')
      return
    }

    console.log(`✅ Found ${customers.data.length} customer(s)`)

    for (const customer of customers.data) {
      console.log(`\n2. Customer: ${customer.id}`)
      console.log(`   Email: ${customer.email}`)
      console.log(`   Created: ${new Date(customer.created * 1000).toISOString()}`)

      // Get all subscriptions for this customer
      const subscriptions = await stripe.subscriptions.list({
        customer: customer.id,
        limit: 10,
        status: 'all' // Include all statuses
      })

      console.log(`   Subscriptions: ${subscriptions.data.length}`)

      for (const sub of subscriptions.data) {
        const priceId = sub.items.data[0]?.price?.id
        let plan = 'UNKNOWN'

        if (priceId === process.env.STRIPE_STARTER_PRICE_ID) plan = 'STARTER'
        else if (priceId === process.env.STRIPE_CORE_PRICE_ID) plan = 'CORE'
        else if (priceId === process.env.STRIPE_ADVANCED_PRICE_ID) plan = 'ADVANCED'
        else if (priceId === process.env.STRIPE_MAX_PRICE_ID) plan = 'MAX'

        console.log(`     - Subscription ID: ${sub.id}`)
        console.log(`     - Status: ${sub.status}`)
        console.log(`     - Plan: ${plan} (${priceId})`)
        console.log(`     - Created: ${new Date(sub.created * 1000).toISOString()}`)
        console.log(`     - Current Period: ${sub.current_period_start ? new Date(sub.current_period_start * 1000).toISOString() : 'N/A'} - ${sub.current_period_end ? new Date(sub.current_period_end * 1000).toISOString() : 'N/A'}`)
        console.log(`     - Cancel at period end: ${sub.cancel_at_period_end}`)

        // Check if this is the most recent subscription
        const isMostRecent = sub === subscriptions.data[0]
        console.log(`     - Most Recent: ${isMostRecent ? 'YES' : 'NO'}`)
      }

      // Check for any checkout sessions
      console.log(`\n3. Checking checkout sessions for customer ${customer.id}...`)
      const sessions = await stripe.checkout.sessions.list({
        customer: customer.id,
        limit: 10
      })

      console.log(`   Checkout Sessions: ${sessions.data.length}`)
      for (const session of sessions.data) {
        console.log(`     - Session ID: ${session.id}`)
        console.log(`     - Status: ${session.status}`)
        console.log(`     - Created: ${new Date(session.created * 1000).toISOString()}`)
        console.log(`     - Subscription: ${session.subscription || 'None'}`)
        console.log(`     - Payment Status: ${session.payment_status}`)
      }
    }

    console.log('\n4. Analysis:')
    const allSubscriptions = []
    for (const customer of customers.data) {
      const subs = await stripe.subscriptions.list({
        customer: customer.id,
        limit: 10,
        status: 'all'
      })
      allSubscriptions.push(...subs.data)
    }

    // Sort by creation date (newest first)
    allSubscriptions.sort((a, b) => b.created - a.created)

    console.log(`   Total subscriptions found: ${allSubscriptions.length}`)

    if (allSubscriptions.length > 1) {
      console.log('   ⚠️  Multiple subscriptions detected!')
      console.log('   This is likely the cause of the upgrade issue.')
      console.log('   Stripe created a new subscription instead of updating the existing one.')
    }

    const activeSubscriptions = allSubscriptions.filter(sub => sub.status === 'active')
    console.log(`   Active subscriptions: ${activeSubscriptions.length}`)

    if (activeSubscriptions.length > 1) {
      console.log('   ❌ Multiple active subscriptions - this is the problem!')
      console.log('   Solution: Cancel old subscriptions and keep only the newest one.')
    }

    console.log('\n5. Recommendations:')
    if (activeSubscriptions.length > 1) {
      console.log('   🔧 To fix this issue:')
      console.log('   1. Cancel the old STARTER subscription')
      console.log('   2. Keep only the newest MAX subscription')
      console.log('   3. Update your database to point to the new subscription')
    }

  } catch (error) {
    console.error('❌ Error during debugging:', error)
  }
}

// Run the debug
debugSubscriptionUpgrade()