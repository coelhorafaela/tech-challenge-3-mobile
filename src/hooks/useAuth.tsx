import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { ACCOUNT_DETAILS_STORAGE_KEY, AUTH_DELAY_MS } from '../constants';
import type { User } from '../domain/entities/user.entity';
import { AccountRepository } from '../infrastructure/repositories/account.repository';
import { AuthRepository } from '../infrastructure/repositories/auth.repository';
import { logger } from '../infrastructure/services/logger';

const authRepository = new AuthRepository();
const accountRepository = new AccountRepository();

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (
    email: string,
    password: string,
    rememberDevice?: boolean
  ) => Promise<{ success: boolean; error?: string }>;
  register: (
    email: string,
    password: string,
    name: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const shouldPersistUserTokenRef = useRef(true);
  const blockAuthStateUpdatesRef = useRef(false);

  const persistUserToken = async (maybeUser: User | null) => {
    try {
      if (maybeUser && shouldPersistUserTokenRef.current) {
        await AsyncStorage.setItem('userToken', maybeUser.uid);
      } else {
        await AsyncStorage.removeItem('userToken');
      }
    } catch {
      // Ignorar falhas para não interromper o fluxo principal
    }
  };

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const setupAuthListener = async () => {
      try {
        const currentUser = await authRepository.getCurrentUser();
        if (currentUser && !blockAuthStateUpdatesRef.current) {
          setUser(currentUser);
          await persistUserToken(currentUser);
        }

        unsubscribe = authRepository.onAuthStateChange(async (user) => {
          if (user && blockAuthStateUpdatesRef.current) {
            return;
          }

          setUser(user);
          await persistUserToken(user);
          setLoading(false);
        });

        setLoading(false);
      } catch (error) {
        logger.error('Erro ao configurar listener de autenticação', error);
        setLoading(false);
      }
    };

    void setupAuthListener();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const login = async (
    email: string,
    password: string,
    rememberDevice: boolean = true
  ): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    const previousPersistence = shouldPersistUserTokenRef.current;
    const shouldPersistSession = rememberDevice !== false;
    shouldPersistUserTokenRef.current = shouldPersistSession;

    try {
      const loggedInUser = await authRepository.signIn(email, password);
      setUser(loggedInUser);
      await persistUserToken(loggedInUser);
      
      return { success: true };
    } catch (error: any) {
      shouldPersistUserTokenRef.current = previousPersistence;
      logger.error('Erro no login', error);
      
      let errorMessage = error.message || 'Erro ao fazer login';
      
      return { 
        success: false, 
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    email: string,
    password: string,
    name: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      blockAuthStateUpdatesRef.current = true;
      
      const userCredential = await authRepository.signUp(email, password);
      const normalizedName = name.trim();

      if (normalizedName) {
        try {
          await authRepository.updateUserProfile(userCredential.uid, normalizedName);
        } catch (profileError) {
          logger.warn('Não foi possível atualizar o nome do usuário', profileError);
        }
      }

      try {
        const account = await accountRepository.createAccount({
          uid: userCredential.uid,
          ownerEmail: userCredential.email,
          ownerName: normalizedName || userCredential.email,
        });

        const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

        const waitForAccountDetails = async (
          maxAttempts: number = 6,
          delayMs: number = AUTH_DELAY_MS
        ) => {
          let lastError: unknown;

          for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
              const details = await accountRepository.getAccountDetails();
              if (details && details.accountNumber) {
                return details;
              }
            } catch (detailError) {
              lastError = detailError;
            }

            if (attempt < maxAttempts) {
              await sleep(delayMs);
            }
          }

          if (lastError instanceof Error) {
            throw lastError;
          }

          throw new Error('Conta bancária ainda não está disponível. Tente novamente.');
        };

        const accountDetails = await waitForAccountDetails();

        const fallbackOwnerName =
          accountDetails.ownerName ??
          account.ownerName ??
          (normalizedName || userCredential.email || '');

        const initialAccountDetails = {
          accountNumber: accountDetails.accountNumber,
          agency: accountDetails.agency ?? account.agency ?? '0001',
          ownerName: fallbackOwnerName,
          balance: accountDetails.balance ?? account.balance ?? 0,
        };

        await AsyncStorage.setItem(
          ACCOUNT_DETAILS_STORAGE_KEY,
          JSON.stringify(initialAccountDetails)
        );
      } catch (bankAccountError: any) {
        logger.error('Erro ao criar conta bancária', bankAccountError);

        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem(ACCOUNT_DETAILS_STORAGE_KEY).catch(() => undefined);

        try {
          await authRepository.signOut();
        } catch (signOutError) {
          logger.error('Erro ao desfazer cadastro após falha na criação da conta bancária', signOutError);
        }

        const formattedError = new Error(
          bankAccountError?.message ?? 'Erro ao criar conta bancária. Tente novamente mais tarde.'
        );
        (formattedError as any).code = bankAccountError?.code ?? 'functions/create-bank-account';
        throw formattedError;
      }

      setUser(userCredential);
      await AsyncStorage.setItem('userToken', userCredential.uid);
      
      return { success: true };
    } catch (error: any) {
      logger.error('Erro no cadastro', error);
      let errorMessage = error.message || 'Erro ao criar conta';

      return { 
        success: false, 
        error: errorMessage
      };
    } finally {
      blockAuthStateUpdatesRef.current = false;
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authRepository.signOut();
      setUser(null);
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem(ACCOUNT_DETAILS_STORAGE_KEY).catch(() => undefined);
    } catch (error) {
      logger.error('Erro no logout', error);
    } finally {
      shouldPersistUserTokenRef.current = true;
    }
  };



  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
