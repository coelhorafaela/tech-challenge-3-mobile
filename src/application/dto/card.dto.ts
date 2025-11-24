export interface CreateCardDTO {
  cardType: 'CREDIT' | 'DEBIT';
  cardholderName: string;
  accountNumber: string;
}

export interface CardResponseDTO {
  id: string;
  cardNumber: string;
  cardType: 'CREDIT' | 'DEBIT';
  cardholderName: string;
  expiryDate: string;
  cvv: string;
  limit?: number;
  availableLimit?: number;
  invoiceAmount?: number;
  accountNumber: string;
}

