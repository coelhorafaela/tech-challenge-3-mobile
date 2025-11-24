import type { Transaction, TransactionType } from '../../entities/transaction.entity';
import type { TransactionRepository } from '../../repositories/transaction.repository';

export class GetTransactionsUseCase {
  constructor(private readonly transactionRepository: TransactionRepository) {}

  async execute(
    accountNumber?: string,
    transactionType?: TransactionType
  ): Promise<Transaction[]> {
    return await this.transactionRepository.getTransactions(
      accountNumber,
      transactionType
    );
  }
}

