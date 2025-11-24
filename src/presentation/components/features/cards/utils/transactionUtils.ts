import type { PaymentCardTransaction } from '@/src/infrastructure/services';
import type { TransactionItemProps } from '@/src/presentation';
import { Ionicons } from '@expo/vector-icons';

export const TRANSACTION_ICONS: Record<
  'income' | 'expense',
  keyof typeof Ionicons.glyphMap
> = {
  income: 'arrow-down',
  expense: 'arrow-up',
};

export const formatDate = (timestamp: string): string => {
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return '--';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
  })
    .format(date)
    .replace(' de ', ' ')
    .replace(/\./g, '')
    .trim();
};

export const formatTime = (timestamp: string): string => {
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return '--';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
};

export const getTransactionDirection = (
  transaction: PaymentCardTransaction
): 'income' | 'expense' => {
  if (transaction.direction === 'CREDIT') {
    return 'income';
  }

  if (transaction.direction === 'DEBIT') {
    return 'expense';
  }

  if (transaction.type === 'CARD') {
    return 'expense';
  }

  if (transaction.type === 'REFUND' || transaction.type === 'CREDIT') {
    return 'income';
  }

  if (transaction.type === 'ADJUSTMENT') {
    return transaction.amount < 0 ? 'income' : 'expense';
  }

  if (transaction.type === 'PAYMENT') {
    return 'expense';
  }

  return transaction.amount < 0 ? 'income' : 'expense';
};

export const normalizeTransaction = (
  transaction: PaymentCardTransaction
): TransactionItemProps => {
  const direction = getTransactionDirection(transaction);

  return {
    id: transaction.id,
    title:
      transaction.description?.trim() ||
      (direction === 'income' ? 'Crédito no cartão' : 'Compra no cartão'),
    amount: Math.abs(transaction.amount),
    date: formatDate(transaction.timestamp),
    time: formatTime(transaction.timestamp),
    type: direction,
    icon: TRANSACTION_ICONS[direction],
    category:
      transaction.type === 'CARD'
        ? 'card'
        : transaction.category?.trim() || direction,
  };
};

