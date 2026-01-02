class SanitizerService {
  sanitizeString(input: string): string {
    if (typeof input !== 'string') {
      return '';
    }

    return input
      .trim()
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .replace(/script/gi, '')
      .replace(/\0/g, '');
  }

  sanitizeEmail(email: string): string {
    if (typeof email !== 'string') {
      return '';
    }

    return email
      .trim()
      .toLowerCase()
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/\0/g, '');
  }

  sanitizeName(name: string): string {
    if (typeof name !== 'string') {
      return '';
    }

    return name
      .trim()
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .replace(/script/gi, '')
      .replace(/[0-9]/g, '')
      .replace(/\0/g, '')
      .replace(/[^a-zA-ZÀ-ÿ\s'-]/g, '');
  }

  sanitizeNumeric(input: string): string {
    if (typeof input !== 'string') {
      return '';
    }

    return input.replace(/[^0-9.]/g, '');
  }

  sanitizeCardNumber(cardNumber: string): string {
    if (typeof cardNumber !== 'string') {
      return '';
    }

    return cardNumber.replace(/\s/g, '').replace(/[^0-9]/g, '');
  }

  sanitizeCVV(cvv: string): string {
    if (typeof cvv !== 'string') {
      return '';
    }

    return cvv.replace(/[^0-9]/g, '').substring(0, 3);
  }

  sanitizeSQL(input: string): string {
    if (typeof input !== 'string') {
      return '';
    }

    const sqlKeywords = [
      'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'DROP', 'CREATE', 'ALTER',
      'EXEC', 'EXECUTE', 'UNION', 'SCRIPT', '--', ';', '/*', '*/',
    ];

    let sanitized = input;
    
    sqlKeywords.forEach(keyword => {
      const regex = new RegExp(keyword, 'gi');
      sanitized = sanitized.replace(regex, '');
    });

    return sanitized.replace(/['";\\]/g, '');
  }

  sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
    const sanitized = { ...obj };

    for (const [key, value] of Object.entries(sanitized)) {
      if (typeof value === 'string') {
        (sanitized as Record<string, unknown>)[key] = this.sanitizeString(value);
      } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        (sanitized as Record<string, unknown>)[key] = this.sanitizeObject(value as Record<string, unknown>);
      } else if (Array.isArray(value)) {
        (sanitized as Record<string, unknown>)[key] = value.map(item =>
          typeof item === 'string' ? this.sanitizeString(item) : item
        );
      }
    }

    return sanitized;
  }
}

export const sanitizer = new SanitizerService();
