import { useState, useEffect } from 'react';
import { onAuthStateChange, getCurrentFirebaseUser, convertFirebaseUserToAppUser, signOutFromFirebase } from '@/services/firebaseAuth';
import type { User as FirebaseUser } from 'firebase/auth';

export interface UserData {
  customer_id: string;
  first_name: string;
  last_name: string;
  email: string;
  age?: number;
  gender?: string;
  nationality?: string;
  phone?: string;
  profile_url?: string;
  created_at?: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load user data from localStorage on mount
    const loadUserData = () => {
      try {
        const userDataString = localStorage.getItem('userData');
        if (userDataString) {
          const userData: UserData = JSON.parse(userDataString);
          setUser(userData);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        setUser(null);
        setIsAuthenticated(false);
      }
    };

    loadUserData();

    // Listen to Firebase auth state changes
    const unsubscribe = onAuthStateChange((firebaseUser) => {
      setIsLoading(false);
      setFirebaseUser(firebaseUser);

      if (firebaseUser) {
        // Convert Firebase user to app user format
        const appUser = convertFirebaseUserToAppUser(firebaseUser);
        setUser(appUser);
        setIsAuthenticated(true);
        // Save to localStorage for consistency
        localStorage.setItem('userData', JSON.stringify(appUser));
        localStorage.setItem('firebaseUser', 'true');
      } else {
        // Check if we have localStorage user data (non-Firebase auth)
        const userDataString = localStorage.getItem('userData');
        if (!userDataString) {
          setUser(null);
          setIsAuthenticated(false);
          localStorage.removeItem('firebaseUser');
        }
      }
    });

    // Listen for storage changes (for multi-tab support)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'userData') {
        loadUserData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      unsubscribe();
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const logout = async () => {
    try {
      // Sign out from Firebase if user is authenticated via Firebase
      if (firebaseUser || localStorage.getItem('firebaseUser')) {
        await signOutFromFirebase();
      }
    } catch (error) {
      console.error('Error signing out from Firebase:', error);
    }

    // Clear all auth data
    localStorage.removeItem('userData');
    localStorage.removeItem('authToken');
    localStorage.removeItem('booking_reference_id');
    localStorage.removeItem('firebaseUser');
    
    setUser(null);
    setIsAuthenticated(false);
    setFirebaseUser(null);
  };

  const updateUser = (userData: UserData) => {
    localStorage.setItem('userData', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    firebaseUser,
    logout,
    updateUser,
  };
};
