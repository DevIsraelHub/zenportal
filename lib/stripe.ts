import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-09-30.clover',
  typescript: true,
})

export const STRIPE_CONFIG = {
  products: {
    free: process.env.STRIPE_FREE_PRODUCT_ID || '',
    starter: process.env.STRIPE_STARTER_PRODUCT_ID || '',
    core: process.env.STRIPE_CORE_PRODUCT_ID || '',
    advanced: process.env.STRIPE_ADVANCED_PRODUCT_ID || '',
    max: process.env.STRIPE_MAX_PRODUCT_ID || '',
  },
  prices: {
    starter: process.env.STRIPE_STARTER_PRICE_ID || '',
    core: process.env.STRIPE_CORE_PRICE_ID || '',
    advanced: process.env.STRIPE_ADVANCED_PRICE_ID || '',
    max: process.env.STRIPE_MAX_PRICE_ID || '',
  },
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
}
