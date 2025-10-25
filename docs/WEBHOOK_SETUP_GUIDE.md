# Webhook Setup Guide

## Problem
The webhook is not receiving events from Stripe, causing subscriptions to be created in Stripe but not reflected in the database.

## Root Cause
The webhook endpoint is not properly configured in the Stripe Dashboard.

## Solution

### 1. Configure Webhook in Stripe Dashboard

1. **Go to Stripe Dashboard**: https://dashboard.stripe.com/test/webhooks
2. **Click "Add endpoint"**
3. **Set Endpoint URL**: `https://yourdomain.com/api/stripe/webhook`
   - Replace `yourdomain.com` with your actual domain
   - For local development: Use ngrok or similar tool
4. **Select Events to Listen For**:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. **Click "Add endpoint"**

### 2. Get Webhook Secret

1. **Click on your webhook endpoint**
2. **Copy the "Signing secret"** (starts with `whsec_`)
3. **Add to your environment variables**:
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_your_secret_here
   ```

### 3. Test Webhook Endpoint

1. **In Stripe Dashboard**, click on your webhook endpoint
2. **Click "Send test webhook"**
3. **Select event type**: `checkout.session.completed`
4. **Click "Send test webhook"**
5. **Check your server logs** for webhook processing

### 4. Verify Webhook is Working

Run the test script to verify:
```bash
npx tsx scripts/test-webhook-delivery.ts
```

You should see:
- ✅ Webhook events being received
- ✅ Subscriptions being created in database
- ✅ No missing subscriptions

### 5. For Local Development

If you're developing locally, you need to expose your local server to the internet:

#### Option 1: Using ngrok
```bash
# Install ngrok
npm install -g ngrok

# Start your Next.js app
npm run dev

# In another terminal, expose port 3000
ngrok http 3000

# Use the ngrok URL in Stripe webhook endpoint
# Example: https://abc123.ngrok.io/api/stripe/webhook
```

#### Option 2: Using Stripe CLI
```bash
# Install Stripe CLI
# https://stripe.com/docs/stripe-cli

# Login to Stripe
stripe login

# Forward events to local webhook
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Copy the webhook secret from the output
```

### 6. Environment Variables

Make sure these are set in your `.env.local`:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Auth0 Configuration
AUTH0_SECRET=...
AUTH0_BASE_URL=http://localhost:3000
AUTH0_ISSUER_BASE_URL=https://your-auth0-domain.auth0.com
AUTH0_CLIENT_ID=...
AUTH0_CLIENT_SECRET=...

# Database
DATABASE_URL=mongodb://...
```

### 7. Testing New Subscriptions

After setting up the webhook:

1. **Create a new test account**
2. **Subscribe to a plan**
3. **Check if subscription appears in database**:
   ```bash
   npx tsx scripts/test-subscription-flow.ts
   ```

### 8. Troubleshooting

#### Webhook Not Receiving Events
- Check webhook URL is correct
- Verify webhook secret is set
- Check server logs for errors
- Test webhook endpoint manually

#### Events Received But Not Processed
- Check server logs for webhook processing errors
- Verify database connection
- Check user creation logic
- Test webhook logic manually

#### Database Issues
- Check database connection
- Verify schema is up to date
- Check for constraint violations
- Run database migration if needed

### 9. Monitoring

#### Check Webhook Status
- Go to Stripe Dashboard > Webhooks
- Click on your webhook endpoint
- Check "Recent deliveries" for success/failure rates

#### Server Logs
Look for these log messages:
- `"Webhook received event: checkout.session.completed"`
- `"Webhook received event: customer.subscription.created"`
- `"Subscription upserted successfully for user:"`

#### Database Verification
```bash
# Check all subscriptions
npx tsx scripts/test-subscription-flow.ts

# Check specific user
npx tsx scripts/test-webhook-processing.ts
```

### 10. Production Deployment

For production:

1. **Update webhook URL** to production domain
2. **Use production Stripe keys**
3. **Set production environment variables**
4. **Test webhook with production events**
5. **Monitor webhook delivery status**

### 11. Emergency Fix

If webhook is not working and users are subscribing:

```bash
# Fix all missing subscriptions
npx tsx scripts/fix-all-missing-subscriptions-final.ts

# Verify fix
npx tsx scripts/test-subscription-flow.ts
```

## Summary

The webhook system is critical for the subscription flow. Without it:
- Users can subscribe in Stripe
- But subscriptions don't appear in the database
- Users see "free plan" even after subscribing

With proper webhook setup:
- All subscription events are processed automatically
- Database stays in sync with Stripe
- Users see their correct subscription status

## Next Steps

1. **Set up webhook endpoint in Stripe Dashboard**
2. **Configure webhook secret in environment variables**
3. **Test webhook with test events**
4. **Verify new subscriptions work automatically**
5. **Monitor webhook delivery status regularly**
