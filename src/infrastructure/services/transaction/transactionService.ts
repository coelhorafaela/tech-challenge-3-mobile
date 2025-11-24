import { httpsCallable } from 'firebase/functions';
import { getFirebaseFunctions } from '../config/firebase';
import type {
    GetAccountStatementPayload,
    GetAccountStatementResponse,
    PerformTransactionPayload,
    PerformTransactionResponse,
    StatementResponse,
    TransactionType,
    YearlyTransactionsResponse,
} from '../types/transaction';

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

export const performTransaction = async (
  payload: PerformTransactionPayload
): Promise<PerformTransactionResponse> => {
  const functions = getFirebaseFunctions();
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
  const functions = getFirebaseFunctions();
  const callable = httpsCallable<GetAccountStatementPayload, GetAccountStatementResponse>(
    functions,
    'getAccountStatement'
  );

  const response = await callable(payload ?? {});
  return normalizeCallableData<GetAccountStatementResponse>(response.data);
};

export const getAccountStatementSimple = async (
  transactionType?: TransactionType
): Promise<StatementResponse> => {
  const functions = getFirebaseFunctions();
  const payload: Record<string, unknown> = {};

  if (transactionType) {
    payload.transactionType = transactionType;
  }

  const callable = httpsCallable<Record<string, unknown>, StatementResponse>(
    functions,
    'getAccountStatement'
  );

  const response = await callable(payload);
  return normalizeCallableData<StatementResponse>(response.data);
};

export const getYearlyTransactions = async (
  year: number
): Promise<YearlyTransactionsResponse> => {
  const functions = getFirebaseFunctions();
  const callable = httpsCallable<{ year: number }, YearlyTransactionsResponse>(
    functions,
    'getYearlyTransactions'
  );

  const response = await callable({ year });
  return normalizeCallableData<YearlyTransactionsResponse>(response.data);
};

