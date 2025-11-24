export type TransactionType = 'DEPOSIT' | 'WITHDRAWAL';

export type AccountStatementEntryType = 'DEPOSIT' | 'WITHDRAWAL' | 'CARD';

export type PerformTransactionPayload = {
  amount: number;
  type: TransactionType;
  timestamp?: number;
  accountNumber?: string;
};

export type PerformTransactionResponse = {
  success: boolean;
  transactionId: string;
  newBalance: number;
};

export type GetAccountStatementPayload = {
  page?: number;
  pageSize?: number;
  transactionType?: AccountStatementEntryType | TransactionType;
};

export type AccountStatementEntry = {
  id: string;
  type: AccountStatementEntryType;
  amount: number;
  timestamp: string;
  newBalance: number;
  category?: string | null;
};

export type GetAccountStatementResponse = {
  success: boolean;
  page: number;
  pageSize: number;
  hasMore: boolean;
  transactions: AccountStatementEntry[];
};

export type StatementResponse = {
  success: boolean;
  transactions: Transaction[];
};

export type Transaction = {
  id: string;
  type: TransactionType;
  amount: number;
  timestamp: string;
  newBalance: number;
  category?: string | null;
};

export type MonthlyTransactions = {
  month: number;
  transactions: Transaction[];
};

export type YearlyTransactionsResponse = {
  success: boolean;
  year: number;
  months: MonthlyTransactions[];
};

