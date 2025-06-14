import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { getAnalytics, isSupported } from 'firebase/analytics';

// Firebase configuration from provided values
const firebaseConfig = {
  apiKey: "AIzaSyDKUyzoZ2nt7LZ3nduz3tEKwDb1BnwfaEM",
  authDomain: "saas-645e8.firebaseapp.com",
  databaseURL: "https://saas-645e8-default-rtdb.firebaseio.com",
  projectId: "saas-645e8",
  storageBucket: "saas-645e8.firebasestorage.app",
  messagingSenderId: "325128758147",
  appId: "1:325128758147:web:9e7b809b281dd76cda8cb6",
  measurementId: "G-W4CVH886ZG"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

// Initialize Analytics if supported
export const analytics = isSupported().then(yes => yes ? getAnalytics(app) : null);

// Track emulator connection status
let emulatorsConnected = false;

// Connect to emulators in development mode
if (import.meta.env.DEV) {
  // Check environment variable to determine if emulators should be used
  const useEmulators = import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true';
  
  if (useEmulators && !emulatorsConnected) {
    try {
      connectFirestoreEmulator(db, 'localhost', 8080);
      connectAuthEmulator(auth, 'http://localhost:9099');
      connectStorageEmulator(storage, 'localhost', 9199);
      connectFunctionsEmulator(functions, 'localhost', 5001);
      emulatorsConnected = true;
      console.log('✅ Connected to Firebase emulators');
    } catch (error) {
      console.warn('⚠️ Failed to connect to Firebase emulators:', error);
      console.log('💡 Make sure to run "firebase emulators:start" in your project root');
    }
  } else if (!useEmulators) {
    console.log('🔥 Using production Firebase services');
  }
}