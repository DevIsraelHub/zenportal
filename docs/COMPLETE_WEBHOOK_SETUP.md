# Complete Webhook Setup Guide

## ✅ Your Current Status

**Environment Variables:** All set correctly
- ✅ STRIPE_SECRET_KEY: Set
- ✅ STRIPE_WEBHOOK_SECRET: Set  
- ✅ DATABASE_URL: Set
- ✅ AUTH0_SECRET: Set

## 🚀 Quick Setup (3 Steps)

### Step 1: Start Your Next.js App
```bash
npm run dev
```
**Expected:** App running on `http://localhost:3000`

### Step 2: Start Stripe CLI Webhook Forwarding
**In a NEW terminal window:**
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```
**Expected output:**
```
> Ready! Your webhook signing secret is whsec_29b395c0a1d7e3c6f52f9bcccef6b88907b74e4033fd9504865710df16f64187
> Forwarding events to localhost:3000/api/stripe/webhook
```

### Step 3: Test the Webhook
**In another terminal:**
```bash
stripe trigger checkout.session.completed
```
**Expected:**
- Stripe CLI: "Event forwarded successfully"
- Next.js logs: Webhook processing messages

## 🧪 Testing Your Setup

### Test Scripts Available:
```bash
# Test webhook setup
npx tsx scripts/test-webhook-simple.ts

# Test webhook delivery
npx tsx scripts/test-webhook-delivery.ts

# Test complete subscription flow
npx tsx scripts/test-subscription-flow.ts
```

### What to Look For:

#### ✅ Success Indicators:
- **Stripe CLI:** "Event forwarded successfully"
- **Next.js logs:** "Webhook received event: checkout.session.completed"
- **Next.js logs:** "Subscription upserted successfully"
- **Database:** New subscriptions appear automatically
- **UI:** Users see correct subscription status

#### ❌ Failure Indicators:
- No events in Stripe CLI
- No webhook processing logs
- Subscriptions not created in database
- Users still see "free plan"

## 🔧 Troubleshooting

### Webhook Not Receiving Events
1. **Check Stripe CLI is running** - Should show "Ready!" message
2. **Check Next.js app is running** - Should be on port 3000
3. **Check webhook secret** - Must match in `.env` file
4. **Check endpoint URL** - Must be exactly `localhost:3000/api/stripe/webhook`

### Events Received But Not Processed
1. **Check server logs** - Look for webhook processing errors
2. **Check database connection** - Ensure MongoDB is accessible
3. **Check user creation** - Verify Auth0 integration is working
4. **Test webhook logic** - Run `npx tsx scripts/test-webhook-processing.ts`

### Database Issues
1. **Check connection** - Ensure `DATABASE_URL` is correct
2. **Check schema** - Run `npm run db:push` if needed
3. **Check constraints** - Look for unique constraint violations
4. **Fix missing data** - Run `npx tsx scripts/fix-all-missing-subscriptions-final.ts`

## 📋 Complete Testing Workflow

### 1. Test Webhook Setup
```bash
npx tsx scripts/test-webhook-simple.ts
```

### 2. Test Webhook Delivery
```bash
npx tsx scripts/test-webhook-delivery.ts
```

### 3. Test Real Subscription
1. Go to `http://localhost:3000`
2. Click "Get Started" on any plan
3. Complete checkout process
4. Check server logs for webhook events
5. Verify subscription appears in database

### 4. Test Subscription Flow
```bash
npx tsx scripts/test-subscription-flow.ts
```

## 🎯 Expected Results

### When Webhook is Working:
- ✅ New subscriptions appear in database automatically
- ✅ Users see correct subscription status
- ✅ No need to run fix scripts
- ✅ Seamless subscription experience

### When Webhook is NOT Working:
- ❌ Users can subscribe in Stripe
- ❌ But subscriptions don't appear in database
- ❌ Users see "free plan" even after subscribing
- ❌ Need to run fix scripts manually

## 🚀 Production Deployment

For production, you'll need to:

1. **Set up production webhook endpoint** in Stripe Dashboard
2. **Use production Stripe keys**
3. **Set production environment variables**
4. **Test with production events**

## 📊 Summary

**The webhook system is the key to making subscriptions work automatically.**

- **Without webhook:** Users can subscribe in Stripe but won't see their subscription in the app
- **With webhook:** Everything works seamlessly! 🚀

**Your setup is ready - just follow the 3 steps above!**
