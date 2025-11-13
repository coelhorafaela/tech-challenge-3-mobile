import AsyncStorage from '@react-native-async-storage/async-storage';
import { FirebaseApp, getApp, getApps, initializeApp, type FirebaseOptions } from 'firebase/app';
import * as firebaseAuth from 'firebase/auth';
import {
  Auth,
  connectAuthEmulator,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  getAuth,
  initializeAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  User
} from 'firebase/auth';
import {
  connectFunctionsEmulator,
  getFunctions,
  httpsCallable,
  type Functions,
  type HttpsCallableResult,
} from 'firebase/functions';

// type FirebaseEnvKey =
//   | 'EXPO_PUBLIC_FIREBASE_API_KEY'
//   | 'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN'
//   | 'EXPO_PUBLIC_FIREBASE_PROJECT_ID'
//   | 'EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET'
//   | 'EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'
//   | 'EXPO_PUBLIC_FIREBASE_APP_ID';

// const readEnv = (key: FirebaseEnvKey): string => {
//   const value = process.env[key];

//   if (typeof value !== 'string' || value.length === 0) {
//     throw new Error(`Missing Firebase environment variable: ${key}`);
//   }

//   return value;
// };

// Configuração Firebase usando variáveis de ambiente
const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyAbkeyGBEQ4PBmAvcSOF7dwJblEImV2vpc",
  authDomain: "fiap-tech-challenge-3-bytebank.firebaseapp.com",
  projectId: "fiap-tech-challenge-3-bytebank",
  storageBucket: "fiap-tech-challenge-3-bytebank.firebasestorage.app",
  messagingSenderId: "673832118783",
  appId: "1:673832118783:web:e5d5401ee8aaf2e0531fca",
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let functions: Functions | null = null;

const parsePort = (value: string | undefined, fallback: number): number => {
  const parsed = Number.parseInt(value ?? '', 10);
  if (Number.isFinite(parsed)) {
    return parsed;
  }
  return fallback;
};

const isDevelopment =
  process.env.EXPO_PUBLIC_FIREBASE_USE_EMULATOR === 'true' ||
  process.env.EXPO_PUBLIC_FIREBASE_USE_EMULATOR === '1';

const functionsEmulatorHost = process.env.EXPO_PUBLIC_FIREBASE_FUNCTIONS_HOST ?? '127.0.0.1';
const functionsEmulatorPort = parsePort(process.env.EXPO_PUBLIC_FIREBASE_FUNCTIONS_PORT, 5001);

const authEmulatorHost = process.env.EXPO_PUBLIC_FIREBASE_AUTH_HOST ?? '127.0.0.1';
const authEmulatorPort = parsePort(process.env.EXPO_PUBLIC_FIREBASE_AUTH_PORT, 9099);

// Inicializar Firebase
try {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }
  
  // Inicializar Auth com persistência AsyncStorage
  try {
    const reactNativePersistence = (firebaseAuth as any).getReactNativePersistence;
    auth = initializeAuth(app, {
      persistence: reactNativePersistence(AsyncStorage),
    });
  } catch (error) {
    // Se initializeAuth falhar (já inicializado), usar getAuth
    auth = getAuth(app);
  }
  
  functions = getFunctions(app);

  // Conectar ao emulador em desenvolvimento (silenciosamente)
  if (isDevelopment && auth && functions) {
    try {
      // Tentar conectar ao Auth Emulator
      connectAuthEmulator(auth, `http://${authEmulatorHost}:${authEmulatorPort}`, {
        disableWarnings: true,
      });

      // Tentar conectar ao Functions Emulator
      connectFunctionsEmulator(functions, functionsEmulatorHost, functionsEmulatorPort);
      
      // Emulador conectado com sucesso (modo silencioso)
    } catch (emulatorError) {
      // Emulador não disponível - continuar em modo desenvolvimento (silencioso)
    }
  }
  
} catch (error) {
  console.warn('Erro ao inicializar Firebase:', error);
  app = null;
  auth = null;
  functions = null;
}

