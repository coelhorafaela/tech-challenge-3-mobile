import type { AuthRepository } from '../../repositories/auth.repository';

export class SignOutUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(): Promise<void> {
    await this.authRepository.signOut();
  }
}

