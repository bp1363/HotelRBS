# 🚀 Telr Payment Gateway - Quick Setup Guide

## ⚠️ IMPORTANT: Payment Flow Fix Applied

The payment flow has been corrected:
- ✅ **OLD (Wrong)**: Book first → Then pay
- ✅ **NEW (Correct)**: Pay first → Then book (only if payment succeeds)

---

## 📋 Setup Steps

### Step 1: Create Environment File

Create a `.env.local` file in the project root (same directory as `package.json`):

```bash
# Telr Payment Gateway Configuration

# Test/Sandbox Environment
VITE_TELR_TEST_STORE_ID=your_test_store_id_here
VITE_TELR_TEST_AUTH_KEY=your_test_auth_key_here

# Live/Production Environment
VITE_TELR_LIVE_STORE_ID=your_live_store_id_here
VITE_TELR_LIVE_AUTH_KEY=your_live_auth_key_here

# Environment Mode (true = test, false = live)
VITE_TELR_USE_TEST_MODE=true
```

### Step 2: Get Your Telr Credentials

1. **Log into Telr Merchant Dashboard**: https://secure.telr.com/
2. Navigate to **Settings** → **API Configuration**
3. Copy your:
   - **Store ID** (test and/or live)
   - **Authentication Key** (test and/or live)
4. Paste them into `.env.local`

### Step 3: Restart Dev Server

After adding `.env.local`, **restart your development server**:

```bash
# Stop the current server (Ctrl+C)
# Then start it again:
npm run dev
```

---

## 🧪 Testing the Payment Flow

### Test Cards (Sandbox Mode)

**Successful Payment:**
```
Card Number: 4111 1111 1111 1111
CVV: 123
Expiry: 12/25 (any future date)
Name: Any name
```

**Declined Payment:**
```
Card Number: 4000 0000 0000 0002
CVV: 123
Expiry: 12/25
Name: Any name
```

### Complete Test Flow

1. **Search for a hotel** and select one
2. **Click "Reserve"** on hotel details page
   - This calls prebook API
   - Generates booking reference ID
3. **Click "Proceed to Payment"** on booking page
   - Booking modal opens (if details not filled)
4. **Fill guest details** and click "Complete Booking"
   - Guest details saved to localStorage
   - Modal closes
5. **Click "Proceed to Payment"** button
   - ✅ You should be redirected to Telr payment page
   - ❌ If you see "Telr payment gateway is not configured" → Check `.env.local`
6. **Enter test card details** on Telr page
7. **Complete payment**
8. **You'll be redirected back** to success page
9. **Booking is confirmed** (only after payment succeeds)

---

## ❌ Troubleshooting

### Error: "Telr payment gateway is not configured"

**Cause:** Environment variables not loaded or incorrect.

**Fix:**
1. Verify `.env.local` file exists in project root
2. Check variable names start with `VITE_` (required for Vite)
3. Restart dev server after creating/editing `.env.local`
4. Clear browser cache and reload

### Error: "Booking failed: Confirmation: MS-XXXXXX"

**Cause:** Old code is running (browser cache or old build).

**Fix:**
1. Hard refresh browser: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
2. Clear browser cache and localStorage:
   ```javascript
   // In browser console:
   localStorage.clear();
   location.reload();
   ```
3. Stop and restart dev server

### Payment button says "Processing..." but nothing happens

**Cause:** Telr API call is failing silently.

**Fix:**
1. Open browser console (F12)
2. Check for error messages
3. Verify `.env.local` credentials are correct
4. Check network tab for failed API calls

### Redirected to Telr but payment fails

**Cause:** Using live credentials in test mode or vice versa.

**Fix:**
1. Ensure `VITE_TELR_USE_TEST_MODE=true` for testing
2. Use **TEST** credentials, not live ones
3. Use test card numbers (not real cards)

---

## 🔍 How to Verify It's Working

### Check Console Logs

When you click "Proceed to Payment", you should see:

```
🎯 Book Now button clicked - Proceeding to Payment!
✅ Guest details found and booking reference matches
💳 Proceeding to payment (booking will be confirmed AFTER payment)
💰 Creating payment order for amount: 689.88 AED
✅ Telr order created: TELR_ORDER_123456789
🔗 Redirecting to Telr payment page...
⚠️ Booking will be confirmed ONLY after successful payment
```

### Check What Happens

1. ✅ **Correct**: Redirected to Telr payment page (external site)
2. ❌ **Wrong**: Alert saying "Booking failed..." (means old code is running)
3. ❌ **Wrong**: Error about configuration (means `.env.local` not set up)

---

## 📊 Payment Flow Diagram

```
┌─────────────────────────────────────────┐
│  1. User fills guest details            │
│     Click "Complete Booking"            │
│     ↓                                   │
│  2. Details saved to localStorage       │
│     ✅ NOT booked yet                   │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  3. Click "Proceed to Payment"          │
│     ↓                                   │
│  4. Create Telr payment order           │
│     ↓                                   │
│  5. Redirect to Telr                    │
│     (Booking page → Telr site)          │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  6. User enters card on Telr site       │
│     ↓                                   │
│  7. Payment processed                   │
│     ↓                                   │
│  8. Redirect back to your site          │
│     (Telr site → /payment/success)      │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  9. Verify payment with Telr API        │
│     ↓                                   │
│ 10. ✅ Payment confirmed                │
│     ↓                                   │
│ 11. NOW call booking API                │
│     ✅ Booking confirmed                │
│     ↓                                   │
│ 12. Show success page                   │
└─────────────────────────────────────────┘
```

---

## 🔐 Security Notes

1. **Never commit `.env.local` to git**
   - Already in `.gitignore`
   - Contains sensitive credentials

2. **Test credentials vs Live credentials**
   - Use TEST credentials for development
   - Use LIVE credentials only in production

3. **Environment variables**
   - Must start with `VITE_` to be exposed to browser
   - Restart dev server after changing

---

## ✅ Checklist

Before testing:
- [ ] Created `.env.local` file
- [ ] Added Telr test credentials
- [ ] Set `VITE_TELR_USE_TEST_MODE=true`
- [ ] Restarted dev server
- [ ] Cleared browser cache/localStorage
- [ ] Hard refreshed browser page

During testing:
- [ ] Fill guest details
- [ ] Click "Proceed to Payment"
- [ ] See console log: "Creating payment order"
- [ ] Redirected to Telr payment page
- [ ] Enter test card details
- [ ] Complete payment
- [ ] Redirected to success page
- [ ] Booking confirmed after payment

---

## 📞 Still Having Issues?

1. **Check browser console** for error messages
2. **Check network tab** for failed API calls
3. **Verify credentials** in Telr dashboard
4. **Try in incognito mode** to rule out cache issues
5. **Check Telr dashboard** for test mode settings

---

## 🎯 Expected Behavior

### ✅ Correct Flow:
```
Fill Details → Pay on Telr → Booking Confirmed (after payment)
```

### ❌ Old (Wrong) Flow:
```
Fill Details → Booking Confirmed → Pay on Telr
```

If you see the old flow, clear cache and restart server!

---

*Last Updated: October 27, 2025*  
*Payment Flow: CORRECTED ✅*

