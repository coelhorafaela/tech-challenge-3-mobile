type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LoggerConfig {
  level: LogLevel;
  enableInProduction: boolean;
}

const SENSITIVE_KEYS = [
  'password',
  'senha',
  'token',
  'cvv',
  'cardNumber',
  'card_number',
  'accountNumber',
  'account_number',
  'creditCard',
  'credit_card',
  'secret',
  'apiKey',
  'api_key',
  'authorization',
  'auth',
  'uid',
];

const SENSITIVE_PATTERNS = [
  /password\s*[:=]\s*["']?[^"'\s]+/gi,
  /senha\s*[:=]\s*["']?[^"'\s]+/gi,
  /token\s*[:=]\s*["']?[^"'\s]+/gi,
  /cvv\s*[:=]\s*["']?[^"'\s]+/gi,
  /card[_-]?number\s*[:=]\s*["']?[^"'\s]+/gi,
];

const isProduction = process.env.NODE_ENV === 'production';

class LoggerService {
  private config: LoggerConfig = {
    level: isProduction ? 'warn' : 'debug',
    enableInProduction: false,
  };

  private sanitizeValue(value: unknown): unknown {
    if (value === null || value === undefined) {
      return value;
    }

    if (typeof value === 'string') {
      let sanitized = value;
      
      SENSITIVE_PATTERNS.forEach(pattern => {
        sanitized = sanitized.replace(pattern, (match) => {
          const key = match.split(/[:=]/)[0].trim();
          return `${key}: [REDACTED]`;
        });
      });

      if (sanitized !== value) {
        return sanitized;
      }

      if (value.length > 0 && /^[0-9]{13,19}$/.test(value.replace(/\s/g, ''))) {
        return '[CARD_NUMBER_REDACTED]';
      }

      if (value.length === 3 && /^[0-9]{3}$/.test(value)) {
        return '[CVV_REDACTED]';
      }

      return value;
    }

    if (typeof value === 'object' && !Array.isArray(value)) {
      const sanitized: Record<string, unknown> = {};
      
      for (const [key, val] of Object.entries(value)) {
        const lowerKey = key.toLowerCase();
        const isSensitive = SENSITIVE_KEYS.some(sk => 
          lowerKey.includes(sk.toLowerCase())
        );

        if (isSensitive) {
          sanitized[key] = '[REDACTED]';
        } else {
          sanitized[key] = this.sanitizeValue(val);
        }
      }

      return sanitized;
    }

    if (Array.isArray(value)) {
      return value.map(item => this.sanitizeValue(item));
    }

    return value;
  }

  private sanitizeMessage(message: string, ...args: unknown[]): [string, unknown[]] {
    const sanitizedMessage = this.sanitizeValue(message) as string;
    const sanitizedArgs = args.map(arg => this.sanitizeValue(arg));
    return [sanitizedMessage, sanitizedArgs];
  }

  private shouldLog(level: LogLevel): boolean {
    if (isProduction && !this.config.enableInProduction) {
      return level === 'error' || level === 'warn';
    }

    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    const currentLevelIndex = levels.indexOf(this.config.level);
    const messageLevelIndex = levels.indexOf(level);
    
    return messageLevelIndex >= currentLevelIndex;
  }

  debug(message: string, ...args: unknown[]): void {
    if (!this.shouldLog('debug')) return;
    
    const [sanitizedMessage, sanitizedArgs] = this.sanitizeMessage(message, ...args);
    console.log('[DEBUG]', sanitizedMessage, ...sanitizedArgs);
  }

  info(message: string, ...args: unknown[]): void {
    if (!this.shouldLog('info')) return;
    
    const [sanitizedMessage, sanitizedArgs] = this.sanitizeMessage(message, ...args);
    console.log('[INFO]', sanitizedMessage, ...sanitizedArgs);
  }

  warn(message: string, ...args: unknown[]): void {
    if (!this.shouldLog('warn')) return;
    
    const [sanitizedMessage, sanitizedArgs] = this.sanitizeMessage(message, ...args);
    console.warn('[WARN]', sanitizedMessage, ...sanitizedArgs);
  }

  error(message: string, error?: Error | unknown, ...args: unknown[]): void {
    if (!this.shouldLog('error')) return;
    
    const [sanitizedMessage, sanitizedArgs] = this.sanitizeMessage(message, ...args);
    
    if (error instanceof Error) {
      const sanitizedError = {
        name: error.name,
        message: this.sanitizeValue(error.message) as string,
        stack: isProduction ? undefined : error.stack,
      };
      console.error('[ERROR]', sanitizedMessage, sanitizedError, ...sanitizedArgs);
    } else if (error) {
      const sanitizedError = this.sanitizeValue(error);
      console.error('[ERROR]', sanitizedMessage, sanitizedError, ...sanitizedArgs);
    } else {
      console.error('[ERROR]', sanitizedMessage, ...sanitizedArgs);
    }
  }

  setConfig(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

export const logger = new LoggerService();
