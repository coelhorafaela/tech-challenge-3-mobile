import type { Transaction } from '../../entities/transaction.entity';
import type { TransactionRepository } from '../../repositories/transaction.repository';

export class GetYearlyTransactionsUseCase {
  constructor(private readonly transactionRepository: TransactionRepository) {}

  async execute(year: number): Promise<{
    year: number;
    months: Array<{
      month: number;
      transactions: Transaction[];
    }>;
  }> {
    if (year < 2000 || year > 2100) {
      throw new Error('Ano inválido');
    }

    return await this.transactionRepository.getYearlyTransactions(year);
  }
}

