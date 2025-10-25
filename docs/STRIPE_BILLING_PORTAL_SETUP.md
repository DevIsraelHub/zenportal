# 🔧 Stripe Billing Portal Setup Guide

## 🎯 **Issue Identified**

The billing portal error `{}` was caused by **missing Stripe billing portal configuration**. Stripe requires you to set up a billing portal configuration before you can create billing portal sessions.

## ✅ **Solution**

You need to configure the Stripe billing portal in your Stripe Dashboard.

### 📋 **Step-by-Step Setup**

1. **Go to Stripe Dashboard:**
   - Visit: https://dashboard.stripe.com/test/settings/billing/portal
   - Make sure you're in **Test Mode** (toggle in top-left)

2. **Configure Billing Portal:**
   - Click **"Activate test link"** or **"Create configuration"**
   - Set up the following settings:

   **Business Information:**
   - Business name: `ZenPortal` (or your app name)
   - Support email: Your support email
   - Support phone: Optional

   **Features to Enable:**
   - ✅ **Update payment methods** - Allow customers to update cards
   - ✅ **View billing history** - Show past invoices
   - ✅ **Cancel subscription** - Allow subscription cancellation
   - ✅ **Update billing information** - Change billing address
   - ✅ **Proration settings** - Handle plan changes

   **Branding:**
   - Upload your logo (optional)
   - Choose colors that match your brand

3. **Save Configuration:**
   - Click **"Save configuration"**
   - The portal is now active for test mode

### 🧪 **Testing the Fix**

After setting up the billing portal:

1. **Restart your development server:**
   ```bash
   npm run dev
   ```

2. **Test the billing portal:**
   - Go to `/dashboard/billing`
   - Click "Manage Billing" button
   - Should redirect to Stripe billing portal

3. **Debug if needed:**
   ```bash
   npm run debug-billing-portal
   ```

### 🔍 **What Was Fixed**

**Before:** Empty error object `{}` because Stripe couldn't create billing portal sessions without configuration.

**After:** Proper error handling with user-friendly messages and working billing portal.

### 📱 **Enhanced Error Handling**

The billing page now shows helpful error messages:
- **Configuration missing:** "Billing portal is not configured. Please set up your Stripe billing portal configuration in the Stripe Dashboard."
- **Other errors:** Shows the actual error message
- **Network errors:** "Failed to open billing portal. Please try again."

### 🛠️ **Available Debug Tools**

```bash
npm run debug-billing-portal    # Test billing portal creation
npm run validate-env           # Check environment variables
npm run debug-subscription     # Check subscription status
```

### 🎉 **Expected Results**

After setup:
- ✅ Billing portal button works
- ✅ Redirects to Stripe billing portal
- ✅ Customers can manage their subscriptions
- ✅ No more empty error objects

### 📝 **Production Setup**

For production:
1. Switch to **Live Mode** in Stripe Dashboard
2. Repeat the same configuration steps
3. Update your environment variables to use live keys
4. Test with real subscriptions

The billing portal will now work perfectly! 🚀
