export interface CreateAccountDTO {
  uid: string;
  ownerEmail: string;
  ownerName: string;
}

export interface AccountResponseDTO {
  accountNumber: string;
  agency: string;
  ownerName: string;
  ownerEmail: string;
  balance: number;
}

