import type { User } from '../entities/user.entity';

export interface AuthRepository {
  signIn(email: string, password: string): Promise<User>;

  signUp(email: string, password: string): Promise<User>;

  signOut(): Promise<void>;

  getCurrentUser(): Promise<User | null>;

  onAuthStateChange(callback: (user: User | null) => void): () => void;

  updateUserProfile(uid: string, displayName: string): Promise<void>;
}

