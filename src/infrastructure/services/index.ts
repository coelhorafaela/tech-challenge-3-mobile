// Config
export { app, auth, functions, getFirebaseApp, getFirebaseAuth, getFirebaseFunctions, isFirebaseAvailable } from './config/firebase';

// Auth
export { getCurrentUser, onAuthStateChange, signIn, signOut, signUp } from './auth/authService';

// Account
export { createBankAccount, getAccountDetails } from './account/accountService';

// Transaction
export { getAccountStatement, getAccountStatementSimple, getYearlyTransactions, performTransaction } from './transaction/transactionService';

// Card
export { createPaymentCard, deletePaymentCard, getPaymentCardTransactions, listPaymentCards } from './card/cardService';

// Types
export type * from './types/account';
export type * from './types/auth';
export type * from './types/card';
export type * from './types/transaction';

