#!/usr/bin/env tsx

/**
 * Simple webhook test to check if events are being received
 * Run with: npx tsx scripts/test-webhook-simple.ts
 */

import { config } from 'dotenv'

// Load environment variables from .env file
config({ path: '.env' })

async function testWebhookSimple() {
  console.log('🧪 Testing Webhook Setup...\n')

  console.log('1. Environment Variables:')
  console.log(`   STRIPE_SECRET_KEY: ${process.env.STRIPE_SECRET_KEY ? '✅ Set' : '❌ Missing'}`)
  console.log(`   STRIPE_WEBHOOK_SECRET: ${process.env.STRIPE_WEBHOOK_SECRET ? '✅ Set' : '❌ Missing'}`)
  console.log(`   DATABASE_URL: ${process.env.DATABASE_URL ? '✅ Set' : '❌ Missing'}`)
  console.log(`   AUTH0_SECRET: ${process.env.AUTH0_SECRET ? '✅ Set' : '❌ Missing'}`)

  console.log('\n2. Webhook Endpoint:')
  console.log('   URL: http://localhost:3000/api/stripe/webhook')
  console.log('   Status: Should be receiving events from Stripe CLI')

  console.log('\n3. Next Steps:')
  console.log('   ✅ Make sure your Next.js app is running: npm run dev')
  console.log('   ✅ Make sure Stripe CLI is running: stripe listen --forward-to localhost:3000/api/stripe/webhook')
  console.log('   ✅ Test with: stripe trigger checkout.session.completed')
  console.log('   ✅ Check your Next.js server logs for webhook processing messages')

  console.log('\n4. What to Look For:')
  console.log('   In Stripe CLI: "Event forwarded successfully"')
  console.log('   In Next.js logs: "Webhook received event: checkout.session.completed"')
  console.log('   In Next.js logs: "Subscription upserted successfully"')

  console.log('\n5. If Webhook is Working:')
  console.log('   - New subscriptions will appear in database automatically')
  console.log('   - Users will see correct subscription status')
  console.log('   - No need to run fix scripts')

  console.log('\n6. If Webhook is NOT Working:')
  console.log('   - Run: npm run fix-all-missing-subscriptions-final')
  console.log('   - Check webhook configuration')
  console.log('   - Check server logs for errors')

  console.log('\n📋 Summary:')
  console.log('The webhook system is the key to making subscriptions work automatically.')
  console.log('Without it, users can subscribe in Stripe but won\'t see their subscription in the app.')
  console.log('With it, everything works seamlessly! 🚀')
}

// Run the test
testWebhookSimple()
