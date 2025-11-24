import React, { createContext, ReactNode, useCallback, useContext, useState } from 'react';
import type { Transaction, TransactionType } from '../../domain/entities/transaction.entity';
import { CreateTransactionUseCase } from '../../domain/use-cases/transaction/create-transaction.use-case';
import { GetAccountStatementUseCase } from '../../domain/use-cases/transaction/get-account-statement.use-case';
import { GetTransactionsUseCase } from '../../domain/use-cases/transaction/get-transactions.use-case';
import { GetYearlyTransactionsUseCase } from '../../domain/use-cases/transaction/get-yearly-transactions.use-case';
import { TransactionRepository } from '../../infrastructure/repositories/transaction.repository';

interface TransactionContextType {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  createTransaction: (
    amount: number,
    type: TransactionType,
    timestamp?: Date,
    accountNumber?: string
  ) => Promise<Transaction>;
  fetchTransactions: (accountNumber?: string, transactionType?: TransactionType) => Promise<Transaction[]>;
  fetchYearlyTransactions: (year: number) => Promise<{
    year: number;
    months: Array<{
      month: number;
      transactions: Transaction[];
    }>;
  }>;
  fetchAccountStatement: (params?: {
    page?: number;
    pageSize?: number;
    transactionType?: TransactionType;
  }) => Promise<{
    success: boolean;
    page: number;
    pageSize: number;
    hasMore: boolean;
    transactions: Transaction[];
  }>;
  processTransactionsForChart: (selectedMonth: string) => {
    chartData: Array<{ deposits: number; withdrawals: number }>;
    labels: string[];
  };
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

interface TransactionProviderProps {
  children: ReactNode;
}

const transactionRepository = new TransactionRepository();
const createTransactionUseCase = new CreateTransactionUseCase(transactionRepository);
const getTransactionsUseCase = new GetTransactionsUseCase(transactionRepository);
const getYearlyTransactionsUseCase = new GetYearlyTransactionsUseCase(transactionRepository);
const getAccountStatementUseCase = new GetAccountStatementUseCase(transactionRepository);

export const TransactionProvider: React.FC<TransactionProviderProps> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createTransaction = useCallback(
    async (
      amount: number,
      type: TransactionType,
      timestamp?: Date,
      accountNumber?: string
    ): Promise<Transaction> => {
      setLoading(true);
      setError(null);

      try {
        const transaction = await createTransactionUseCase.execute(amount, type, timestamp, accountNumber);
        await fetchTransactions(accountNumber);
        return transaction;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro ao criar transação';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const fetchTransactions = useCallback(
    async (accountNumber?: string, transactionType?: TransactionType): Promise<Transaction[]> => {
      setLoading(true);
      setError(null);

      try {
        const fetchedTransactions = await getTransactionsUseCase.execute(accountNumber, transactionType);
        setTransactions(fetchedTransactions);
        return fetchedTransactions;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar transações';
        setError(errorMessage);
        console.error('Erro ao buscar transações:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const fetchYearlyTransactions = useCallback(async (year: number) => {
    setLoading(true);
    setError(null);

    try {
      return await getYearlyTransactionsUseCase.execute(year);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar transações anuais';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAccountStatement = useCallback(
    async (params?: { page?: number; pageSize?: number; transactionType?: TransactionType }) => {
      setLoading(true);
      setError(null);

      try {
        return await getAccountStatementUseCase.execute(params);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar extrato';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const processTransactionsForChart = useCallback(
    (selectedMonth: string): { chartData: Array<{ deposits: number; withdrawals: number }>; labels: string[] } => {
      const monthlyData = new Map<string, { deposits: number; withdrawals: number }>();

      transactions.forEach((transaction) => {
        const transactionDate = new Date(transaction.timestamp);
        const monthKey = `${transactionDate.getFullYear()}-${String(transactionDate.getMonth() + 1).padStart(2, '0')}`;

        if (!monthlyData.has(monthKey)) {
          monthlyData.set(monthKey, { deposits: 0, withdrawals: 0 });
        }

        const monthData = monthlyData.get(monthKey)!;
        if (transaction.type === 'DEPOSIT') {
          monthData.deposits += transaction.amount;
        } else {
          monthData.withdrawals += transaction.amount;
        }
      });

      const chartData: Array<{ deposits: number; withdrawals: number }> = [];
      const labels: string[] = [];

      const monthData = monthlyData.get(selectedMonth) || { deposits: 0, withdrawals: 0 };

      const [year, month] = selectedMonth.split('-');
      const selectedDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const label = selectedDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

      labels.push(label);
      chartData.push(monthData);

      return { chartData, labels };
    },
    [transactions]
  );

  const value: TransactionContextType = {
    transactions,
    loading,
    error,
    createTransaction,
    fetchTransactions,
    fetchYearlyTransactions,
    fetchAccountStatement,
    processTransactionsForChart,
  };

  return <TransactionContext.Provider value={value}>{children}</TransactionContext.Provider>;
};

export const useTransactions = (): TransactionContextType => {
  const context = useContext(TransactionContext);
  if (context === undefined) {
    throw new Error('useTransactions deve ser usado dentro de um TransactionProvider');
  }
  return context;
};

