import type { Transaction, TransactionType } from '../entities/transaction.entity';

export interface TransactionRepository {
  createTransaction(
    amount: number,
    type: TransactionType,
    timestamp?: Date,
    accountNumber?: string
  ): Promise<Transaction>;

  getTransactions(
    accountNumber?: string,
    transactionType?: TransactionType
  ): Promise<Transaction[]>;

  getYearlyTransactions(year: number): Promise<{
    year: number;
    months: Array<{
      month: number;
      transactions: Transaction[];
    }>;
  }>;

  getAccountStatement(params?: {
    page?: number;
    pageSize?: number;
    transactionType?: TransactionType;
  }): Promise<{
    success: boolean;
    page: number;
    pageSize: number;
    hasMore: boolean;
    transactions: Transaction[];
  }>;
}

