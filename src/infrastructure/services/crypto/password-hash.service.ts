import * as Crypto from 'expo-crypto';

const SALT_LENGTH = 16;
const ITERATIONS = 10000;

export class PasswordHashService {
  private async generateSalt(): Promise<string> {
    const randomBytes = await Crypto.getRandomBytesAsync(SALT_LENGTH);
    return Array.from(randomBytes)
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('');
  }

  async hashPassword(password: string): Promise<string> {
    const salt = await this.generateSalt();
    const passwordWithSalt = `${password}${salt}`;
    
    const hash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      passwordWithSalt,
      { encoding: Crypto.CryptoEncoding.HEX }
    );

    return `${salt}:${hash}`;
  }

  async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    try {
      const [salt, storedHash] = hashedPassword.split(':');
      
      if (!salt || !storedHash) {
        return false;
      }

      const passwordWithSalt = `${password}${salt}`;
      const computedHash = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        passwordWithSalt,
        { encoding: Crypto.CryptoEncoding.HEX }
      );

      return computedHash === storedHash;
    } catch {
      return false;
    }
  }

  isHashed(password: string): boolean {
    return password.includes(':') && password.split(':').length === 2;
  }
}

export const passwordHashService = new PasswordHashService();
