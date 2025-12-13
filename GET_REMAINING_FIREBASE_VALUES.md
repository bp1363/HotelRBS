# Get Remaining Firebase Values

You need to complete your `.env` file with two more values:

## Missing Values:
1. `VITE_FIREBASE_MESSAGING_SENDER_ID`
2. `VITE_FIREBASE_APP_ID`

## How to Get Them:

1. **In the Firebase Console**, scroll down in the code block where you see the `firebaseConfig` object
2. Look for these two properties:
   - `messagingSenderId: "123456789012"` (a number)
   - `appId: "1:123456789012:web:abcdef1234567890"` (a string)

3. **Copy those values** and update your `.env` file:
   - Replace `your_messaging_sender_id` with the actual `messagingSenderId` value
   - Replace `your_app_id` with the actual `appId` value

## Quick Edit:

You can edit the `.env` file directly, or run this command (replace with your actual values):

```bash
# Edit .env file
nano .env
# or
code .env
```

Then update these two lines:
```
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
```

## After Updating:

1. Save the `.env` file
2. **Restart your development server** (important!)
3. Test the Google sign-in button

