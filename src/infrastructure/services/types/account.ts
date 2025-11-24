export type CreateBankAccountPayload = {
  uid: string;
  ownerEmail?: string | null;
  ownerName?: string | null;
};

export type CreateBankAccountResponse = {
  success?: boolean;
  message?: string;
  docId?: string;
  accountNumber?: string;
  agency?: string;
  ownerName?: string;
  balance?: number;
};

export type GetAccountDetailsPayload = {
  accountNumber?: string;
};

export type GetAccountDetailsResponse = {
  success: boolean;
  accountNumber: string;
  agency: string;
  ownerName: string;
  balance: number;
};