const getFunctionsInstance = (): Functions => {
  if (!functions) {
    throw new Error('Firebase Functions não está configurado');
  }

  return functions;
};

type HealthCheckResponse = {
  success: boolean;
  docId?: string;
  error?: string;
};

export const healthCheck = async (): Promise<HttpsCallableResult<HealthCheckResponse>> => {
  const callable = httpsCallable<unknown, HealthCheckResponse>(
    getFunctionsInstance(),
    'healthCheck',
  );
  return callable();
};

type CreateBankAccountPayload = {
  uid: string;
  ownerEmail?: string | null;
  ownerName?: string | null;
};

type CreateBankAccountResponse = {
  success?: boolean;
  message?: string;
};

type GetAccountDetailsPayload = {
  accountNumber?: string;
};

export type GetAccountDetailsResponse = {
  success: boolean;
  accountNumber: string;
  agency: string;
  ownerName: string;
  balance: number;
};

export type PerformTransactionPayload = {
  amount: number;
  type: 'DEPOSIT' | 'WITHDRAWAL';
  timestamp?: number;
};

export type PerformTransactionResponse = {
  success: boolean;
  transactionId: string;
  newBalance: number;
};

export type AccountStatementEntryType = 'DEPOSIT' | 'WITHDRAWAL' | 'CARD';

export type GetAccountStatementPayload = {
  page?: number;
  pageSize?: number;
  transactionType?: AccountStatementEntryType;
};

export type AccountStatementEntry = {
  id: string;
  type: AccountStatementEntryType;
  amount: number;
  timestamp: string;
  newBalance: number;
};

export type GetAccountStatementResponse = {
  success: boolean;
  page: number;
  pageSize: number;
  hasMore: boolean;
  transactions: AccountStatementEntry[];
};

export type PaymentCardType = 'CREDIT' | 'DEBIT' | 'PHYSICAL' | 'VIRTUAL';

