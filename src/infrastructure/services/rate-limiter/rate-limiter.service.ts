import { RATE_LIMIT_STORAGE_PREFIX } from '@/src/constants/storageKeys';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface RateLimitEntry {
  attempts: number;
  firstAttempt: number;
  blockedUntil?: number;
}

  
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;
const BLOCK_DURATION_MS = 30 * 60 * 1000;

class RateLimiterService {
  private getStorageKey(identifier: string): string {
    return `${RATE_LIMIT_STORAGE_PREFIX}${identifier}`;
  }

  async checkRateLimit(identifier: string): Promise<{ allowed: boolean; remainingAttempts?: number; blockedUntil?: number }> {
    try {
      const storageKey = this.getStorageKey(identifier);
      const entryJson = await AsyncStorage.getItem(storageKey);

      if (!entryJson) {
        return { allowed: true, remainingAttempts: MAX_ATTEMPTS };
      }

      const entry: RateLimitEntry = JSON.parse(entryJson);
      const now = Date.now();

      if (entry.blockedUntil && now < entry.blockedUntil) {
        const blockedUntil = new Date(entry.blockedUntil);
        return {
          allowed: false,
          blockedUntil: entry.blockedUntil,
        };
      }

      if (entry.blockedUntil && now >= entry.blockedUntil) {
        await AsyncStorage.removeItem(storageKey);
        return { allowed: true, remainingAttempts: MAX_ATTEMPTS };
      }

      const timeSinceFirstAttempt = now - entry.firstAttempt;

      if (timeSinceFirstAttempt > WINDOW_MS) {
        await AsyncStorage.removeItem(storageKey);
        return { allowed: true, remainingAttempts: MAX_ATTEMPTS };
      }

      if (entry.attempts >= MAX_ATTEMPTS) {
        const blockedUntil = now + BLOCK_DURATION_MS;
        entry.blockedUntil = blockedUntil;
        await AsyncStorage.setItem(storageKey, JSON.stringify(entry));
        
        return {
          allowed: false,
          blockedUntil,
        };
      }

      const remainingAttempts = MAX_ATTEMPTS - entry.attempts;
      return { allowed: true, remainingAttempts };
    } catch (error) {
      return { allowed: true };
    }
  }

  async recordAttempt(identifier: string): Promise<void> {
    try {
      const storageKey = this.getStorageKey(identifier);
      const entryJson = await AsyncStorage.getItem(storageKey);
      const now = Date.now();

      let entry: RateLimitEntry;

      if (entryJson) {
        entry = JSON.parse(entryJson);
        const timeSinceFirstAttempt = now - entry.firstAttempt;

        if (timeSinceFirstAttempt > WINDOW_MS) {
          entry = {
            attempts: 1,
            firstAttempt: now,
          };
        } else {
          entry.attempts += 1;
        }
      } else {
        entry = {
          attempts: 1,
          firstAttempt: now,
        };
      }

      if (entry.attempts >= MAX_ATTEMPTS) {
        entry.blockedUntil = now + BLOCK_DURATION_MS;
      }

      await AsyncStorage.setItem(storageKey, JSON.stringify(entry));
    } catch (error) {
    }
  }

  async resetRateLimit(identifier: string): Promise<void> {
    try {
      const storageKey = this.getStorageKey(identifier);
      await AsyncStorage.removeItem(storageKey);
    } catch (error) {
    }
  }

  async getRemainingAttempts(identifier: string): Promise<number> {
    try {
      const result = await this.checkRateLimit(identifier);
      return result.remainingAttempts ?? MAX_ATTEMPTS;
    } catch {
      return MAX_ATTEMPTS;
    }
  }
}

export const rateLimiter = new RateLimiterService();
