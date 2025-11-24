export interface User {
  uid: string;
  email: string;
  displayName?: string;
  emailVerified: boolean;
}

export class UserEntity {
  constructor(
    public readonly uid: string,
    public readonly email: string,
    public readonly emailVerified: boolean,
    public readonly displayName?: string
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this.uid || this.uid.trim() === '') {
      throw new Error('UID do usuário é obrigatório');
    }

    if (!this.email || !this.isValidEmail(this.email)) {
      throw new Error('Email inválido');
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  hasDisplayName(): boolean {
    return !!this.displayName && this.displayName.trim() !== '';
  }
}

