#!/usr/bin/env tsx

/**
 * Webhook test script to simulate webhook events
 * This helps test if webhooks are working correctly
 * Run with: npx tsx scripts/test-webhook.ts
 */

import { prisma } from '../lib/prisma'
import { stripe } from '../lib/stripe'

async function testWebhook() {
  console.log('🧪 Testing Webhook Processing...\n')

  try {
    const userEmail = 'ejehisraelameh@gmail.com'

    console.log('1. Getting user and subscription data...')
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
      email: user.email
    })

    if (!user.subscription) {
      console.log('❌ No subscription found')
      return
    }

    console.log('✅ Subscription found:', {
      id: user.subscription.id,
      status: user.subscription.status,
      plan: user.subscription.plan,
      stripeCustomerId: user.subscription.stripeCustomerId,
      stripeSubscriptionId: user.subscription.stripeSubscriptionId
    })

    console.log('\n2. Testing subscription update webhook...')

    // Get the current subscription from Stripe
    const stripeSubscription = await stripe.subscriptions.retrieve(user.subscription.stripeSubscriptionId!) as any

    console.log('✅ Stripe subscription:', {
      id: stripeSubscription.id,
      status: stripeSubscription.status,
      customer: stripeSubscription.customer,
      current_period_start: stripeSubscription.current_period_start,
      current_period_end: stripeSubscription.current_period_end
    })

    // Simulate webhook processing
    const customerId = stripeSubscription.customer as string
    const priceId = stripeSubscription.items.data[0]?.price.id
    const plan = (() => {
      if (priceId === process.env.STRIPE_STARTER_PRICE_ID) return 'STARTER'
      if (priceId === process.env.STRIPE_CORE_PRICE_ID) return 'CORE'
      if (priceId === process.env.STRIPE_ADVANCED_PRICE_ID) return 'ADVANCED'
      if (priceId === process.env.STRIPE_MAX_PRICE_ID) return 'MAX'
      return 'FREE'
    })()

    const status = (() => {
      switch (stripeSubscription.status.toLowerCase()) {
        case "active": return "ACTIVE"
        case "trialing": return "TRIALING"
        case "past_due": return "PAST_DUE"
        case "canceled":
        case "cancelled": return "CANCELED"
        default: return "INACTIVE"
      }
    })()

    console.log(`✅ Processed data: plan=${plan}, status=${status}`)

    // Update the subscription record
    const updatedSubscription = await prisma.subscription.update({
      where: { userId: user.id },
      data: {
        status: status as any,
        plan: plan as any,
        currentPeriodStart: stripeSubscription.current_period_start
          ? new Date(stripeSubscription.current_period_start * 1000)
          : undefined,
        currentPeriodEnd: stripeSubscription.current_period_end
          ? new Date(stripeSubscription.current_period_end * 1000)
          : undefined,
        cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
        stripeSubscriptionId: stripeSubscription.id,
      },
    })

    console.log('✅ Subscription updated:', {
      status: updatedSubscription.status,
      plan: updatedSubscription.plan,
      currentPeriodStart: updatedSubscription.currentPeriodStart,
      currentPeriodEnd: updatedSubscription.currentPeriodEnd
    })

    console.log('\n3. Testing user API response...')
    const apiUser = await prisma.user.findUnique({
      where: { email: userEmail },
      include: { subscription: true }
    })

    if (apiUser?.subscription) {
      console.log('✅ API would return:', {
        user: {
          id: apiUser.id,
          email: apiUser.email,
          name: apiUser.name,
          subscription: {
            status: apiUser.subscription.status,
            plan: apiUser.subscription.plan,
            currentPeriodStart: apiUser.subscription.currentPeriodStart,
            currentPeriodEnd: apiUser.subscription.currentPeriodEnd,
            cancelAtPeriodEnd: apiUser.subscription.cancelAtPeriodEnd,
            stripeCustomerId: apiUser.subscription.stripeCustomerId
          }
        }
      })
    }

  } catch (error) {
    console.error('❌ Error testing webhook:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the test
testWebhook()
