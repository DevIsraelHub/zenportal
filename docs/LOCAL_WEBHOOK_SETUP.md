# Local Webhook Setup Guide

## Quick Setup (Recommended)

### Step 1: Start Your Next.js App
```bash
npm run dev
```
Your app should be running on `http://localhost:3000`

### Step 2: Start Stripe CLI Webhook Forwarding
In a **new terminal window**, run:
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

You should see output like:
```
> Ready! Your webhook signing secret is whsec_29b395c0a1d7e3c6f52f9bcccef6b88907b74e4033fd9504865710df16f64187
> Forwarding events to localhost:3000/api/stripe/webhook
```

### Step 3: Test the Webhook
In another terminal, trigger a test event:
```bash
stripe trigger checkout.session.completed
```

You should see:
- In the Stripe CLI terminal: Event forwarded successfully
- In your Next.js app logs: Webhook processing messages

### Step 4: Test Real Subscription
1. Go to `http://localhost:3000`
2. Click "Get Started" on any plan
3. Complete the checkout process
4. Check your server logs for webhook events

## Alternative Setup (Manual Webhook)

If you prefer to set up a manual webhook endpoint in Stripe Dashboard:

### Step 1: Get Your Public URL
Use ngrok to expose your local server:
```bash
# Install ngrok
npm install -g ngrok

# Expose port 3000
ngrok http 3000
```

Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)

### Step 2: Create Webhook in Stripe Dashboard
1. Go to https://dashboard.stripe.com/test/webhooks
2. Click "Add endpoint"
3. Set Endpoint URL: `https://your-ngrok-url.ngrok.io/api/stripe/webhook`
4. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click "Add endpoint"

### Step 3: Update Environment Variables
Copy the webhook secret from Stripe Dashboard and update your `.env.local`:
```bash
STRIPE_WEBHOOK_SECRET=whsec_your_secret_from_stripe_dashboard
```

## Testing Your Setup

### Test Scripts Available:
```bash
# Test webhook delivery
npm run test-webhook-delivery

# Test webhook processing
npm run test-webhook-processing

# Test complete subscription flow
npm run test-subscription-flow

# Fix any missing subscriptions
npm run fix-all-missing-subscriptions-final
```

### What to Look For:

#### ✅ Success Indicators:
- Stripe CLI shows "Event forwarded successfully"
- Next.js logs show webhook processing messages
- New subscriptions appear in database
- Users see correct subscription status

#### ❌ Failure Indicators:
- No events in Stripe CLI
- No webhook processing logs
- Subscriptions not created in database
- Users still see "free plan"

## Troubleshooting

### Webhook Not Receiving Events
1. **Check Stripe CLI is running**: Should show "Ready!" message
2. **Check Next.js app is running**: Should be on port 3000
3. **Check webhook secret**: Must match in `.env.local`
4. **Check endpoint URL**: Must be exactly `localhost:3000/api/stripe/webhook`

### Events Received But Not Processed
1. **Check server logs**: Look for webhook processing errors
2. **Check database connection**: Ensure MongoDB is accessible
3. **Check user creation**: Verify Auth0 integration is working
4. **Test webhook logic**: Run `npm run test-webhook-processing`

### Database Issues
1. **Check connection**: Ensure `DATABASE_URL` is correct
2. **Check schema**: Run `npm run db:push` if needed
3. **Check constraints**: Look for unique constraint violations
4. **Fix missing data**: Run `npm run fix-all-missing-subscriptions-final`

## Production Deployment

For production, you'll need to:

1. **Set up production webhook endpoint** in Stripe Dashboard
2. **Use production Stripe keys**
3. **Set production environment variables**
4. **Test with production events**

## Summary

The Stripe CLI approach is recommended for development because:
- ✅ No need for ngrok or public URLs
- ✅ Automatic webhook secret management
- ✅ Easy testing with `stripe trigger`
- ✅ Real-time event forwarding
- ✅ No Stripe Dashboard configuration needed

Once you have this working locally, you can deploy to production and set up the production webhook endpoint.
