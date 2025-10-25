# Stripe Subscription Integration

This document outlines the complete Stripe subscription integration for the ZenPortal customer portal.

## Overview

The subscription system handles:
- User subscription creation and management
- Stripe webhook processing for real-time updates
- Billing portal integration for customer self-service
- Subscription status tracking and feature access control

## Architecture

### Database Schema

The subscription system uses the following Prisma models:

```prisma
model User {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  auth0Id   String   @unique
  email     String   @unique
  name      String?
  picture   String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  subscription Subscription?
  usage        Usage[]
}

model Subscription {
  id                   String             @id @default(auto()) @map("_id") @db.ObjectId
  userId               String             @unique @db.ObjectId
  stripeCustomerId     String             @unique
  stripeSubscriptionId String?            @unique
  status               SubscriptionStatus @default(INACTIVE)
  plan                 SubscriptionPlan   @default(FREE)
  currentPeriodStart   DateTime?
  currentPeriodEnd     DateTime?
  cancelAtPeriodEnd    Boolean            @default(false)
  createdAt            DateTime           @default(now())
  updatedAt            DateTime           @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

enum SubscriptionStatus {
  ACTIVE
  INACTIVE
  CANCELED
  PAST_DUE
  TRIALING
}

enum SubscriptionPlan {
  FREE
  STARTER
  CORE
  ADVANCED
  MAX
}
```

### API Routes

#### `/api/checkout` (POST)
Creates a Stripe checkout session for subscription purchases.

**Request Body:**
```json
{
  "priceId": "price_xxxxx"
}
```

**Response:**
```json
{
  "id": "cs_xxxxx",
  "url": "https://checkout.stripe.com/..."
}
```

#### `/api/billing/portal` (POST)
Creates a Stripe billing portal session for subscription management.

**Response:**
```json
{
  "url": "https://billing.stripe.com/..."
}
```

#### `/api/stripe/webhook` (POST)
Handles Stripe webhook events for real-time subscription updates.

**Supported Events:**
- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

#### `/api/user` (GET)
Returns current user information including subscription details.

**Response:**
```json
{
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name",
    "picture": "https://...",
    "subscription": {
      "status": "ACTIVE",
      "plan": "STARTER",
      "currentPeriodStart": "2024-01-01T00:00:00Z",
      "currentPeriodEnd": "2024-02-01T00:00:00Z",
      "cancelAtPeriodEnd": false,
      "stripeCustomerId": "cus_xxxxx",
      "stripeSubscriptionId": "sub_xxxxx"
    },
    "recentUsage": []
  }
}
```

### Subscription Utilities

The `lib/subscription.ts` file provides utility functions for subscription management:

```typescript
// Get user's subscription level
const level = await getUserSubscriptionLevel(userId)

// Get detailed subscription information
const info = await getUserSubscriptionInfo(userId)

// Check if user has active subscription
const hasActive = await hasActiveSubscription(userId)

// Check feature access
const hasAccess = await hasFeatureAccess(userId, 'premium_llm_calls')

// Get subscription limits
const limits = await getSubscriptionLimits(userId)
```

### Subscription Plans

| Plan | Price | Features |
|------|-------|----------|
| FREE | $0/month | 25 Premium LLM Calls/day, Unlimited BYOK Calls |
| STARTER | $19/user/month | 200 Premium LLM Calls/day, Unlimited Slow Mode, 7-Day Free Trial |
| CORE | $49/user/month | 550 Premium LLM Calls/day, Multi-Repository Indexing, Analytics Dashboard, SSO & Audit Logs |
| ADVANCED | $119/user/month | 1500 Premium LLM Calls/day, Access to Claude Opus 4.1, All Core Features |
| MAX | $250/user/month | 3200 Premium LLM Calls/day, All Advanced Features, Maximum Usage Limits |

## Environment Variables

Required environment variables for Stripe integration:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Product and Price IDs
STRIPE_STARTER_PRODUCT_ID=prod_...
STRIPE_STARTER_PRICE_ID=price_...
STRIPE_CORE_PRODUCT_ID=prod_...
STRIPE_CORE_PRICE_ID=price_...
STRIPE_ADVANCED_PRODUCT_ID=prod_...
STRIPE_ADVANCED_PRICE_ID=price_...
STRIPE_MAX_PRODUCT_ID=prod_...
STRIPE_MAX_PRICE_ID=price_...

# Public Price IDs (for frontend)
NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_CORE_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_ADVANCED_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_MAX_PRICE_ID=price_...
```

## Webhook Setup

1. **Create Webhook Endpoint in Stripe Dashboard:**
   - URL: `https://yourdomain.com/api/stripe/webhook`
   - Events to send:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`

2. **Copy Webhook Secret:**
   - Copy the webhook signing secret from Stripe Dashboard
   - Add it to your environment variables as `STRIPE_WEBHOOK_SECRET`

## Testing

### Manual Testing

1. **Test Checkout Flow:**
   ```bash
   curl -X POST http://localhost:3000/api/checkout \
     -H "Content-Type: application/json" \
     -d '{"priceId": "price_xxxxx"}'
   ```

2. **Test Billing Portal:**
   ```bash
   curl -X POST http://localhost:3000/api/billing/portal \
     -H "Content-Type: application/json"
   ```

3. **Test Subscription Utilities:**
   ```bash
   npx tsx scripts/test-subscription.ts
   ```

### Webhook Testing

Use Stripe CLI to test webhooks locally:

```bash
# Install Stripe CLI
npm install -g stripe

# Login to Stripe
stripe login

# Forward webhooks to local development
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

## Error Handling

The system includes comprehensive error handling:

- **Webhook signature verification** prevents unauthorized requests
- **User authentication** ensures only authenticated users can access billing features
- **Database transaction safety** prevents partial updates
- **Graceful fallbacks** for missing subscription data

## Security Considerations

- All webhook requests are verified using Stripe's signature verification
- User authentication is required for all billing operations
- Sensitive data (Stripe customer IDs) are only accessible to authenticated users
- Webhook secrets are stored securely in environment variables

## Monitoring and Logging

The system includes comprehensive logging:

- Webhook event processing logs
- Subscription status changes
- Error tracking and debugging information
- User action logging for audit trails

## Troubleshooting

### Common Issues

1. **Webhook not receiving events:**
   - Check webhook URL is correct
   - Verify webhook secret matches environment variable
   - Ensure webhook endpoint is accessible

2. **Subscription not updating:**
   - Check webhook event types are configured correctly
   - Verify database connection
   - Check for errors in webhook processing logs

3. **Billing portal not working:**
   - Ensure user has a Stripe customer ID
   - Check Stripe API key permissions
   - Verify return URL configuration

### Debug Commands

```bash
# Check webhook endpoint
curl -X POST http://localhost:3000/api/stripe/webhook \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'

# Test subscription utilities
npx tsx scripts/test-subscription.ts

# Check database connection
npx prisma db push
```
