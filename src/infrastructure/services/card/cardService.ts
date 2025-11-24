import { httpsCallable } from 'firebase/functions';
import { getFirebaseFunctions } from '../config/firebase';
import type {
    CreatePaymentCardPayload,
    CreatePaymentCardResponse,
    DeletePaymentCardPayload,
    DeletePaymentCardResponse,
    GetPaymentCardTransactionsPayload,
    GetPaymentCardTransactionsResponse,
    ListPaymentCardsResponse,
} from '../types/card';

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

export const listPaymentCards = async (): Promise<ListPaymentCardsResponse> => {
  const functions = getFirebaseFunctions();
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
  const functions = getFirebaseFunctions();
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
  const functions = getFirebaseFunctions();
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
  const functions = getFirebaseFunctions();
  const callable = httpsCallable<DeletePaymentCardPayload, DeletePaymentCardResponse>(
    functions,
    'deletePaymentCard'
  );

  const response = await callable(payload);
  return normalizeCallableData<DeletePaymentCardResponse>(response.data);
};

