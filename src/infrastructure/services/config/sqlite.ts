import * as SQLite from 'expo-sqlite';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { passwordHashService } from '../crypto';
import { logger } from '../logger';

const MIGRATION_KEY = '@techchallenge3:password_migration_completed';

export class SQLiteDatabase {
  private static instance: SQLite.SQLiteDatabase | null = null;

  private constructor() {}

  public static async getInstance(): Promise<SQLite.SQLiteDatabase> {
    if (!this.instance) {
      this.instance = await SQLite.openDatabaseAsync('techchallenge3.db');
      await this.initializeTables();
      await this.migratePasswords();
    }
    return this.instance;
  }

  private static async migratePasswords(): Promise<void> {
    try {
      const migrationCompleted = await AsyncStorage.getItem(MIGRATION_KEY);
      if (migrationCompleted === 'true') {
        return;
      }

      const db = this.instance;
      if (!db) return;

      const users = await db.getAllAsync<{
        id: string;
        email: string;
        password: string;
      }>('SELECT id, email, password FROM users');

      if (users.length === 0) {
        await AsyncStorage.setItem(MIGRATION_KEY, 'true');
        return;
      }

      let migratedCount = 0;

      for (const user of users) {
        if (passwordHashService.isHashed(user.password)) {
          continue;
        }

        try {
          const hashedPassword = await passwordHashService.hashPassword(user.password);
          await db.runAsync('UPDATE users SET password = ? WHERE id = ?', [
            hashedPassword,
            user.id,
          ]);
          migratedCount++;
        } catch (error) {
          logger.error(`Erro ao migrar senha do usuário ${user.id}`, error);
        }
      }

      if (migratedCount > 0) {
        logger.info(`Migração de senhas concluída: ${migratedCount} usuário(s) migrado(s)`);
      }

      await AsyncStorage.setItem(MIGRATION_KEY, 'true');
    } catch (error) {
      logger.error('Erro durante migração de senhas', error);
    }
  }

  private static async initializeTables(): Promise<void> {
    const db = this.instance;
    if (!db) return;

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        password TEXT NOT NULL,
        created_at INTEGER NOT NULL
      );
    `);

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS accounts (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        account_number TEXT UNIQUE NOT NULL,
        agency TEXT NOT NULL,
        owner_name TEXT NOT NULL,
        owner_email TEXT NOT NULL,
        balance REAL NOT NULL DEFAULT 0,
        created_at INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
    `);

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS cards (
        id TEXT PRIMARY KEY,
        account_number TEXT NOT NULL,
        card_number TEXT NOT NULL,
        card_type TEXT NOT NULL,
        cardholder_name TEXT NOT NULL,
        cvv TEXT NOT NULL,
        expiry_date TEXT NOT NULL,
        brand TEXT NOT NULL,
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at INTEGER NOT NULL,
        FOREIGN KEY (account_number) REFERENCES accounts(account_number)
      );
    `);

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        account_number TEXT NOT NULL,
        amount REAL NOT NULL,
        type TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        new_balance REAL NOT NULL,
        category TEXT,
        created_at INTEGER NOT NULL,
        FOREIGN KEY (account_number) REFERENCES accounts(account_number)
      );
    `);

    await db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);
      CREATE INDEX IF NOT EXISTS idx_cards_account_number ON cards(account_number);
      CREATE INDEX IF NOT EXISTS idx_transactions_account_number ON transactions(account_number);
      CREATE INDEX IF NOT EXISTS idx_transactions_timestamp ON transactions(timestamp);
    `);
  }

  public static async closeDatabase(): Promise<void> {
    if (this.instance) {
      await this.instance.closeAsync();
      this.instance = null;
    }
  }

  public static async clearAllData(): Promise<void> {
    const db = await this.getInstance();
    await db.execAsync(`
      DELETE FROM transactions;
      DELETE FROM cards;
      DELETE FROM accounts;
      DELETE FROM users;
    `);
  }
}
