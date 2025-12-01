import AsyncStorage from '@react-native-async-storage/async-storage';

import { CURRENT_USER_KEY } from '../../constants';
import type { Transaction, TransactionType } from '../../domain/entities/transaction.entity';
import type { TransactionRepository as ITransactionRepository } from '../../domain/repositories/transaction.repository';
import { SQLiteDatabase } from '../services/config/sqlite';

export class TransactionRepository implements ITransactionRepository {
  async createTransaction(
    amount: number,
    type: TransactionType,
    timestamp?: Date,
    accountNumber?: string
  ): Promise<Transaction> {
    const db = await SQLiteDatabase.getInstance();

    let targetAccountNumber = accountNumber;
    if (!targetAccountNumber) {
      const userJson = await AsyncStorage.getItem(CURRENT_USER_KEY);
      if (!userJson) {
        throw new Error('Usuário não autenticado');
      }
      
      const currentUser = JSON.parse(userJson);
      const account = await db.getFirstAsync<{ account_number: string }>(
        'SELECT account_number FROM accounts WHERE user_id = ?',
        [currentUser.uid]
      );
      
      if (!account) {
        throw new Error('Conta não encontrada');
      }
      
      targetAccountNumber = account.account_number;
    }

    const account = await db.getFirstAsync<{ balance: number }>(
      'SELECT balance FROM accounts WHERE account_number = ?',
      [targetAccountNumber]
    );

    if (!account) {
      throw new Error('Conta não encontrada');
    }

    const currentBalance = account.balance;
    const adjustment = type === 'DEPOSIT' ? amount : -amount;
    const newBalance = currentBalance + adjustment;

    if (newBalance < 0) {
      throw new Error('Saldo insuficiente');
    }

    const transactionId = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const txTimestamp = timestamp ? timestamp.getTime() : Date.now();
    const createdAt = Date.now();

    await db.runAsync(
      'INSERT INTO transactions (id, account_number, amount, type, timestamp, new_balance, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [transactionId, targetAccountNumber, amount, type, txTimestamp, newBalance, createdAt]
    );

    await db.runAsync(
      'UPDATE accounts SET balance = ? WHERE account_number = ?',
      [newBalance, targetAccountNumber]
    );

    return {
      id: transactionId,
      type,
      amount,
      timestamp: new Date(txTimestamp),
      newBalance,
      accountNumber: targetAccountNumber,
    };
  }

  async getTransactions(
    accountNumber?: string,
    transactionType?: TransactionType
  ): Promise<Transaction[]> {
    const db = await SQLiteDatabase.getInstance();

    let targetAccountNumber = accountNumber;
    if (!targetAccountNumber) {
      const userJson = await AsyncStorage.getItem(CURRENT_USER_KEY);
      if (!userJson) {
        return [];
      }

      const currentUser = JSON.parse(userJson);
      const account = await db.getFirstAsync<{ account_number: string }>(
        'SELECT account_number FROM accounts WHERE user_id = ?',
        [currentUser.uid]
      );
      
      if (!account) {
        return [];
      }
      
      targetAccountNumber = account.account_number;
    }

    let query = 'SELECT * FROM transactions WHERE account_number = ?';
    const params: (string | number)[] = [targetAccountNumber];
    
    if (transactionType) {
      query += ' AND type = ?';
      params.push(transactionType);
    }
    
    query += ' ORDER BY timestamp DESC';

    const transactions = await db.getAllAsync<{
      id: string;
      account_number: string;
      amount: number;
      type: string;
      timestamp: number;
      new_balance: number;
      category: string | null;
    }>(query, params);

    return transactions.map(tx => ({
      id: tx.id,
      type: tx.type as TransactionType,
      amount: tx.amount,
      timestamp: new Date(tx.timestamp),
      newBalance: tx.new_balance,
      accountNumber: tx.account_number,
      category: tx.category || undefined,
    }));
  }

  async getYearlyTransactions(year: number): Promise<{
    year: number;
    months: Array<{
      month: number;
      transactions: Transaction[];
    }>;
  }> {
    const db = await SQLiteDatabase.getInstance();

    const userJson = await AsyncStorage.getItem(CURRENT_USER_KEY);
    if (!userJson) {
      return { year, months: [] };
    }
    
    const currentUser = JSON.parse(userJson);
    const account = await db.getFirstAsync<{ account_number: string }>(
      'SELECT account_number FROM accounts WHERE user_id = ?',
      [currentUser.uid]
    );
    
    if (!account) {
      return { year, months: [] };
    }

    const startDate = new Date(year, 0, 1).getTime();
    const endDate = new Date(year, 11, 31, 23, 59, 59).getTime();

    const transactions = await db.getAllAsync<{
      id: string;
      account_number: string;
      amount: number;
      type: string;
      timestamp: number;
      new_balance: number;
      category: string | null;
    }>(
      'SELECT * FROM transactions WHERE account_number = ? AND timestamp BETWEEN ? AND ? ORDER BY timestamp DESC',
      [account.account_number, startDate, endDate]
    );

    const monthsMap = new Map<number, Transaction[]>();
    
    transactions.forEach(tx => {
      const date = new Date(tx.timestamp);
      const month = date.getMonth() + 1;
      
      if (!monthsMap.has(month)) {
        monthsMap.set(month, []);
      }
      
      monthsMap.get(month)!.push({
        id: tx.id,
        type: tx.type as TransactionType,
        amount: tx.amount,
        timestamp: new Date(tx.timestamp),
        newBalance: tx.new_balance,
        accountNumber: tx.account_number,
        category: tx.category || undefined,
      });
    });

    const months = Array.from(monthsMap.entries()).map(([month, txs]) => ({
      month,
      transactions: txs,
    }));

    return { year, months };
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
    const db = await SQLiteDatabase.getInstance();

    const userJson = await AsyncStorage.getItem(CURRENT_USER_KEY);
    if (!userJson) {
      return {
        success: false,
        page: params?.page || 1,
        pageSize: params?.pageSize || 20,
        hasMore: false,
        transactions: [],
      };
    }
    
    const currentUser = JSON.parse(userJson);
    const account = await db.getFirstAsync<{ account_number: string }>(
      'SELECT account_number FROM accounts WHERE user_id = ?',
      [currentUser.uid]
    );
    
    if (!account) {
      return {
        success: false,
        page: params?.page || 1,
        pageSize: params?.pageSize || 20,
        hasMore: false,
        transactions: [],
      };
    }

    const page = params?.page || 1;
    const pageSize = params?.pageSize || 20;
    const offset = (page - 1) * pageSize;

    let query = 'SELECT * FROM transactions WHERE account_number = ?';
    const queryParams: (string | number)[] = [account.account_number];
    
    if (params?.transactionType) {
      query += ' AND type = ?';
      queryParams.push(params.transactionType);
    }
    
    query += ' ORDER BY timestamp DESC LIMIT ? OFFSET ?';
    queryParams.push(pageSize + 1, offset);

    const transactions = await db.getAllAsync<{
      id: string;
      account_number: string;
      amount: number;
      type: string;
      timestamp: number;
      new_balance: number;
      category: string | null;
    }>(query, queryParams);

    const hasMore = transactions.length > pageSize;
    const resultTransactions = transactions.slice(0, pageSize);

    return {
      success: true,
      page,
      pageSize,
      hasMore,
      transactions: resultTransactions.map(tx => ({
        id: tx.id,
        type: tx.type as TransactionType,
        amount: tx.amount,
        timestamp: new Date(tx.timestamp),
        newBalance: tx.new_balance,
        accountNumber: tx.account_number,
        category: tx.category || undefined,
      })),
    };
  }
}
