#!/usr/bin/env tsx

/**
 * Add sample usage data for testing the profile page
 * Run with: npx tsx scripts/add-sample-usage.ts
 */

import { config } from 'dotenv'
import { prisma } from '../lib/prisma'

// Load environment variables
config()

async function addSampleUsage() {
  console.log('📊 Adding Sample Usage Data...\n')

  try {
    // Find a user to add usage data for
    const user = await prisma.user.findFirst({
      where: { email: 'ejehisraelameh@gmail.com' }
    })

    if (!user) {
      console.log('❌ User not found')
      return
    }

    console.log('✅ Found user:', user.email)

    // Add sample usage data
    const sampleUsage = [
      {
        userId: user.id,
        type: 'AI_REQUEST' as const,
        amount: 25,
        description: 'AI chat completion requests',
        metadata: { model: 'gpt-4', tokens: 1500 }
      },
      {
        userId: user.id,
        type: 'API_CALL' as const,
        amount: 150,
        description: 'REST API requests processed',
        metadata: { endpoints: ['/api/users', '/api/subscriptions'] }
      },
      {
        userId: user.id,
        type: 'INTEGRATION_SYNC' as const,
        amount: 3,
        description: 'Third-party integrations synced',
        metadata: { services: ['stripe', 'auth0'] }
      },
      {
        userId: user.id,
        type: 'EXPORT_REPORT' as const,
        amount: 1,
        description: 'Monthly usage report generated',
        metadata: { format: 'pdf', pages: 12 }
      },
      {
        userId: user.id,
        type: 'AI_REQUEST' as const,
        amount: 12,
        description: 'Image analysis requests',
        metadata: { model: 'dall-e-3', images: 3 }
      }
    ]

    // Create usage records with different dates
    for (let i = 0; i < sampleUsage.length; i++) {
      const usage = sampleUsage[i]
      const createdAt = new Date(Date.now() - (i + 1) * 24 * 60 * 60 * 1000) // Days ago

      await prisma.usage.create({
        data: {
          ...usage,
          createdAt
        }
      })

      console.log(`✅ Added usage: ${usage.description} (${usage.amount} ${usage.type})`)
    }

    console.log('\n🎉 Sample usage data added successfully!')
    console.log('Your profile page should now show recent activity.')

  } catch (error) {
    console.error('❌ Error adding sample usage:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
addSampleUsage()
