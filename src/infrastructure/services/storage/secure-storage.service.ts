import AsyncStorage from '@react-native-async-storage/async-storage';
import { encryptionService } from '../encryption';

const SENSITIVE_KEYS = [
  'userToken',
  'token',
  'authToken',
  'accessToken',
  'refreshToken',
  'account-details',
];

const ENCRYPTED_KEYS = [
  'userToken',
  'token',
  'authToken',
  'accessToken',
  'refreshToken',
];

class SecureStorageService {
  private isSensitiveKey(key: string): boolean {
    const lowerKey = key.toLowerCase();
    return SENSITIVE_KEYS.some(sk => lowerKey.toLowerCase().includes(sk.toLowerCase()));
  }

  private shouldEncrypt(key: string): boolean {
    const lowerKey = key.toLowerCase();
    return ENCRYPTED_KEYS.some(ek => lowerKey.toLowerCase().includes(ek.toLowerCase()));
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      if (this.shouldEncrypt(key)) {
        const encrypted = await encryptionService.encryptToken(value);
        await AsyncStorage.setItem(key, encrypted);
      } else {
        await AsyncStorage.setItem(key, value);
      }
    } catch (error) {
      throw new Error(`Falha ao salvar item: ${key}`);
    }
  }

  async getItem(key: string): Promise<string | null> {
    try {
      const value = await AsyncStorage.getItem(key);
      
      if (!value) {
        return null;
      }

      if (this.shouldEncrypt(key)) {
        try {
          const decrypted = await encryptionService.decrypt(value);
          if (decrypted && decrypted.length > 0) {
            return decrypted;
          }
        } catch {
          return value;
        }
        return value;
      }

      return value;
    } catch (error) {
      return null;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
    }
  }

  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
    }
  }

  async getAllKeys(): Promise<string[]> {
    try {
      return await AsyncStorage.getAllKeys();
    } catch (error) {
      return [];
    }
  }

  async multiGet(keys: string[]): Promise<[string, string | null][]> {
    try {
      const items = await AsyncStorage.multiGet(keys);
      const result: [string, string | null][] = [];

      for (const [key, value] of items) {
        if (value && this.shouldEncrypt(key)) {
          try {
            const decrypted = await encryptionService.decrypt(value);
            result.push([key, decrypted]);
          } catch {
            result.push([key, value]);
          }
        } else {
          result.push([key, value]);
        }
      }

      return result;
    } catch (error) {
      return keys.map(key => [key, null]);
    }
  }

  async multiSet(items: [string, string][]): Promise<void> {
    try {
      const processedItems: [string, string][] = [];

      for (const [key, value] of items) {
        if (this.shouldEncrypt(key)) {
          const encrypted = await encryptionService.encryptToken(value);
          processedItems.push([key, encrypted]);
        } else {
          processedItems.push([key, value]);
        }
      }

      await AsyncStorage.multiSet(processedItems);
    } catch (error) {
      throw new Error('Falha ao salvar múltiplos itens');
    }
  }

  async multiRemove(keys: string[]): Promise<void> {
    try {
      await AsyncStorage.multiRemove(keys);
    } catch (error) {
    }
  }
}

export const secureStorage = new SecureStorageService();