export type PaymentCard = {
  id: string;
  cardType: PaymentCardType;
  brand?: string | null;
  label?: string | null;
  maskedNumber?: string | null;
  lastFourDigits?: string | null;
  cardNumber?: string | null;
  accountId?: string | null;
  accountNumber?: string | null;
  invoiceAmount?: number | null;
  invoiceDueDate?: string | null;
  availableLimit?: number | null;
  creditLimit?: number | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type ListPaymentCardsResponse = {
  success: boolean;
  cards: PaymentCard[];
};

export type CreatePaymentCardPayload = {
  type: PaymentCardType;
  label?: string;
  brand?: string;
};

export type CreatePaymentCardResponse = {
  success: boolean;
  card: PaymentCard;
  message?: string;
};

export type PaymentCardTransactionType =
  | 'DEBIT'
  | 'CREDIT'
  | 'PURCHASE'
  | 'PAYMENT'
  | 'REFUND'
  | 'ADJUSTMENT'
  | 'CARD';

export type PaymentCardTransaction = {
  id: string;
  type: PaymentCardTransactionType;
  direction?: 'DEBIT' | 'CREDIT';
  description?: string | null;
  amount: number;
  timestamp: string;
  category?: string | null;
};

export type GetPaymentCardTransactionsPayload = {
  cardId: string;
  limit?: number;
};

export type GetPaymentCardTransactionsResponse = {
  success: boolean;
  transactions: PaymentCardTransaction[];
};

export type DeletePaymentCardPayload = {
  cardId: string;
};

export type DeletePaymentCardResponse = {
  success: boolean;
  removedTransactions?: number;
};

export const createBankAccount = async (
  payload: CreateBankAccountPayload
): Promise<HttpsCallableResult<CreateBankAccountResponse>> => {
  const callable = httpsCallable<CreateBankAccountPayload, CreateBankAccountResponse>(
    getFunctionsInstance(),
    'createBankAccount',
  );
  return callable(payload);
};

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

export const getAccountDetails = async (
  payload?: GetAccountDetailsPayload
): Promise<GetAccountDetailsResponse> => {
  if (!functions) {
    throw new Error('Firebase Functions não está configurado');
  }

  const callable = httpsCallable<GetAccountDetailsPayload, GetAccountDetailsResponse>(
    functions,
    'getAccountDetails'
  );

  const response = await callable(payload ?? {});
  return normalizeCallableData<GetAccountDetailsResponse>(response.data);
};

export const performTransaction = async (
  payload: PerformTransactionPayload
): Promise<PerformTransactionResponse> => {
  if (!functions) {
    throw new Error('Firebase Functions não está configurado');
  }

  const callable = httpsCallable<PerformTransactionPayload, PerformTransactionResponse>(
    functions,
    'performTransaction'
  );

  const response = await callable(payload);
  return normalizeCallableData<PerformTransactionResponse>(response.data);
};

export const getAccountStatement = async (
  payload?: GetAccountStatementPayload
): Promise<GetAccountStatementResponse> => {
  if (!functions) {
    throw new Error('Firebase Functions não está configurado');
  }

  const callable = httpsCallable<GetAccountStatementPayload, GetAccountStatementResponse>(
    functions,
    'getAccountStatement'
  );

  const response = await callable(payload ?? {});
  return normalizeCallableData<GetAccountStatementResponse>(response.data);
};

export const listPaymentCards = async (): Promise<ListPaymentCardsResponse> => {
  if (!functions) {
    throw new Error('Firebase Functions não está configurado');
  }

  const callable = httpsCallable<Record<string, never>, ListPaymentCardsResponse>(
    functions,
    'listPaymentCards'
  );

  const response = await callable({} as Record<string, never>);
  return normalizeCallableData<ListPaymentCardsResponse>(response.data);
};

export const createPaymentCard = async (
  payload: CreatePaymentCardPayload
): Promise<CreatePaymentCardResponse> => {
  if (!functions) {
    throw new Error('Firebase Functions não está configurado');
  }

  const callable = httpsCallable<CreatePaymentCardPayload, CreatePaymentCardResponse>(
    functions,
    'createPaymentCard'
  );

  const response = await callable(payload);
  return normalizeCallableData<CreatePaymentCardResponse>(response.data);
};

export const getPaymentCardTransactions = async (
  payload: GetPaymentCardTransactionsPayload
): Promise<GetPaymentCardTransactionsResponse> => {
  if (!functions) {
    throw new Error('Firebase Functions não está configurado');
  }

  const callable = httpsCallable<
    GetPaymentCardTransactionsPayload,
    GetPaymentCardTransactionsResponse
  >(functions, 'getPaymentCardTransactions');

  const response = await callable(payload);
  return normalizeCallableData<GetPaymentCardTransactionsResponse>(response.data);
};

export const deletePaymentCard = async (
  payload: DeletePaymentCardPayload
): Promise<DeletePaymentCardResponse> => {
  if (!functions) {
    throw new Error('Firebase Functions não está configurado');
  }

  const callable = httpsCallable<DeletePaymentCardPayload, DeletePaymentCardResponse>(
    functions,
    'deletePaymentCard'
  );

  const response = await callable(payload);
  return normalizeCallableData<DeletePaymentCardResponse>(response.data);
};

// Funções de autenticação
export const signIn = async (email: string, password: string) => {
  if (!auth) {
    throw new Error('Firebase Auth não está configurado');
  }
  return await signInWithEmailAndPassword(auth, email, password);
};

export const signUp = async (email: string, password: string) => {
  if (!auth) {
    throw new Error('Firebase Auth não está configurado');
  }
  return await createUserWithEmailAndPassword(auth, email, password);
};

export const signOut = async () => {
  if (!auth) {
    throw new Error('Firebase Auth não está configurado');
  }
  return await firebaseSignOut(auth);
};

export const getCurrentUser = (): User | null => {
  if (!auth) {
    return null;
  }
  return auth.currentUser;
};

export const onAuthStateChange = (callback: (user: User | null) => void) => {
  if (!auth) {
    throw new Error('Firebase Auth não está configurado');
  }
  return onAuthStateChanged(auth, callback);
};

// Função para verificar se o Firebase está disponível
export const isFirebaseAvailable = (): boolean => {
  return auth !== null;
};

export { app, auth, functions };
