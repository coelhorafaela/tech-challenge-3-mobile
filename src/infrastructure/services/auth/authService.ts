import {
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    type User,
} from 'firebase/auth';
import { getFirebaseAuth } from '../config/firebase';

export const signIn = async (email: string, password: string) => {
  const auth = getFirebaseAuth();
  return await signInWithEmailAndPassword(auth, email, password);
};

export const signUp = async (email: string, password: string) => {
  const auth = getFirebaseAuth();
  return await createUserWithEmailAndPassword(auth, email, password);
};

export const signOut = async () => {
  const auth = getFirebaseAuth();
  return await firebaseSignOut(auth);
};

export const getCurrentUser = (): User | null => {
  try {
    const auth = getFirebaseAuth();
    return auth.currentUser;
  } catch {
    return null;
  }
};

export const onAuthStateChange = (callback: (user: User | null) => void) => {
  const auth = getFirebaseAuth();
  return onAuthStateChanged(auth, callback);
};

