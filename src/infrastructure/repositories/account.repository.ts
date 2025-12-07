import AsyncStorage from '@react-native-async-storage/async-storage';

import { CURRENT_USER_KEY } from '../../constants';
import type { Account } from '../../domain/entities/account.entity';
import type { AccountRepository as IAccountRepository } from '../../domain/repositories/account.repository';
import { SQLiteDatabase } from '../services/config/sqlite';

export class AccountRepository implements IAccountRepository {
  async createAccount(params: {
    uid: string;
    ownerEmail: string;
    ownerName: string;
  }): Promise<Account> {
    const db = await SQLiteDatabase.getInstance();

    const existingAccount = await db.getFirstAsync<{ id: string }>(
      'SELECT id FROM accounts WHERE user_id = ?',
      [params.uid]
    );

    if (existingAccount) {
      throw new Error('Usuário já possui uma conta bancária');
    }

    const accountNumber = `${Math.floor(10000000 + Math.random() * 90000000)}`;
    const accountId = `account_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const createdAt = Date.now();

    await db.runAsync(
      'INSERT INTO accounts (id, user_id, account_number, agency, owner_name, owner_email, balance, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [accountId, params.uid, accountNumber, '0001', params.ownerName, params.ownerEmail, 0, createdAt]
    );

    return {
      accountNumber,
      agency: '0001',
      ownerName: params.ownerName,
      ownerEmail: params.ownerEmail,
      balance: 0,
    };
  }

  async getAccountDetails(): Promise<Account | null> {
    try {
      const userJson = await AsyncStorage.getItem(CURRENT_USER_KEY);
      if (!userJson) {
        return null;
      }
      
      const currentUser = JSON.parse(userJson);
      const db = await SQLiteDatabase.getInstance();
      
      const account = await db.getFirstAsync<{
        account_number: string;
        agency: string;
        owner_name: string;
        owner_email: string;
        balance: number;
      }>('SELECT account_number, agency, owner_name, owner_email, balance FROM accounts WHERE user_id = ?', [currentUser.uid]);

      if (!account) {
        return null;
      }

      return {
        accountNumber: account.account_number,
        agency: account.agency,
        ownerName: account.owner_name,
        ownerEmail: account.owner_email,
        balance: account.balance,
      };
    } catch (error) {
      console.error('Erro ao buscar detalhes da conta:', error);
      return null;
    }
  }

  async updateAccountBalance(accountNumber: string, newBalance: number): Promise<void> {
    const db = await SQLiteDatabase.getInstance();
    
    await db.runAsync(
      'UPDATE accounts SET balance = ? WHERE account_number = ?',
      [newBalance, accountNumber]
    );
  }
}
