import type { PaymentCard, PaymentCardType } from '@/src/infrastructure/services';
import { formatCurrencyFromNumber } from '@/src/presentation/utils/currency';

export type DisplayCard = {
  id: string;
  typeLabel: string;
  brandLabel: string;
  helperLabel: string;
  maskedNumber: string;
  invoiceAmountLabel: string;
  invoiceDueDateLabel: string;
  availableLimitLabel: string;
};

export const CARD_TYPE_LABELS: Partial<Record<PaymentCardType, string>> = {
  CREDIT: 'Cartão de crédito',
  DEBIT: 'Cartão de débito',
  VIRTUAL: 'Cartão virtual',
  PHYSICAL: 'Cartão físico',
};

export const mapCardTypeToLabel = (type: PaymentCardType): string => {
  return CARD_TYPE_LABELS[type] ?? 'Cartão';
};

export const ensureMaskedNumber = (card: PaymentCard): string => {
  if (card.maskedNumber && card.maskedNumber.trim().length > 0) {
    return card.maskedNumber;
  }

  if (card.lastFourDigits && card.lastFourDigits.trim().length > 0) {
    return `**** **** **** ${card.lastFourDigits}`;
  }

  return '**** **** **** ****';
};

export const formatInvoiceDueDate = (value?: string | null): string => {
  if (!value) {
    return '—';
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return '—';
  }

  const numericDay = Number.parseInt(trimmed, 10);
  if (!Number.isNaN(numericDay) && numericDay >= 1 && numericDay <= 31) {
    return `Dia ${numericDay}`;
  }

  const parsedDate = new Date(trimmed);
  if (!Number.isNaN(parsedDate.getTime())) {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short',
    })
      .format(parsedDate)
      .replace(' de ', ' ')
      .replace(/\./g, '')
      .trim();
  }

  return trimmed;
};

export const formatCurrencyValue = (value?: number | null): string => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return '—';
  }

  return formatCurrencyFromNumber(value);
};

export const mapCardToDisplay = (card: PaymentCard): DisplayCard => {
  return {
    id: card.id,
    typeLabel: mapCardTypeToLabel(card.cardType),
    brandLabel: card.brand?.trim() || 'ByteBank',
    helperLabel: card.label?.trim() || mapCardTypeToLabel(card.cardType),
    maskedNumber: ensureMaskedNumber(card),
    invoiceAmountLabel: formatCurrencyValue(card.invoiceAmount),
    invoiceDueDateLabel: formatInvoiceDueDate(card.invoiceDueDate),
    availableLimitLabel:
      formatCurrencyValue(card.availableLimit) !== '—'
        ? formatCurrencyValue(card.availableLimit)
        : formatCurrencyValue(card.creditLimit),
  };
};

