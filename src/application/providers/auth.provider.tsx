import AsyncStorage from '@react-native-async-storage/async-storage';
import { updateProfile } from 'firebase/auth';
import React, { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react';
import { ACCOUNT_DETAILS_STORAGE_KEY, AUTH_DELAY_MS } from '../../constants';
import type { User } from '../../domain/entities/user.entity';
import { GetCurrentUserUseCase } from '../../domain/use-cases/auth/get-current-user.use-case';
import { SignInUseCase } from '../../domain/use-cases/auth/sign-in.use-case';
import { SignOutUseCase } from '../../domain/use-cases/auth/sign-out.use-case';
import { SignUpUseCase } from '../../domain/use-cases/auth/sign-up.use-case';
import { AuthRepository } from '../../infrastructure/repositories/auth.repository';
import { createBankAccount, getAccountDetails } from '../../infrastructure/services';

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

const authRepository = new AuthRepository();
const signInUseCase = new SignInUseCase(authRepository);
const signUpUseCase = new SignUpUseCase(authRepository);
const signOutUseCase = new SignOutUseCase(authRepository);
const getCurrentUserUseCase = new GetCurrentUserUseCase(authRepository);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
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
    }
  };

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const setupAuthListener = async () => {
      try {
        const currentUser = await getCurrentUserUseCase.execute();
        if (currentUser && !blockAuthStateUpdatesRef.current) {
          setUser(currentUser);
          await persistUserToken(currentUser);
        }

        unsubscribe = authRepository.onAuthStateChange(async (firebaseUser) => {
          if (firebaseUser && blockAuthStateUpdatesRef.current) {
            return;
          }

          setUser(firebaseUser);
          await persistUserToken(firebaseUser);
          setLoading(false);
        });

        setLoading(false);
      } catch (error) {
        console.error('Erro ao configurar listener de autenticação:', error);
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
      const loggedInUser = await signInUseCase.execute(email, password);
      setUser(loggedInUser);
      await persistUserToken(loggedInUser);
      
      return { success: true };
    } catch (error: any) {
      shouldPersistUserTokenRef.current = previousPersistence;
      console.error('Erro no login:', error);
      
      let errorMessage = 'Erro ao fazer login';
      
      if (error.code) {
        switch (error.code) {
          case 'auth/invalid-credential':
          case 'auth/wrong-password':
          case 'auth/user-not-found':
            errorMessage = 'Email ou senha incorretos. Verifique suas credenciais e tente novamente.';
            break;
          case 'auth/invalid-email':
            errorMessage = 'Email inválido. Verifique o formato do email.';
            break;
          case 'auth/user-disabled':
            errorMessage = 'Esta conta foi desabilitada. Entre em contato com o suporte.';
            break;
          case 'auth/too-many-requests':
            errorMessage = 'Muitas tentativas de login. Tente novamente mais tarde.';
            break;
          default:
            errorMessage = error.message || 'Erro ao fazer login';
        }
      } else {
        errorMessage = error.message || 'Erro ao fazer login';
      }
      
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
      
      const userCredential = await signUpUseCase.execute(email, password);
      const normalizedName = name.trim();

      if (normalizedName) {
        try {
          const firebaseAuth = await import('firebase/auth');
          const { getFirebaseAuth } = await import('../../infrastructure/services/config/firebase');
          const auth = getFirebaseAuth();
          const currentUser = auth.currentUser;
          if (currentUser) {
            await updateProfile(currentUser, { displayName: normalizedName });
          }
        } catch (profileError) {
          console.warn('Não foi possível atualizar o nome do usuário:', profileError);
        }
      }

      try {
        const callableResult = await createBankAccount({
          uid: userCredential.uid,
          ownerEmail: userCredential.email,
          ownerName: normalizedName || userCredential.email,
        });

        const callableData = callableResult.data as {
          success?: boolean;
          message?: string;
          accountNumber?: string;
          agency?: string;
          ownerName?: string;
          balance?: number;
        } | undefined;
        if (callableData && callableData.success === false) {
          throw new Error(callableData.message ?? 'Não foi possível criar a conta bancária.');
        }

        const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

        const waitForAccountDetails = async (
          maxAttempts: number = 6,
          delayMs: number = AUTH_DELAY_MS
        ) => {
          let lastError: unknown;

          for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
              const details = await getAccountDetails();
              if (details?.success && details.accountNumber) {
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
          callableData?.ownerName ??
          (normalizedName || userCredential.email || '');

        const initialAccountDetails = {
          accountNumber: accountDetails.accountNumber,
          agency: accountDetails.agency ?? callableData?.agency ?? '0001',
          ownerName: fallbackOwnerName,
          balance: accountDetails.balance ?? callableData?.balance ?? 0,
        };

        await AsyncStorage.setItem(
          ACCOUNT_DETAILS_STORAGE_KEY,
          JSON.stringify(initialAccountDetails)
        );
      } catch (bankAccountError: any) {
        console.error('Erro ao criar conta bancária:', bankAccountError);

        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem(ACCOUNT_DETAILS_STORAGE_KEY).catch(() => undefined);

        try {
          await signOutUseCase.execute();
        } catch (signOutError) {
          console.error('Erro ao desfazer cadastro após falha na criação da conta bancária:', signOutError);
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
      console.error('Erro no cadastro:', error);
      let errorMessage = error.message || 'Erro ao criar conta';

      if (error.code) {
        switch (error.code) {
          case 'auth/email-already-in-use':
            errorMessage = 'Este email já está cadastrado. Tente fazer login ou use outro email.';
            break;
          case 'auth/invalid-email':
            errorMessage = 'Email inválido. Verifique o formato do email.';
            break;
          case 'auth/weak-password':
            errorMessage = 'A senha deve ter pelo menos 6 caracteres.';
            break;
          default:
            errorMessage = error.message || 'Erro ao criar conta';
        }
      }

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
      await signOutUseCase.execute();
      setUser(null);
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem(ACCOUNT_DETAILS_STORAGE_KEY).catch(() => undefined);
    } catch (error) {
      console.error('Erro no logout:', error);
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

