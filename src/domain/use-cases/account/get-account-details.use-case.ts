import type { Account } from '../../entities/account.entity';
import type { AccountRepository } from '../../repositories/account.repository';

export class GetAccountDetailsUseCase {
  constructor(private readonly accountRepository: AccountRepository) {}

  async execute(): Promise<Account | null> {
    return await this.accountRepository.getAccountDetails();
  }
}

