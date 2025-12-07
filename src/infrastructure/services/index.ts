import { AccountRepository } from '../repositories/account.repository';
import { CardRepository } from '../repositories/card.repository';
import { TransactionRepository } from '../repositories/transaction.repository';

const accountRepo = new AccountRepository();
const cardRepo = new CardRepository();
const transactionRepo = new TransactionRepository();

export const createBankAccount = async (params: { uid: string; ownerEmail: string; ownerName: string }) => {
  const account = await accountRepo.createAccount(params);
  return { data: { success: true, ...account } };
};

export const getAccountDetails = async () => {
  const account = await accountRepo.getAccountDetails();
  if (!account) {
    return { success: false, accountNumber: '', agency: '', ownerName: '', ownerEmail: '', balance: 0 };
  }
  return { success: true, ...account };
};

export const listPaymentCards = async () => {
  const cards = await cardRepo.listCards();
  return { success: true, cards };
};

export const createPaymentCard = async (payload: { type: string }) => {
  const account = await accountRepo.getAccountDetails();
  
  if (!account) {
    throw new Error('Conta não encontrada. É necessário ter uma conta para criar um cartão.');
  }

  const card = await cardRepo.createCard({
    cardType: payload.type as any,
    cardholderName: account.ownerName,
    accountNumber: account.accountNumber,
  });
  return { success: true, card };
};

export const getPaymentCardTransactions = async (payload: { cardId: string; limit?: number }) => {
  return { success: true, transactions: [] };
};

export const deletePaymentCard = async (payload: { cardId: string }) => {
  await cardRepo.deleteCard(payload.cardId);
  return { success: true };
};

export const getAccountStatementSimple = async (transactionType?: string) => {
  const transactions = await transactionRepo.getTransactions(undefined, transactionType as any);
  const serializedTransactions = transactions.map(t => ({
    ...t,
    timestamp: t.timestamp.toISOString()
  }));
  return { success: true, transactions: serializedTransactions };
};

export const getAccountStatement = async (params?: { page?: number; pageSize?: number }) => {
  const result = await transactionRepo.getAccountStatement(params);
  return {
    ...result,
    transactions: result.transactions.map(t => ({
      ...t,
      timestamp: t.timestamp.toISOString()
    }))
  };
};

export const getYearlyTransactions = async (year: number) => {
  const result = await transactionRepo.getYearlyTransactions(year);
  return {
    success: true,
    year: result.year,
    months: result.months.map(month => ({
      month: month.month,
      transactions: month.transactions.map(t => ({
        ...t,
        timestamp: t.timestamp.toISOString()
      }))
    }))
  };
};

export const performTransaction = async (payload: { amount: number; type: string; timestamp?: number }) => {
  const transaction = await transactionRepo.createTransaction(
    payload.amount,
    payload.type as any,
    payload.timestamp ? new Date(payload.timestamp) : undefined
  );
  return { success: true, transactionId: transaction.id, newBalance: transaction.newBalance };
};

export type * from './types/account';
export type * from './types/auth';
export type * from './types/card';
export type * from './types/transaction';

