export interface CreateTransactionDTO {
  amount: number;
  type: 'DEPOSIT' | 'WITHDRAWAL';
  timestamp?: Date;
  accountNumber?: string;
}

export interface GetTransactionsDTO {
  accountNumber?: string;
  transactionType?: 'DEPOSIT' | 'WITHDRAWAL';
}

export interface GetAccountStatementDTO {
  page?: number;
  pageSize?: number;
  transactionType?: 'DEPOSIT' | 'WITHDRAWAL';
}

export interface GetYearlyTransactionsDTO {
  year: number;
}

