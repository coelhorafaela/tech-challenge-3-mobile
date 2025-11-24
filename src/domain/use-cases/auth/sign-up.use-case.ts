import type { User } from '../../entities/user.entity';
import type { AuthRepository } from '../../repositories/auth.repository';

export class SignUpUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(email: string, password: string): Promise<User> {
    if (!email || !this.isValidEmail(email)) {
      throw new Error('Email inválido');
    }

    if (!password || password.length < 6) {
      throw new Error('Senha deve ter pelo menos 6 caracteres');
    }

    return await this.authRepository.signUp(email, password);
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

