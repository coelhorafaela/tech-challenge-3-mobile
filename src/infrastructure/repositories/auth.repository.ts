import {
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut, updateProfile as firebaseUpdateProfile, onAuthStateChanged,
    signInWithEmailAndPassword,
    type User as FirebaseUser
} from 'firebase/auth';
import { AuthMapper } from '../../application/mappers/auth.mapper';
import type { User } from '../../domain/entities/user.entity';
import type { AuthRepository as IAuthRepository } from '../../domain/repositories/auth.repository';
import { getFirebaseAuth } from '../../services/config/firebase';

export class AuthRepository implements IAuthRepository {
  async signIn(email: string, password: string): Promise<User> {
    const auth = getFirebaseAuth();
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return AuthMapper.fromFirebaseUser(userCredential.user);
  }

  async signUp(email: string, password: string): Promise<User> {
    const auth = getFirebaseAuth();
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return AuthMapper.fromFirebaseUser(userCredential.user);
  }

  async signOut(): Promise<void> {
    const auth = getFirebaseAuth();
    await firebaseSignOut(auth);
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const auth = getFirebaseAuth();
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) {
        return null;
      }
      return AuthMapper.fromFirebaseUser(firebaseUser);
    } catch {
      return null;
    }
  }

  onAuthStateChange(callback: (user: User | null) => void): () => void {
    const auth = getFirebaseAuth();
    return onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        callback(AuthMapper.fromFirebaseUser(firebaseUser));
      } else {
        callback(null);
      }
    });
  }

  async updateUserProfile(uid: string, displayName: string): Promise<void> {
    const auth = getFirebaseAuth();
    const user = auth.currentUser;
    if (!user || user.uid !== uid) {
      throw new Error('Usuário não encontrado');
    }
    await firebaseUpdateProfile(user, { displayName });
  }
}

