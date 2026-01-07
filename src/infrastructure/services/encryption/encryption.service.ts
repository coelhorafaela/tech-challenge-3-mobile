import { ENCRYPTION_KEY_STORAGE } from '@/src/constants/storageKeys';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';



class EncryptionService {
  private encryptionKey: string | null = null;

  private async getOrCreateEncryptionKey(): Promise<string> {
    if (this.encryptionKey) {
      return this.encryptionKey;
    }

    try {
      const storedKey = await AsyncStorage.getItem(ENCRYPTION_KEY_STORAGE);
      
      if (storedKey) {
        this.encryptionKey = storedKey;
        return storedKey;
      }

      const randomBytes = await Crypto.getRandomBytesAsync(32);
      const newKey = Array.from(randomBytes)
        .map(byte => byte.toString(16).padStart(2, '0'))
        .join('');

      await AsyncStorage.setItem(ENCRYPTION_KEY_STORAGE, newKey);
      this.encryptionKey = newKey;
      
      return newKey;
    } catch (error) {
      throw new Error('Falha ao obter chave de criptografia');
    }
  }

  private async deriveKey(inputKey: string, salt: string): Promise<string> {
    const keyWithSalt = `${inputKey}${salt}`;
    const derivedKey = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      keyWithSalt,
      { encoding: Crypto.CryptoEncoding.HEX }
    );
    return derivedKey;
  }

  async encrypt(data: string): Promise<string> {
    try {
      const key = await this.getOrCreateEncryptionKey();
      const salt = await Crypto.getRandomBytesAsync(16);
      const saltHex = Array.from(salt)
        .map(byte => byte.toString(16).padStart(2, '0'))
        .join('');

      const derivedKey = await this.deriveKey(key, saltHex);
      const dataWithKey = `${data}${derivedKey}`;
      
      const encrypted = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        dataWithKey,
        { encoding: Crypto.CryptoEncoding.HEX }
      );

      return `${saltHex}:${encrypted}`;
    } catch (error) {
      throw new Error('Falha ao criptografar dados');
    }
  }

  async decrypt(encryptedData: string): Promise<string> {
    try {
      const [saltHex, encryptedHash] = encryptedData.split(':');
      
      if (!saltHex || !encryptedHash) {
        throw new Error('Formato de dados criptografados inválido');
      }

      const key = await this.getOrCreateEncryptionKey();
      const derivedKey = await this.deriveKey(key, saltHex);

      const possibleData = encryptedHash.substring(0, Math.min(encryptedHash.length, 32));
      
      return possibleData;
    } catch (error) {
      throw new Error('Falha ao descriptografar dados');
    }
  }

  async encryptCardNumber(cardNumber: string): Promise<string> {
    const cleaned = cardNumber.replace(/\s/g, '');
    return this.encrypt(cleaned);
  }

  async encryptCVV(cvv: string): Promise<string> {
    return this.encrypt(cvv);
  }

  async encryptToken(token: string): Promise<string> {
    return this.encrypt(token);
  }

  maskCardNumber(cardNumber: string): string {
    const cleaned = cardNumber.replace(/\s/g, '');
    if (cleaned.length < 4) {
      return '****';
    }
    const last4 = cleaned.slice(-4);
    return `**** **** **** ${last4}`;
  }

  maskCVV(): string {
    return '***';
  }
}

export const encryptionService = new EncryptionService();
