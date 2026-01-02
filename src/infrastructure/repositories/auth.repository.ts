import { CURRENT_USER_KEY } from '../../constants';
import type { User } from '../../domain/entities/user.entity';
import type { AuthRepository as IAuthRepository } from '../../domain/repositories/auth.repository';
import { passwordHashService } from '../services/crypto';
import { rateLimiter } from '../services/rate-limiter';
import { secureStorage } from '../services/storage';
import { SQLiteDatabase } from '../services/config/sqlite';

export class AuthRepository implements IAuthRepository {
  private authStateListeners: Array<(user: User | null) => void> = [];

  async signIn(email: string, password: string): Promise<User> {
    const rateLimitCheck = await rateLimiter.checkRateLimit(email);
    
    if (!rateLimitCheck.allowed) {
      if (rateLimitCheck.blockedUntil) {
        const blockedUntilDate = new Date(rateLimitCheck.blockedUntil);
        const minutesRemaining = Math.ceil((rateLimitCheck.blockedUntil - Date.now()) / 60000);
        throw new Error(`Muitas tentativas de login. Tente novamente em ${minutesRemaining} minuto(s).`);
      }
      throw new Error('Muitas tentativas de login. Tente novamente mais tarde.');
    }

    const db = await SQLiteDatabase.getInstance();
    
    const user = await db.getFirstAsync<{
      id: string;
      email: string;
      name: string;
      password: string;
      created_at: number;
    }>('SELECT * FROM users WHERE email = ?', [email]);

    if (!user) {
      await rateLimiter.recordAttempt(email);
      throw new Error('Credenciais inválidas');
    }

    const isPasswordValid = await passwordHashService.verifyPassword(password, user.password);
    
    if (!isPasswordValid) {
      await rateLimiter.recordAttempt(email);
      throw new Error('Credenciais inválidas');
    }

    await rateLimiter.resetRateLimit(email);

    const authenticatedUser: User = {
      uid: user.id,
      email: user.email,
      displayName: user.name,
      emailVerified: false,
    };

    await secureStorage.setItem(CURRENT_USER_KEY, JSON.stringify(authenticatedUser));

    this.authStateListeners.forEach(listener => listener(authenticatedUser));

    return authenticatedUser;
  }

  async signUp(email: string, password: string): Promise<User> {
    const db = await SQLiteDatabase.getInstance();

    const existingUser = await db.getFirstAsync<{ id: string }>(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUser) {
      throw new Error('Email já cadastrado');
    }

    const userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const createdAt = Date.now();
    const hashedPassword = await passwordHashService.hashPassword(password);

    await db.runAsync(
      'INSERT INTO users (id, email, name, password, created_at) VALUES (?, ?, ?, ?, ?)',
      [userId, email, email.split('@')[0], hashedPassword, createdAt]
    );

    const newUser: User = {
      uid: userId,
      email,
      displayName: email.split('@')[0],
      emailVerified: false,
    };

    await secureStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));

    this.authStateListeners.forEach(listener => listener(newUser));

    return newUser;
  }

  async signOut(): Promise<void> {
    await secureStorage.removeItem(CURRENT_USER_KEY);

    this.authStateListeners.forEach(listener => listener(null));
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const userJson = await secureStorage.getItem(CURRENT_USER_KEY);
      if (!userJson) {
        return null;
      }
      return JSON.parse(userJson);
    } catch {
      return null;
    }
  }

  onAuthStateChange(callback: (user: User | null) => void): () => void {
    this.authStateListeners.push(callback);

    this.getCurrentUser().then(user => callback(user));

    return () => {
      const index = this.authStateListeners.indexOf(callback);
      if (index > -1) {
        this.authStateListeners.splice(index, 1);
      }
    };
  }

  async updateUserProfile(uid: string, displayName: string): Promise<void> {
    const db = await SQLiteDatabase.getInstance();
    
    await db.runAsync(
      'UPDATE users SET name = ? WHERE id = ?',
      [displayName, uid]
    );

    const currentUser = await this.getCurrentUser();
    if (currentUser && currentUser.uid === uid) {
      const updatedUser = { ...currentUser, displayName };
      await secureStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
      this.authStateListeners.forEach(listener => listener(updatedUser));
    }
  }
}
