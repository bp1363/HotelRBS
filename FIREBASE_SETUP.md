# Firebase Google Authentication Setup Guide

This guide will help you set up Google authentication using Firebase for the Liveflow project.

## Prerequisites

- A Google account
- A Firebase project

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Follow the setup wizard to create your project

## Step 2: Enable Google Authentication

1. In your Firebase project, go to **Authentication** in the left sidebar
2. Click **Get started** (if you haven't enabled it yet)
3. Go to the **Sign-in method** tab
4. Click on **Google** from the list of providers
5. Toggle **Enable** to ON
6. Enter your project support email
7. Click **Save**

## Step 3: Register Your Web App

1. In Firebase Console, click the gear icon ⚙️ next to "Project Overview"
2. Select **Project settings**
3. Scroll down to "Your apps" section
4. Click the **Web** icon (`</>`) to add a web app
5. Register your app with a nickname (e.g., "Liveflow Web")
6. Copy the Firebase configuration object

## Step 4: Configure Environment Variables

1. Create a `.env` file in the root directory (if it doesn't exist)
2. Add your Firebase configuration:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

Replace the placeholder values with your actual Firebase configuration values.

## Step 5: Configure Authorized Domains

1. In Firebase Console, go to **Authentication** > **Settings**
2. Scroll to **Authorized domains**
3. Add your local development domain: `localhost`
4. Add your production domain when ready

## Step 6: Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to the login page
3. Click "Continue with Google"
4. You should see the Google sign-in popup
5. After signing in, you should be authenticated

## Features

- ✅ Google Sign-In button in login forms
- ✅ Google Sign-In button in signup forms
- ✅ Automatic user sync with backend API
- ✅ Firebase authentication state management
- ✅ Seamless integration with existing auth system

## Troubleshooting

### "Firebase: Error (auth/unauthorized-domain)"
- Make sure you've added your domain to the authorized domains list in Firebase Console

### "Firebase: Error (auth/popup-closed-by-user)"
- User closed the popup window - this is normal behavior

### "Firebase: Error (auth/popup-blocked)"
- Browser blocked the popup - ask user to allow popups for your site

### Configuration not loading
- Make sure your `.env` file is in the root directory
- Restart your development server after adding environment variables
- Check that all environment variables start with `VITE_` prefix

## Security Notes

- Never commit your `.env` file to version control
- The `.env` file is already in `.gitignore`
- Firebase API keys are safe to expose in client-side code (they're public)
- Firebase security rules protect your backend resources

## Next Steps

After setting up Firebase:

1. Configure Firebase Security Rules for your database (if using Firestore)
2. Set up user profile management
3. Configure email verification (optional)
4. Add additional authentication providers if needed

