import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
  updateProfile as firebaseUpdateProfile
} from 'firebase/auth';
import { auth } from './firebase';
import { userProfileOperations, UserProfile } from './firestore';

export interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
}

// Auth service class
export class AuthService {
  private static instance: AuthService;
  private authStateListeners: ((state: AuthState) => void)[] = [];
  private currentState: AuthState = {
    user: null,
    profile: null,
    loading: true,
    error: null,
  };

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  constructor() {
    this.initializeAuthListener();
  }

  private initializeAuthListener() {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Load user profile from Firestore
          let profile = await userProfileOperations.getUserProfile(user.uid);
          
          // If profile doesn't exist, create a default one
          if (!profile) {
            const defaultProfile: Omit<UserProfile, 'uid' | 'createdAt' | 'updatedAt'> = {
              email: user.email || '',
              displayName: user.displayName || user.email?.split('@')[0] || 'User',
              role: 'admin', // Set to admin for demo purposes
              photoURL: user.photoURL || null,
            };
            
            try {
              await userProfileOperations.createUserProfile(user.uid, defaultProfile);
              profile = await userProfileOperations.getUserProfile(user.uid);
            } catch (profileError) {
              console.warn('Error creating user profile, using default:', profileError);
              // Create a fallback profile if Firestore is unavailable
              profile = {
                uid: user.uid,
                email: user.email || '',
                displayName: user.displayName || user.email?.split('@')[0] || 'User',
                role: 'admin', // Give admin role by default in offline mode
                createdAt: new Date(),
                updatedAt: new Date(),
                photoURL: user.photoURL || null,
              };
            }
          }

          this.updateState({
            user,
            profile,
            loading: false,
            error: null,
          });
        } catch (error) {
          console.error('Error loading user profile:', error);
          
          // Create a fallback profile if Firestore is unavailable
          const fallbackProfile: UserProfile = {
            uid: user.uid,
            email: user.email || '',
            displayName: user.displayName || user.email?.split('@')[0] || 'User',
            role: 'admin', // Give admin role by default in offline mode
            createdAt: new Date(),
            updatedAt: new Date(),
            photoURL: user.photoURL || null,
          };
          
          this.updateState({
            user,
            profile: fallbackProfile,
            loading: false,
            error: 'Failed to load user profile from database. Using offline mode.',
          });
        }
      } else {
        this.updateState({
          user: null,
          profile: null,
          loading: false,
          error: null,
        });
      }
    });
  }

  private updateState(newState: Partial<AuthState>) {
    this.currentState = { ...this.currentState, ...newState };
    this.authStateListeners.forEach(listener => listener(this.currentState));
  }

  subscribe(listener: (state: AuthState) => void): () => void {
    this.authStateListeners.push(listener);
    // Immediately call with current state
    listener(this.currentState);
    
    // Return unsubscribe function
    return () => {
      this.authStateListeners = this.authStateListeners.filter(l => l !== listener);
    };
  }

  getCurrentState(): AuthState {
    return this.currentState;
  }

  async signIn(email: string, password: string): Promise<void> {
    try {
      this.updateState({ loading: true, error: null });
      
      // For demo purposes, create a mock user without actually calling Firebase
      if (email === 'demo@clientflow.com' && password === 'demo123') {
        // Sign in with Firebase
        await signInWithEmailAndPassword(auth, email, password)
          .catch(async () => {
            // If the user doesn't exist, create it
            await createUserWithEmailAndPassword(auth, email, password);
            
            // Update profile
            if (auth.currentUser) {
              await firebaseUpdateProfile(auth.currentUser, {
                displayName: 'Demo User'
              });
              
              // Create user profile in Firestore
              await userProfileOperations.createUserProfile(auth.currentUser.uid, {
                email: 'demo@clientflow.com',
                displayName: 'Demo User',
                role: 'admin',
                photoURL: null,
                company: 'ClientFlow Demo',
                phone: '+1 (555) 123-4567',
              });
            }
          });
        
        return;
      }

      // For other credentials, try actual Firebase auth
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      console.error("Sign in error:", error);
      this.updateState({ 
        loading: false, 
        error: error.message || 'Failed to sign in' 
      });
      throw error;
    }
  }

  async signUp(email: string, password: string, displayName: string): Promise<void> {
    try {
      this.updateState({ loading: true, error: null });
      
      // Create user with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile
      await firebaseUpdateProfile(userCredential.user, {
        displayName
      });
      
      // Create user profile in Firestore
      await userProfileOperations.createUserProfile(userCredential.user.uid, {
        email,
        displayName,
        role: 'admin', // Set to admin for demo purposes
        photoURL: null,
      });
    } catch (error: any) {
      console.error("Sign up error:", error);
      this.updateState({ 
        loading: false, 
        error: error.message || 'Failed to sign up' 
      });
      throw error;
    }
  }

  async signOut(): Promise<void> {
    try {
      await firebaseSignOut(auth);
      
      this.updateState({
        user: null,
        profile: null,
        loading: false,
        error: null,
      });
    } catch (error: any) {
      console.error('Error signing out:', error);
      throw error;
    }
  }

  async updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<void> {
    try {
      await userProfileOperations.updateUserProfile(uid, updates);
      
      // If the current user is being updated, update the state
      if (this.currentState.profile && this.currentState.profile.uid === uid) {
        const updatedProfile = await userProfileOperations.getUserProfile(uid);
        this.updateState({
          profile: updatedProfile,
        });
      }
      
      // If displayName is being updated, also update Firebase Auth profile
      if (updates.displayName && auth.currentUser && auth.currentUser.uid === uid) {
        await firebaseUpdateProfile(auth.currentUser, {
          displayName: updates.displayName
        });
      }
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw new Error('Failed to update user profile');
    }
  }

  // Permission helpers
  canViewAllLeads(profile: UserProfile | null): boolean {
    return profile?.role === 'admin';
  }

  canEditLead(profile: UserProfile | null, leadOwnerId: string): boolean {
    if (!profile) return false;
    return profile.role === 'admin' || profile.uid === leadOwnerId;
  }

  canDeleteLead(profile: UserProfile | null, leadOwnerId: string): boolean {
    if (!profile) return false;
    return profile.role === 'admin' || profile.uid === leadOwnerId;
  }

  canConvertLead(profile: UserProfile | null): boolean {
    if (!profile) return false;
    return ['admin', 'closer', 'agent'].includes(profile.role);
  }

  canCreateLead(profile: UserProfile | null): boolean {
    if (!profile) return false;
    return ['admin', 'closer', 'agent', 'setter'].includes(profile.role);
  }

  canViewClients(profile: UserProfile | null): boolean {
    if (!profile) return false;
    return ['admin', 'closer', 'agent'].includes(profile.role);
  }
}

// Export singleton instance
export const authService = AuthService.getInstance();

// Helper function to get current user ID
export const getCurrentUserId = (): string => {
  const state = authService.getCurrentState();
  return state.user?.uid || '';
};

// Helper function to get current user profile
export const getCurrentUserProfile = (): UserProfile | null => {
  const state = authService.getCurrentState();
  return state.profile;
};