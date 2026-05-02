import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc,
  updateDoc
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: 'citizen' | 'official' | 'admin';
  city?: string;
  trustScore: number;
}

const provider = new GoogleAuthProvider();

export const loginWithGoogle = async (initialRole: UserProfile['role'] = 'citizen') => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    
    // Check if user profile exists
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      // Create profile with selected role
      const newProfile: UserProfile = {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || 'Anonymous User',
        role: initialRole,
        trustScore: 10,
      };
      await setDoc(userRef, newProfile);
      return newProfile;
    }
    
    const existing = userSnap.data() as UserProfile;
    // For prototype convenience: allow switching between primary roles
    if (existing.role !== initialRole && initialRole !== 'admin') {
      try {
        await updateDoc(userRef, { role: initialRole });
        existing.role = initialRole;
      } catch (e) {
        console.warn("Could not sync role to Firestore, possibly rule restricted:", e);
      }
    }
    
    return existing;
  } catch (error) {
    console.error("Login failed:", error);
    throw error;
  }
};

export const logout = () => signOut(auth);

export const subscribeToAuth = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  return userSnap.exists() ? (userSnap.data() as UserProfile) : null;
};
