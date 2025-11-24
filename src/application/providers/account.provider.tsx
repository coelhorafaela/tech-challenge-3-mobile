import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { ACCOUNT_DETAILS_STORAGE_KEY } from '../../constants/storageKeys';
import type { Account } from '../../domain/entities/account.entity';
import { GetAccountDetailsUseCase } from '../../domain/use-cases/account/get-account-details.use-case';
import { AccountRepository } from '../../infrastructure/repositories/account.repository';
import { useAuth } from './auth.provider';

interface AccountContextValue {
  account: Account | null;
  loadingAccount: boolean;
  error: string | null;
  refreshAccount: () => Promise<void>;
  clearAccount: () => Promise<void>;
}

const AccountContext = createContext<AccountContextValue | undefined>(undefined);

interface AccountProviderProps {
  children: ReactNode;
}

const accountRepository = new AccountRepository();
const getAccountDetailsUseCase = new GetAccountDetailsUseCase(accountRepository);

export const AccountProvider: React.FC<AccountProviderProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [account, setAccount] = useState<Account | null>(null);
  const [loadingAccount, setLoadingAccount] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const persistAccount = useCallback(async (details: Account | null) => {
    try {
      if (!details) {
        await AsyncStorage.removeItem(ACCOUNT_DETAILS_STORAGE_KEY);
        return;
      }

      await AsyncStorage.setItem(ACCOUNT_DETAILS_STORAGE_KEY, JSON.stringify({
        accountNumber: details.accountNumber,
        agency: details.agency,
        ownerName: details.ownerName,
        balance: details.balance,
      }));
    } catch (storageError) {
      console.warn('Não foi possível persistir os dados da conta:', storageError);
    }
  }, []);

  const loadStoredAccount = useCallback(async (): Promise<Account | null> => {
    try {
      const stored = await AsyncStorage.getItem(ACCOUNT_DETAILS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as {
          accountNumber: string;
          agency: string;
          ownerName: string;
          balance: number;
        };
        const accountEntity: Account = {
          accountNumber: parsed.accountNumber,
          agency: parsed.agency,
          ownerName: parsed.ownerName,
          ownerEmail: '', // Não está armazenado
          balance: parsed.balance,
        };
        if (isMountedRef.current) {
          setAccount(accountEntity);
        }
        return accountEntity;
      }
    } catch (storageError) {
      console.warn('Não foi possível carregar os dados da conta armazenados:', storageError);
    }

    return null;
  }, []);

  const clearAccount = useCallback(async () => {
    if (isMountedRef.current) {
      setAccount(null);
      setError(null);
    }

    await persistAccount(null).catch(() => undefined);
  }, [persistAccount]);

  const refreshAccount = useCallback(async () => {
    if (!isAuthenticated) {
      await clearAccount();
      return;
    }

    if (isMountedRef.current) {
      setLoadingAccount(true);
      setError(null);
    }

    try {
      const accountDetails = await getAccountDetailsUseCase.execute();

      if (!accountDetails) {
        throw new Error('Não foi possível obter os dados da conta.');
      }

      if (isMountedRef.current) {
        setAccount(accountDetails);
      }

      await persistAccount(accountDetails);
    } catch (accountError: any) {
      console.error('Erro ao buscar detalhes da conta:', accountError);
      if (isMountedRef.current) {
        setError(accountError?.message ?? 'Erro ao buscar detalhes da conta.');
      }
    } finally {
      if (isMountedRef.current) {
        setLoadingAccount(false);
      }
    }
  }, [clearAccount, isAuthenticated, persistAccount]);

  useEffect(() => {
    if (!isAuthenticated) {
      clearAccount();
      return;
    }

    let cancelled = false;

    const synchronizeAccount = async () => {
      await loadStoredAccount();
      if (!cancelled) {
        await refreshAccount();
      }
    };

    synchronizeAccount();

    return () => {
      cancelled = true;
    };
  }, [clearAccount, isAuthenticated, loadStoredAccount, refreshAccount]);

  const value = useMemo<AccountContextValue>(
    () => ({
      account,
      loadingAccount,
      error,
      refreshAccount,
      clearAccount,
    }),
    [account, loadingAccount, error, refreshAccount, clearAccount]
  );

  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>;
};

export const useAccount = (): AccountContextValue => {
  const context = useContext(AccountContext);
  if (!context) {
    throw new Error('useAccount deve ser usado dentro de um AccountProvider');
  }

  return context;
};

