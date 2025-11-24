import type { Account } from '../../entities/account.entity';
import type { AccountRepository } from '../../repositories/account.repository';

export class CreateAccountUseCase {
  constructor(private readonly accountRepository: AccountRepository) {}

  async execute(params: {
    uid: string;
    ownerEmail: string;
    ownerName: string;
  }): Promise<Account> {
    if (!params.uid || params.uid.trim() === '') {
      throw new Error('UID do usuário é obrigatório');
    }

    if (!params.ownerEmail || !this.isValidEmail(params.ownerEmail)) {
      throw new Error('Email inválido');
    }

    if (!params.ownerName || params.ownerName.trim() === '') {
      throw new Error('Nome do proprietário é obrigatório');
    }

    return await this.accountRepository.createAccount(params);
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

