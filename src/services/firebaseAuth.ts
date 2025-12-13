import {
  signInWithPopup,
  signOut,
  User as FirebaseUser,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth, googleProvider } from '@/config/firebase';
import { loginCustomer, signupCustomer } from './authApi';

export interface FirebaseAuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

/**
 * Sign in with Google using Firebase
 */
export const signInWithGoogle = async (): Promise<FirebaseAuthUser> => {
  try {
    console.log('🔐 Starting Google sign-in...');
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    console.log('✅ Google sign-in successful:', user.email);

    // Extract user information
    const firebaseUser: FirebaseAuthUser = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
    };

    // Try to sync with backend API
    try {
      const nameParts = user.displayName?.split(' ') || ['', ''];
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      // Try to login first (in case user already exists)
      try {
        const loginResponse = await loginCustomer(user.email || '', 'google_oauth');
        console.log('✅ User exists in backend, logged in:', loginResponse);
      } catch (loginError) {
        // If login fails, try to signup
        console.log('ℹ️ User not found, attempting signup...');
        try {
          const signupResponse = await signupCustomer({
            first_name: firstName,
            last_name: lastName,
            email: user.email || '',
            password: 'google_oauth', // Placeholder password for OAuth users
            age: 25, // Default age, can be updated later
            nationality: 'Unknown',
            gender: 'Other',
            phone: '',
            profile_url: user.photoURL || undefined,
          });
          console.log('✅ New user created in backend:', signupResponse);
        } catch (signupError) {
          console.warn('⚠️ Could not sync with backend, but Firebase auth succeeded:', signupError);
        }
      }
    } catch (backendError) {
      console.warn('⚠️ Backend sync failed, but Firebase auth succeeded:', backendError);
    }

    return firebaseUser;
  } catch (error: any) {
    console.error('❌ Google sign-in error:', error);
    throw new Error(error.message || 'Failed to sign in with Google');
  }
};

/**
 * Sign out from Firebase
 */
export const signOutFromFirebase = async (): Promise<void> => {
  try {
    await signOut(auth);
    console.log('✅ Signed out successfully');
  } catch (error: any) {
    console.error('❌ Sign out error:', error);
    throw new Error(error.message || 'Failed to sign out');
  }
};

/**
 * Get current Firebase user
 */
export const getCurrentFirebaseUser = (): FirebaseUser | null => {
  return auth.currentUser;
};

/**
 * Listen to auth state changes
 */
export const onAuthStateChange = (
  callback: (user: FirebaseUser | null) => void
) => {
  return onAuthStateChanged(auth, callback);
};

/**
 * Convert Firebase user to app user format
 */
export const convertFirebaseUserToAppUser = (
  firebaseUser: FirebaseUser
): {
  customer_id: string;
  first_name: string;
  last_name: string;
  email: string;
  profile_url?: string;
} => {
  const nameParts = firebaseUser.displayName?.split(' ') || ['User', ''];
  const firstName = nameParts[0] || 'User';
  const lastName = nameParts.slice(1).join(' ') || '';

  return {
    customer_id: firebaseUser.uid,
    first_name: firstName,
    last_name: lastName,
    email: firebaseUser.email || '',
    profile_url: firebaseUser.photoURL || undefined,
  };
};

