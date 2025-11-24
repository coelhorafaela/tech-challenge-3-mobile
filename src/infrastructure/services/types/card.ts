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

