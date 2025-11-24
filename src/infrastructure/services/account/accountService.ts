import { httpsCallable, type HttpsCallableResult } from 'firebase/functions';
import { getFirebaseFunctions } from '../config/firebase';
import type {
    CreateBankAccountPayload,
    CreateBankAccountResponse,
    GetAccountDetailsPayload,
    GetAccountDetailsResponse,
} from '../types/account';

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

export const createBankAccount = async (
  payload: CreateBankAccountPayload
): Promise<HttpsCallableResult<CreateBankAccountResponse>> => {
  const functions = getFirebaseFunctions();
  const callable = httpsCallable<CreateBankAccountPayload, CreateBankAccountResponse>(
    functions,
    'createBankAccount',
  );
  return callable(payload);
};

export const getAccountDetails = async (
  payload?: GetAccountDetailsPayload
): Promise<GetAccountDetailsResponse> => {
  const functions = getFirebaseFunctions();
  const callable = httpsCallable<GetAccountDetailsPayload, GetAccountDetailsResponse>(
    functions,
    'getAccountDetails'
  );

  const response = await callable(payload ?? {});
  return normalizeCallableData<GetAccountDetailsResponse>(response.data);
};

