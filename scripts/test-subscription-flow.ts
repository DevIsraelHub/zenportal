#!/usr/bin/env tsx

/**
 * Test the complete subscription flow
 * Run with: npx tsx scripts/test-subscription-flow.ts
 */

import { config } from 'dotenv'
import { prisma } from '../lib/prisma'

// Load environment variables
config()

async function testSubscriptionFlow() {
  console.log('🧪 Testing Subscription Flow...\n')

  try {
    // Test 1: Check for duplicate users
    console.log('1. Checking for duplicate users...')
    const users = await prisma.user.findMany({
      where: { email: 'eazyboy494@gmail.com' },
      include: { subscription: true }
    })

    console.log(`Found ${users.length} user(s) with email eazyboy494@gmail.com`)
    users.forEach((user, index) => {
      console.log(`  User ${index + 1}:`)
      console.log(`    ID: ${user.id}`)
      console.log(`    Auth0Id: ${user.auth0Id}`)
      console.log(`    Email: ${user.email}`)
      console.log(`    Name: ${user.name}`)
      console.log(`    Subscription: ${user.subscription ? 'Yes' : 'No'}`)
      if (user.subscription) {
        console.log(`      Plan: ${user.subscription.plan}`)
        console.log(`      Status: ${user.subscription.status}`)
        console.log(`      Stripe Customer ID: ${user.subscription.stripeCustomerId}`)
        console.log(`      Stripe Subscription ID: ${user.subscription.stripeSubscriptionId}`)
      }
    })

    // Test 2: Check for orphaned subscriptions
    console.log('\n2. Checking for orphaned subscriptions...')
    const subscriptions = await prisma.subscription.findMany({
      include: { user: true }
    })

    console.log(`Found ${subscriptions.length} subscription(s)`)
    subscriptions.forEach((sub, index) => {
      console.log(`  Subscription ${index + 1}:`)
      console.log(`    ID: ${sub.id}`)
      console.log(`    User ID: ${sub.userId}`)
      console.log(`    User Email: ${sub.user?.email || 'NOT FOUND'}`)
      console.log(`    Plan: ${sub.plan}`)
      console.log(`    Status: ${sub.status}`)
      console.log(`    Stripe Customer ID: ${sub.stripeCustomerId}`)
      console.log(`    Stripe Subscription ID: ${sub.stripeSubscriptionId}`)
    })

    // Test 3: Check for users without subscriptions
    console.log('\n3. Checking for users without subscriptions...')
    const usersWithoutSubs = await prisma.user.findMany({
      where: { subscription: null },
      include: { subscription: true }
    })

    console.log(`Found ${usersWithoutSubs.length} user(s) without subscriptions`)
    usersWithoutSubs.forEach((user, index) => {
      console.log(`  User ${index + 1}:`)
      console.log(`    ID: ${user.id}`)
      console.log(`    Email: ${user.email}`)
      console.log(`    Auth0Id: ${user.auth0Id}`)
    })

    // Test 4: Recommendations
    console.log('\n4. Recommendations:')

    if (users.length > 1) {
      console.log('  ⚠️  Multiple users with same email detected!')
      console.log('  🔧 Solution: Merge duplicate users or clean up database')
    }

    if (subscriptions.length === 0) {
      console.log('  ⚠️  No subscriptions found in database!')
      console.log('  🔧 Solution: Check webhook configuration and test webhook delivery')
    }

    if (usersWithoutSubs.length > 0) {
      console.log('  ℹ️  Some users don\'t have subscriptions (this is normal for free users)')
    }

    // Test 5: Check specific user
    console.log('\n5. Checking specific user (eazyboy494@gmail.com)...')
    const specificUser = await prisma.user.findUnique({
      where: { email: 'eazyboy494@gmail.com' },
      include: { subscription: true }
    })

    if (specificUser) {
      console.log('  ✅ User found:')
      console.log(`    ID: ${specificUser.id}`)
      console.log(`    Auth0Id: ${specificUser.auth0Id}`)
      console.log(`    Subscription: ${specificUser.subscription ? 'Yes' : 'No'}`)

      if (specificUser.subscription) {
        console.log(`    Plan: ${specificUser.subscription.plan}`)
        console.log(`    Status: ${specificUser.subscription.status}`)
      } else {
        console.log('    ❌ No subscription found - this is the problem!')
        console.log('    🔧 Solution: Check webhook delivery and subscription creation')
      }
    } else {
      console.log('  ❌ User not found!')
    }

  } catch (error) {
    console.error('❌ Error during testing:', error)
  }
}

// Run the test
testSubscriptionFlow()
