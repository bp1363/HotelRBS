# 🚀 Quick Start - Telr Payment Gateway (CORS Fixed!)

## ✅ CORS Error Fixed!

The payment integration now uses a **backend proxy** to avoid CORS errors.

---

## 📋 Setup Steps (2 minutes)

### 1. Create Backend `.env` File

In the `backend/` folder, create a file named `.env`:

```bash
cd backend
nano .env
```

Add this content:

```env
# Telr Test Credentials
TELR_TEST_STORE_ID=your_test_store_id_here
TELR_TEST_AUTH_KEY=your_test_auth_key_here

# Telr Live Credentials (leave empty for now)
TELR_LIVE_STORE_ID=
TELR_LIVE_AUTH_KEY=

# Mode
TELR_USE_TEST_MODE=true
```

**Important:** Replace `your_test_store_id_here` and `your_test_auth_key_here` with your actual Telr credentials.

### 2. Start Backend

```bash
cd backend
python app.py
```

You should see:
```
✅ Telr API proxy blueprint registered
✅ Telr webhook blueprint registered
Starting Hotel Booking Backend Server...
```

Backend runs on: `http://localhost:5001`

### 3. Start Frontend

In a new terminal:

```bash
cd /Users/utsavgautam/Downloads/MOBILEVIEW-main/MOBILEVIEW-main
npm run dev
```

Frontend runs on: `http://localhost:8084`

### 4. Clear Browser Cache

**Important!** Clear old cached code:

- **Chrome/Edge:** `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
- **Or clear localStorage:**
  ```javascript
  // In browser console (F12):
  localStorage.clear();
  location.reload();
  ```

---

## 🧪 Test Payment Flow

1. **Search** for a hotel
2. **Reserve** a room
3. **Fill** guest details
4. **Click** "Proceed to Payment"
5. ✅ **Should redirect to Telr** (no CORS error!)

---

## 🔍 Verify It's Working

### Check Browser Console (F12):

You should see:
```
🔐 Creating Telr payment order via backend proxy...
💰 Amount: 340.46 USD
✅ Telr order created successfully
📋 Order Reference: TELR_XXX
🔗 Payment URL: https://secure.telr.com/...
```

### What You Should NOT See:
```
❌ Access to fetch at 'https://secure.telr.com...' has been blocked by CORS
```

---

## 🎯 How It Works Now

### Old (❌ CORS Error):
```
Browser → Telr API (direct) ❌ BLOCKED
```

### New (✅ No CORS):
```
Browser → Backend Proxy → Telr API ✅ SUCCESS
```

**Benefits:**
- ✅ No CORS errors
- ✅ Credentials secured on backend
- ✅ Better error handling
- ✅ Production-ready

---

## ⚙️ Where Are Credentials Now?

| Location | Before | After |
|----------|--------|-------|
| **Frontend `.env.local`** | ✅ Required | ❌ Not needed |
| **Backend `.env`** | ❌ Not used | ✅ **Required** |

**Security:** Credentials are now **only on the backend**, never exposed to browser.

---

## 🐛 Troubleshooting

### "Failed to fetch" or Network Error

**Problem:** Backend not running

**Fix:**
```bash
cd backend
python app.py
```

### Still Getting CORS Error

**Problem:** Old code cached in browser

**Fix:**
1. Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
2. Clear cache
3. Restart dev server

### "Telr payment gateway is not configured"

**Problem:** Backend `.env` file missing or empty

**Fix:**
1. Check `backend/.env` exists
2. Verify credentials are filled in
3. Restart backend server

---

## 📝 Test Cards (Sandbox)

**Successful Payment:**
```
Card: 4111 1111 1111 1111
CVV: 123
Expiry: 12/25
```

**Declined Payment:**
```
Card: 4000 0000 0000 0002
CVV: 123
Expiry: 12/25
```

---

## ✅ Quick Checklist

Before testing:
- [ ] Backend `.env` file created with Telr credentials
- [ ] Backend server running on `localhost:5001`
- [ ] Frontend server running on `localhost:8084`
- [ ] Browser cache cleared
- [ ] localStorage cleared

During test:
- [ ] Click "Proceed to Payment"
- [ ] **NO CORS error** in console ✅
- [ ] See "via backend proxy" message ✅
- [ ] Redirected to Telr payment page ✅

---

## 📞 Need Help?

1. Check backend terminal for errors
2. Check browser console (F12) for errors
3. Verify `.env` file has correct credentials
4. Restart both servers

---

## 🎉 Success!

If everything works:
- ✅ No CORS errors
- ✅ Payment redirect works
- ✅ Booking confirmed after payment

You're ready to process payments! 🚀

---

*Last Updated: October 27, 2025*  
*CORS Issue: FIXED ✅*

