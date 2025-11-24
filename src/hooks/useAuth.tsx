import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, updateProfile } from 'firebase/auth';
import React, { ReactNode, createContext, useContext, useEffect, useRef, useState } from 'react';

import { ACCOUNT_DETAILS_STORAGE_KEY, AUTH_DELAY_MS } from '../constants';
import { createBankAccount, getAccountDetails, getCurrentUser, isFirebaseAvailable, onAuthStateChange, signIn, signOut, signUp } from '../services';

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

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const firebaseConfiguredRef = useRef(isFirebaseAvailable());
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

    const setupAuthListener = () => {
      firebaseConfiguredRef.current = isFirebaseAvailable();

      if (!firebaseConfiguredRef.current) {
        console.error('Firebase Auth não está configurado. Verifique as variáveis de ambiente.');
        setLoading(false);
        return;
      }

      const currentUser = getCurrentUser();
      if (currentUser && !blockAuthStateUpdatesRef.current) {
        setUser(currentUser);
        void persistUserToken(currentUser);
        setLoading(false);
      }

      unsubscribe = onAuthStateChange(async (firebaseUser) => {
        if (firebaseUser && blockAuthStateUpdatesRef.current) {
          return;
        }

        setUser(firebaseUser);

        await persistUserToken(firebaseUser);

        setLoading(false);
      });
    };

    setupAuthListener();

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
      if (!firebaseConfiguredRef.current) {
        firebaseConfiguredRef.current = isFirebaseAvailable();
      }

      if (!firebaseConfiguredRef.current) {
        throw new Error('Firebase Auth não está configurado. Verifique as variáveis de ambiente.');
      }

      const userCredential = await signIn(email, password);
      setUser(userCredential.user);
      await persistUserToken(userCredential.user);
      
      return { success: true };
    } catch (error: any) {
      shouldPersistUserTokenRef.current = previousPersistence;
      console.error('Erro no login:', error);
      
      // Tratar erros específicos do Firebase
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
      
      if (!firebaseConfiguredRef.current) {
        firebaseConfiguredRef.current = isFirebaseAvailable();
      }

      if (!firebaseConfiguredRef.current) {
        throw new Error('Firebase Auth não está configurado. Verifique as variáveis de ambiente.');
      }
      const userCredential = await signUp(email, password);
      const normalizedName = name.trim();

      if (normalizedName) {
        try {
          await updateProfile(userCredential.user, {
            displayName: normalizedName,
          });
        } catch (profileError) {
          console.warn('Não foi possível atualizar o nome do usuário:', profileError);
        }
      }

      try {
        const callableResult = await createBankAccount({
          uid: userCredential.user.uid,
          ownerEmail: userCredential.user.email,
          ownerName: normalizedName || userCredential.user.email,
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
          (normalizedName || userCredential.user.email || '');

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

        if (firebaseConfiguredRef.current) {
          try {
            await signOut();
          } catch (signOutError) {
            console.error('Erro ao desfazer cadastro após falha na criação da conta bancária:', signOutError);
          }
        }

        const formattedError = new Error(
          bankAccountError?.message ?? 'Erro ao criar conta bancária. Tente novamente mais tarde.'
        );
        (formattedError as any).code = bankAccountError?.code ?? 'functions/create-bank-account';
        throw formattedError;
      }

      setUser(userCredential.user);
      await AsyncStorage.setItem('userToken', userCredential.user.uid);
      
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
      if (!firebaseConfiguredRef.current) {
        firebaseConfiguredRef.current = isFirebaseAvailable();
      }

      if (firebaseConfiguredRef.current) {
        await signOut();
      }
      
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
