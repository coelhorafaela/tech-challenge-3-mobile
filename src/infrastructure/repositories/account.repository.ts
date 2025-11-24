import { httpsCallable } from 'firebase/functions';
import { AccountMapper } from '../../application/mappers/account.mapper';
import type { Account } from '../../domain/entities/account.entity';
import type { AccountRepository as IAccountRepository } from '../../domain/repositories/account.repository';
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

export class AccountRepository implements IAccountRepository {
  async createAccount(params: {
    uid: string;
    ownerEmail: string;
    ownerName: string;
  }): Promise<Account> {
    const functions = getFirebaseFunctions();
    const callable = httpsCallable<
      { uid: string; ownerEmail?: string | null; ownerName?: string | null },
      {
        success?: boolean;
        message?: string;
        accountNumber?: string;
        agency?: string;
        ownerName?: string;
        balance?: number;
      }
    >(functions, 'createBankAccount');

    const response = await callable({
      uid: params.uid,
      ownerEmail: params.ownerEmail,
      ownerName: params.ownerName,
    });

    const data = normalizeCallableData<{
      success?: boolean;
      message?: string;
      accountNumber?: string;
      agency?: string;
      ownerName?: string;
      balance?: number;
    }>(response.data);

    if (data.success === false) {
      throw new Error(data.message ?? 'Não foi possível criar a conta bancária.');
    }

    return AccountMapper.fromFirebaseResponse({
      accountNumber: data.accountNumber || '',
      agency: data.agency || '0001',
      ownerName: data.ownerName || params.ownerName,
      ownerEmail: params.ownerEmail,
      balance: data.balance || 0,
    });
  }

  async getAccountDetails(): Promise<Account | null> {
    const functions = getFirebaseFunctions();
    const callable = httpsCallable<
      { accountNumber?: string },
      {
        success: boolean;
        accountNumber: string;
        agency: string;
        ownerName: string;
        balance: number;
      }
    >(functions, 'getAccountDetails');

    try {
      const response = await callable({});
      const data = normalizeCallableData<{
        success: boolean;
        accountNumber: string;
        agency: string;
        ownerName: string;
        balance: number;
      }>(response.data);

      if (!data.success) {
        return null;
      }

      return AccountMapper.fromFirebaseResponse({
        accountNumber: data.accountNumber,
        agency: data.agency,
        ownerName: data.ownerName,
        ownerEmail: '', // Não vem na resposta, será preenchido pelo provider se necessário
        balance: data.balance,
      });
    } catch (error) {
      console.error('Erro ao buscar detalhes da conta:', error);
      return null;
    }
  }

  async updateAccountBalance(accountNumber: string, newBalance: number): Promise<void> {
    throw new Error('Atualização de saldo não implementada diretamente');
  }
}

