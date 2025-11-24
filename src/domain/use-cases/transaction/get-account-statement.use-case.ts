import type { Transaction, TransactionType } from '../../entities/transaction.entity';
import type { TransactionRepository } from '../../repositories/transaction.repository';

export class GetAccountStatementUseCase {
  constructor(private readonly transactionRepository: TransactionRepository) {}

  async execute(params?: {
    page?: number;
    pageSize?: number;
    transactionType?: TransactionType;
  }): Promise<{
    success: boolean;
    page: number;
    pageSize: number;
    hasMore: boolean;
    transactions: Transaction[];
  }> {
    const page = params?.page ?? 1;
    const pageSize = params?.pageSize ?? 10;

    if (page < 1) {
      throw new Error('Página deve ser maior que zero');
    }

    if (pageSize < 1 || pageSize > 100) {
      throw new Error('Tamanho da página deve estar entre 1 e 100');
    }

    return await this.transactionRepository.getAccountStatement({
      page,
      pageSize,
      transactionType: params?.transactionType,
    });
  }
}

