#!/usr/bin/env tsx

/**
 * Environment validation script for Stripe configuration
 * Run with: npx tsx scripts/validate-env.ts
 */

import { config } from 'dotenv'

// Load environment variables
config()

interface EnvVar {
  name: string
  required: boolean
  description: string
  example?: string
}

const requiredEnvVars: EnvVar[] = [
  {
    name: 'STRIPE_SECRET_KEY',
    required: true,
    description: 'Stripe secret key for API access',
    example: 'sk_test_...'
  },
  {
    name: 'STRIPE_WEBHOOK_SECRET',
    required: true,
    description: 'Stripe webhook signing secret',
    example: 'whsec_...'
  },
  {
    name: 'STRIPE_STARTER_PRICE_ID',
    required: true,
    description: 'Stripe price ID for Starter plan',
    example: 'price_...'
  },
  {
    name: 'STRIPE_CORE_PRICE_ID',
    required: true,
    description: 'Stripe price ID for Core plan',
    example: 'price_...'
  },
  {
    name: 'STRIPE_ADVANCED_PRICE_ID',
    required: true,
    description: 'Stripe price ID for Advanced plan',
    example: 'price_...'
  },
  {
    name: 'STRIPE_MAX_PRICE_ID',
    required: true,
    description: 'Stripe price ID for Max plan',
    example: 'price_...'
  },
  {
    name: 'NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID',
    required: true,
    description: 'Public Stripe price ID for Starter plan (frontend)',
    example: 'price_...'
  },
  {
    name: 'NEXT_PUBLIC_STRIPE_CORE_PRICE_ID',
    required: true,
    description: 'Public Stripe price ID for Core plan (frontend)',
    example: 'price_...'
  },
  {
    name: 'NEXT_PUBLIC_STRIPE_ADVANCED_PRICE_ID',
    required: true,
    description: 'Public Stripe price ID for Advanced plan (frontend)',
    example: 'price_...'
  },
  {
    name: 'NEXT_PUBLIC_STRIPE_MAX_PRICE_ID',
    required: true,
    description: 'Public Stripe price ID for Max plan (frontend)',
    example: 'price_...'
  },
  {
    name: 'DATABASE_URL',
    required: true,
    description: 'MongoDB connection string',
    example: 'mongodb://...'
  },
  {
    name: 'AUTH0_SECRET',
    required: true,
    description: 'Auth0 secret for session encryption',
    example: 'your-secret-key'
  },
  {
    name: 'AUTH0_BASE_URL',
    required: true,
    description: 'Base URL for Auth0 callbacks',
    example: 'http://localhost:3000'
  },
  {
    name: 'AUTH0_ISSUER_BASE_URL',
    required: true,
    description: 'Auth0 domain',
    example: 'https://your-domain.auth0.com'
  },
  {
    name: 'AUTH0_CLIENT_ID',
    required: true,
    description: 'Auth0 application client ID',
    example: 'your-client-id'
  },
  {
    name: 'AUTH0_CLIENT_SECRET',
    required: true,
    description: 'Auth0 application client secret',
    example: 'your-client-secret'
  }
]

function validateEnvironment() {
  console.log('🔍 Validating Environment Variables...\n')

  let hasErrors = false
  let hasWarnings = false

  for (const envVar of requiredEnvVars) {
    const value = process.env[envVar.name]

    if (!value) {
      if (envVar.required) {
        console.log(`❌ ${envVar.name}: MISSING (Required)`)
        console.log(`   ${envVar.description}`)
        if (envVar.example) {
          console.log(`   Example: ${envVar.example}`)
        }
        console.log()
        hasErrors = true
      } else {
        console.log(`⚠️  ${envVar.name}: MISSING (Optional)`)
        console.log(`   ${envVar.description}`)
        console.log()
        hasWarnings = true
      }
    } else {
      console.log(`✅ ${envVar.name}: Set`)
    }
  }

  console.log('\n📋 Summary:')

  if (hasErrors) {
    console.log('❌ Some required environment variables are missing!')
    console.log('   Please set the missing variables in your .env.local file')
    process.exit(1)
  } else if (hasWarnings) {
    console.log('⚠️  All required variables are set, but some optional ones are missing')
    console.log('   The application should work, but some features may be limited')
  } else {
    console.log('✅ All environment variables are properly configured!')
  }

  console.log('\n📚 Next Steps:')
  console.log('1. Create products and prices in your Stripe Dashboard')
  console.log('2. Set up webhook endpoint: https://yourdomain.com/api/stripe/webhook')
  console.log('3. Configure Auth0 application settings')
  console.log('4. Run: npm run dev')
}

// Run validation
validateEnvironment()
