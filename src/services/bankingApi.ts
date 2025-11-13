import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase';

export type TransactionType = 'DEPOSIT' | 'WITHDRAWAL';

type Transaction = {
  id: string;
  type: TransactionType;
  amount: number;
  timestamp: string;
  newBalance: number;
  category?: string | null;
};

type MonthlyTransactions = {
  month: number;
  transactions: Transaction[];
};

type YearlyTransactionsResponse = {
  success: boolean;
  year: number;
  months: MonthlyTransactions[];
};

type StatementResponse = {
  success: boolean;
  transactions: Transaction[];
};

type AccountDetailsResponse = {
  success: boolean;
  accountNumber: string;
  agency: string;
  ownerName: string;
  balance: number;
};

class BankingApiService {
  private idToken: string | null = null;

  setAuthToken(token: string) {
    this.idToken = token;
  }

  private async callFunction<T>(functionName: string, data: any = {}): Promise<T> {
    try {
      const callable = httpsCallable(functions!, functionName);
      const result = await callable(data);
      return result.data as T;
    } catch (error) {
      console.error(`Erro na chamada para ${functionName}:`, error);
      throw error;
    }
  }

  async healthCheck(): Promise<{ success: boolean; docId: string }> {
    return this.callFunction('healthCheck');
  }

  async getYearlyTransactions(year: number): Promise<YearlyTransactionsResponse> {
    return this.callFunction('getYearlyTransactions', { year });
  }

  async getAccountStatement(
    transactionType?: TransactionType
  ): Promise<StatementResponse> {
    const payload: Record<string, unknown> = {};

    if (transactionType) {
      payload.transactionType = transactionType;
    }

    return this.callFunction('getAccountStatement', payload);
  }

  async getAccountDetails(accountNumber?: string): Promise<AccountDetailsResponse> {
    if (accountNumber) {
      return this.callFunction('getAccountDetails', { accountNumber });
    }
    return this.callFunction('getAccountDetails');
  }

  async performTransaction(
    accountNumber: string,
    amount: number,
    type: TransactionType,
    timestamp?: number
  ): Promise<{ success: boolean; transactionId: string; newBalance: number }> {
    const payload: Record<string, unknown> = {
      accountNumber,
      amount,
      type,
    };

    if (typeof timestamp === 'number') {
      payload.timestamp = timestamp;
    }

    return this.callFunction('performTransaction', payload);
  }

  async createBankAccount(ownerName: string): Promise<{
    success: boolean;
    docId: string;
    accountNumber: string;
  }> {
    return this.callFunction('createBankAccount', { ownerName });
  }
}

export const bankingApi = new BankingApiService();
export type {
  AccountDetailsResponse, MonthlyTransactions, StatementResponse,
  Transaction,
  YearlyTransactionsResponse
};
