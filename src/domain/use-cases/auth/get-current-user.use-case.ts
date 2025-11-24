import type { User } from '../../entities/user.entity';
import type { AuthRepository } from '../../repositories/auth.repository';

export class GetCurrentUserUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(): Promise<User | null> {
    return await this.authRepository.getCurrentUser();
  }
}

