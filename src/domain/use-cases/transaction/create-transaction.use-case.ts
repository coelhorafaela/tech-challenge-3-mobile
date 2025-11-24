import type { Transaction, TransactionType } from '../../entities/transaction.entity';
import type { TransactionRepository } from '../../repositories/transaction.repository';

export class CreateTransactionUseCase {
  constructor(private readonly transactionRepository: TransactionRepository) {}

  async execute(
    amount: number,
    type: TransactionType,
    timestamp?: Date,
    accountNumber?: string
  ): Promise<Transaction> {
    if (amount <= 0) {
      throw new Error('O valor da transação deve ser maior que zero');
    }

    if (!type || (type !== 'DEPOSIT' && type !== 'WITHDRAWAL')) {
      throw new Error('Tipo de transação inválido');
    }

    return await this.transactionRepository.createTransaction(
      amount,
      type,
      timestamp || new Date(),
      accountNumber
    );
  }
}

