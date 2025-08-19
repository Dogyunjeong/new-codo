import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  Auth,
  initializeAuth,
  getReactNativePersistence,
  connectAuthEmulator
} from 'firebase/auth';
import { 
  getFirestore, 
  Firestore,
  connectFirestoreEmulator 
} from 'firebase/firestore';
import { 
  getStorage, 
  FirebaseStorage,
  connectStorageEmulator 
} from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirebaseConfig, isDevelopment } from '../../config/firebase.config';

/**
 * Firebase app instance
 */
let firebaseApp: FirebaseApp;

/**
 * Firebase auth instance
 */
let firebaseAuth: Auth;

/**
 * Firestore instance (optional, for future use)
 */
let firestore: Firestore | null = null;

/**
 * Firebase storage instance (optional, for future use)
 */
let storage: FirebaseStorage | null = null;

/**
 * Initialize Firebase with v9+ modular SDK
 */
export const initializeFirebase = (): FirebaseApp => {
  try {
    const firebaseConfig = getFirebaseConfig();
    
    // Check if Firebase is already initialized
    if (getApps().length === 0) {
      console.log('Initializing Firebase app...');
      firebaseApp = initializeApp(firebaseConfig);
      
      // Initialize Auth with React Native persistence
      firebaseAuth = initializeAuth(firebaseApp, {
        persistence: getReactNativePersistence(AsyncStorage)
      });
      
      // Connect to emulators in development
      if (isDevelopment() && __DEV__) {
        // Uncomment these lines if you're using Firebase emulators locally
        // connectAuthEmulator(firebaseAuth, 'http://localhost:9099', { disableWarnings: true });
        // if (firestore) connectFirestoreEmulator(firestore, 'localhost', 8080);
        // if (storage) connectStorageEmulator(storage, 'localhost', 9199);
        console.log('Firebase initialized in development mode');
      }
    } else {
      console.log('Firebase already initialized, using existing app');
      firebaseApp = getApp();
      firebaseAuth = getAuth(firebaseApp);
    }
    
    return firebaseApp;
  } catch (error) {
    console.error('Error initializing Firebase:', error);
    throw error;
  }
};

/**
 * Get Firebase app instance
 */
export const getFirebaseApp = (): FirebaseApp => {
  if (!firebaseApp) {
    return initializeFirebase();
  }
  return firebaseApp;
};

/**
 * Get Firebase auth instance
 */
export const getFirebaseAuth = (): Auth => {
  if (!firebaseAuth) {
    initializeFirebase();
  }
  return firebaseAuth;
};

/**
 * Get Firestore instance (lazy initialization)
 */
export const getFirestoreInstance = (): Firestore => {
  if (!firestore) {
    const app = getFirebaseApp();
    firestore = getFirestore(app);
  }
  return firestore;
};

/**
 * Get Storage instance (lazy initialization)
 */
export const getStorageInstance = (): FirebaseStorage => {
  if (!storage) {
    const app = getFirebaseApp();
    storage = getStorage(app);
  }
  return storage;
};

/**
 * Check if Firebase is initialized
 */
export const isFirebaseInitialized = (): boolean => {
  return getApps().length > 0;
};

/**
 * Sign out and clean up Firebase instances
 */
export const cleanupFirebase = async (): Promise<void> => {
  try {
    if (firebaseAuth) {
      await firebaseAuth.signOut();
    }
    // Note: We don't delete the app as it might be used elsewhere
    console.log('Firebase cleanup completed');
  } catch (error) {
    console.error('Error during Firebase cleanup:', error);
  }
};

// Initialize Firebase when this module is imported
// This ensures Firebase is ready when the app starts
if (!isFirebaseInitialized()) {
  initializeFirebase();
}