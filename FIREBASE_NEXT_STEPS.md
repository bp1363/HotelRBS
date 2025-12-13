# Firebase Configuration - Next Steps

Since Google Authentication is already enabled in your Firebase project, follow these steps:

## Step 1: Get Your Firebase Configuration

1. In Firebase Console, click the **gear icon (⚙️)** next to "Project Overview" (top left)
2. Select **Project settings**
3. Scroll down to the **"Your apps"** section
4. If you don't have a web app yet:
   - Click the **Web icon (`</>`)** to add a web app
   - Register your app with a nickname (e.g., "Liveflow Web")
   - Click **Register app**
5. You'll see your Firebase configuration object that looks like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};
```

## Step 2: Add Configuration to .env File

1. Create or edit the `.env` file in the root directory of your project
2. Add these lines with your actual Firebase values:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
```

**Important:** Replace the placeholder values with your actual Firebase configuration values!

## Step 3: Add Authorized Domains

1. In Firebase Console, go to **Authentication** > **Settings**
2. Scroll to **Authorized domains**
3. Make sure `localhost` is in the list (it should be there by default)
4. If not, click **Add domain** and add `localhost`

## Step 4: Restart Your Development Server

After adding the environment variables:

```bash
# Stop your current dev server (Ctrl+C)
# Then restart it
npm run dev
```

## Step 5: Test Google Sign-In

1. Open your app in the browser (http://localhost:3000)
2. Navigate to a login/signup form
3. You should see a "Continue with Google" button
4. Click it and test the Google sign-in flow

## Troubleshooting

### If you see "Firebase: Error (auth/unauthorized-domain)"
- Make sure `localhost` is in the authorized domains list
- Check that you're accessing the app via `localhost` (not `127.0.0.1`)

### If the Google button doesn't appear
- Check browser console for errors
- Verify all environment variables are set correctly
- Make sure you restarted the dev server after adding .env variables

### If you see "Firebase: Error (auth/popup-blocked)"
- Your browser blocked the popup - allow popups for localhost

## Quick Reference

Your Firebase config values are located at:
- **Firebase Console** → **Project Settings** → **Your apps** → **Web app**

The values you need:
- `apiKey` → `VITE_FIREBASE_API_KEY`
- `authDomain` → `VITE_FIREBASE_AUTH_DOMAIN`
- `projectId` → `VITE_FIREBASE_PROJECT_ID`
- `storageBucket` → `VITE_FIREBASE_STORAGE_BUCKET`
- `messagingSenderId` → `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `appId` → `VITE_FIREBASE_APP_ID`

