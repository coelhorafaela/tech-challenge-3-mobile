import { httpsCallable } from 'firebase/functions';
import { TransactionMapper } from '../../application/mappers/transaction.mapper';
import type { Transaction, TransactionType } from '../../domain/entities/transaction.entity';
import type { TransactionRepository as ITransactionRepository } from '../../domain/repositories/transaction.repository';
import { getFirebaseFunctions } from '../services/config/firebase';

const normalizeCallableData = <TData>(data: unknown): TData => {
  if (!data) {
    throw new Error('Resposta vazia recebida do Firebase Functions.');
  }

  const typedData = data as { result?: TData };
  if (typedData && typedData.result) {
    return typedData.result;
  }

  return data as TData;
};

export class TransactionRepository implements ITransactionRepository {
  async createTransaction(
    amount: number,
    type: TransactionType,
    timestamp?: Date,
    accountNumber?: string
  ): Promise<Transaction> {
    const functions = getFirebaseFunctions();
    const callable = httpsCallable<
      { amount: number; type: TransactionType; timestamp?: number; accountNumber?: string },
      { success: boolean; transactionId: string; newBalance: number }
    >(functions, 'performTransaction');

    const payload: {
      amount: number;
      type: TransactionType;
      timestamp?: number;
      accountNumber?: string;
    } = {
      amount,
      type,
    };

    if (timestamp) {
      payload.timestamp = timestamp.getTime();
    }

    if (accountNumber) {
      payload.accountNumber = accountNumber;
    }

    const response = await callable(payload);
    const data = normalizeCallableData<{ success: boolean; transactionId: string; newBalance: number }>(response.data);

    if (!data.success) {
      throw new Error('Falha ao criar transação');
    }

    return TransactionMapper.fromFirebaseResponse({
      id: data.transactionId,
      type,
      amount,
      timestamp: timestamp || new Date(),
      newBalance: data.newBalance,
      accountNumber,
    });
  }

  async getTransactions(
    accountNumber?: string,
    transactionType?: TransactionType
  ): Promise<Transaction[]> {
    const functions = getFirebaseFunctions();
    const payload: Record<string, unknown> = {};

    if (transactionType) {
      payload.transactionType = transactionType;
    }

    const callable = httpsCallable<
      Record<string, unknown>,
      { success: boolean; transactions: Array<{ id: string; type: TransactionType; amount: number; timestamp: string; newBalance: number; category?: string | null }> }
    >(functions, 'getAccountStatement');

    const response = await callable(payload);
    const data = normalizeCallableData<{
      success: boolean;
      transactions: Array<{
        id: string;
        type: TransactionType;
        amount: number;
        timestamp: string;
        newBalance: number;
        category?: string | null;
      }>;
    }>(response.data);

    if (!data.success) {
      throw new Error('Falha ao buscar transações');
    }

    return data.transactions.map((t) =>
      TransactionMapper.fromFirebaseResponse({
        ...t,
        accountNumber,
      })
    );
  }

  async getYearlyTransactions(year: number): Promise<{
    year: number;
    months: Array<{
      month: number;
      transactions: Transaction[];
    }>;
  }> {
    const functions = getFirebaseFunctions();
    const callable = httpsCallable<
      { year: number },
      {
        success: boolean;
        year: number;
        months: Array<{
          month: number;
          transactions: Array<{
            id: string;
            type: TransactionType;
            amount: number;
            timestamp: string;
            newBalance: number;
            category?: string | null;
          }>;
        }>;
      }
    >(functions, 'getYearlyTransactions');

    const response = await callable({ year });
    const data = normalizeCallableData<{
      success: boolean;
      year: number;
      months: Array<{
        month: number;
        transactions: Array<{
          id: string;
          type: TransactionType;
          amount: number;
          timestamp: string;
          newBalance: number;
          category?: string | null;
        }>;
      }>;
    }>(response.data);

    if (!data.success) {
      throw new Error('Falha ao buscar transações anuais');
    }

    return {
      year: data.year,
      months: data.months.map((month) => ({
        month: month.month,
        transactions: month.transactions.map((t) => TransactionMapper.fromFirebaseResponse(t)),
      })),
    };
  }

  async getAccountStatement(params?: {
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
    const functions = getFirebaseFunctions();
    const payload: {
      page?: number;
      pageSize?: number;
      transactionType?: TransactionType;
    } = {};

    if (params?.page !== undefined) {
      payload.page = params.page;
    }

    if (params?.pageSize !== undefined) {
      payload.pageSize = params.pageSize;
    }

    if (params?.transactionType) {
      payload.transactionType = params.transactionType;
    }

    const callable = httpsCallable<
      typeof payload,
      {
        success: boolean;
        page: number;
        pageSize: number;
        hasMore: boolean;
        transactions: Array<{
          id: string;
          type: TransactionType;
          amount: number;
          timestamp: string;
          newBalance: number;
          category?: string | null;
        }>;
      }
    >(functions, 'getAccountStatement');

    const response = await callable(payload);
    const data = normalizeCallableData<{
      success: boolean;
      page: number;
      pageSize: number;
      hasMore: boolean;
      transactions: Array<{
        id: string;
        type: TransactionType;
        amount: number;
        timestamp: string;
        newBalance: number;
        category?: string | null;
      }>;
    }>(response.data);

    return {
      success: data.success,
      page: data.page,
      pageSize: data.pageSize,
      hasMore: data.hasMore,
      transactions: data.transactions.map((t) => TransactionMapper.fromFirebaseResponse(t)),
    };
  }
}

