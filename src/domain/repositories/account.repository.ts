import type { Account } from '../entities/account.entity';

export interface AccountRepository {
  createAccount(params: {
    uid: string;
    ownerEmail: string;
    ownerName: string;
  }): Promise<Account>;

  getAccountDetails(): Promise<Account | null>;

  updateAccountBalance(accountNumber: string, newBalance: number): Promise<void>;
}

