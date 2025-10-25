# Webhook Troubleshooting Guide

## Problem
Subscriptions are created in Stripe but not reflected in the database, causing users to see `subscription: null` in the API response.

## Root Cause Analysis
1. **Webhook Events Not Being Received**: The webhook endpoint may not be receiving events from Stripe
2. **Webhook Processing Failures**: Events are received but fail to process due to database constraints or logic errors
3. **User Linking Issues**: Webhook can't properly link Stripe customers to database users

## Solutions Applied

### 1. Fixed Database Constraint Issues
- **Problem**: Unique constraint errors on `users_email_key` and `subscriptions_userId_key`
- **Solution**: Added proper error handling in user creation and subscription upsert logic
- **Files**: `app/api/user/route.ts`, `app/api/checkout/route.ts`

### 2. Enhanced Webhook Logic
- **Problem**: Webhook couldn't find users by Stripe customer ID
- **Solution**: Added fallback logic to find users by email from Stripe customer data
- **Files**: `app/api/stripe/webhook/route.ts`

### 3. Fixed Subscription Upsert Logic
- **Problem**: Multiple subscriptions for same user causing constraint violations
- **Solution**: Changed from `create` to `upsert` with `userId` as the unique key
- **Files**: `app/api/stripe/webhook/route.ts`

## Testing Scripts

### 1. Test Webhook Delivery
```bash
npx tsx scripts/test-webhook-delivery.ts
```
Checks if webhook events are being received and processed correctly.

### 2. Test Webhook Processing
```bash
npx tsx scripts/test-webhook-processing.ts
```
Tests the webhook logic for a specific subscription.

### 3. Fix Missing Subscriptions
```bash
npx tsx scripts/fix-all-missing-subscriptions.ts
```
Manually creates missing subscription records.

### 4. Test Subscription Flow
```bash
npx tsx scripts/test-subscription-flow.ts
```
Comprehensive test of the entire subscription system.

## Webhook Configuration Checklist

### 1. Stripe Dashboard Configuration
- [ ] Webhook endpoint URL is correct: `https://yourdomain.com/api/stripe/webhook`
- [ ] Webhook secret is set in environment variables
- [ ] Required events are enabled:
  - `checkout.session.completed`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_succeeded`
  - `invoice.payment_failed`

### 2. Environment Variables
```bash
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 3. Database Schema
Ensure the database schema supports the webhook logic:
- `users` table with unique `email` and `auth0Id`
- `subscriptions` table with unique `userId`
- Proper foreign key relationships

## Common Issues and Solutions

### Issue 1: "No subscription found" Error
**Cause**: Webhook not processing `customer.subscription.created` events
**Solution**: 
1. Check webhook endpoint URL in Stripe Dashboard
2. Verify webhook secret is correct
3. Check server logs for webhook processing errors

### Issue 2: Multiple Subscriptions for Same User
**Cause**: User creates multiple subscriptions without canceling old ones
**Solution**: 
1. Webhook now uses `upsert` to update existing subscriptions
2. Added logic to cancel old subscriptions when new ones are created

### Issue 3: User Not Found in Webhook
**Cause**: Webhook can't link Stripe customer to database user
**Solution**: 
1. Added fallback logic to find users by email
2. Improved user creation with conflict resolution

## Monitoring and Debugging

### 1. Check Webhook Logs
Look for these log messages in your server logs:
- `"Webhook received event: checkout.session.completed"`
- `"Webhook received event: customer.subscription.created"`
- `"Subscription upserted successfully for user:"`

### 2. Test Webhook Manually
Use the testing scripts to verify webhook functionality:
```bash
# Test if webhook logic works
npx tsx scripts/test-webhook-endpoint.ts

# Check for missing subscriptions
npx tsx scripts/test-subscription-flow.ts
```

### 3. Stripe Dashboard
- Check webhook delivery logs in Stripe Dashboard
- Look for failed webhook attempts
- Verify webhook endpoint is responding correctly

## Prevention

### 1. Regular Monitoring
- Set up alerts for webhook failures
- Monitor subscription creation rates
- Check database for orphaned subscriptions

### 2. Testing
- Test webhook with test events from Stripe Dashboard
- Use the provided testing scripts regularly
- Verify new subscriptions are created correctly

### 3. Error Handling
- Implement proper error handling in webhook
- Add retry logic for failed webhook processing
- Log all webhook events for debugging

## Quick Fix for Existing Issues

If users are already experiencing subscription issues:

1. **Run the fix script**:
   ```bash
   npx tsx scripts/fix-all-missing-subscriptions.ts
   ```

2. **Verify the fix**:
   ```bash
   npx tsx scripts/test-subscription-flow.ts
   ```

3. **Test with a new subscription** to ensure webhook is working

## Support

If issues persist after following this guide:
1. Check server logs for webhook processing errors
2. Verify Stripe webhook configuration
3. Test webhook endpoint manually
4. Contact support with specific error messages
