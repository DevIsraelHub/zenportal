#!/usr/bin/env tsx

/**
 * Test script to verify subscription utilities work correctly
 * Run with: npx tsx scripts/test-subscription.ts
 */

import { prisma } from '../lib/prisma'
import { getUserSubscriptionLevel, getUserSubscriptionInfo, hasActiveSubscription, getSubscriptionLimits } from '../lib/subscription'

async function testSubscriptionUtils() {
  console.log('🧪 Testing Subscription Utilities...\n')

  try {
    // Test with a mock user ID (you can replace this with a real user ID from your database)
    const testUserId = 'test-user-id'

    console.log('1. Testing getUserSubscriptionLevel...')
    const level = await getUserSubscriptionLevel(testUserId)
    console.log(`   Subscription Level: ${level}`)

    console.log('\n2. Testing getUserSubscriptionInfo...')
    const info = await getUserSubscriptionInfo(testUserId)
    console.log(`   Subscription Info:`, info)

    console.log('\n3. Testing hasActiveSubscription...')
    const hasActive = await hasActiveSubscription(testUserId)
    console.log(`   Has Active Subscription: ${hasActive}`)

    console.log('\n4. Testing getSubscriptionLimits...')
    const limits = await getSubscriptionLimits(testUserId)
    console.log(`   Subscription Limits:`, limits)

    console.log('\n✅ All subscription utility tests completed!')

  } catch (error) {
    console.error('❌ Error testing subscription utilities:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the test
testSubscriptionUtils()
