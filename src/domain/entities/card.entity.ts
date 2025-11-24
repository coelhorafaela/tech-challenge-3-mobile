export type CardType = 'CREDIT' | 'DEBIT';

export interface Card {
  id: string;
  cardNumber: string;
  cardType: CardType;
  cardholderName: string;
  expiryDate: string;
  cvv: string;
  limit?: number;
  availableLimit?: number;
  invoiceAmount?: number;
  accountNumber: string;
}

export class CardEntity {
  constructor(
    public readonly id: string,
    public readonly cardNumber: string,
    public readonly cardType: CardType,
    public readonly cardholderName: string,
    public readonly expiryDate: string,
    public readonly cvv: string,
    public readonly accountNumber: string,
    public readonly limit?: number,
    public readonly availableLimit?: number,
    public readonly invoiceAmount?: number
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this.cardNumber || this.cardNumber.trim() === '') {
      throw new Error('Número do cartão é obrigatório');
    }

    if (!this.cardholderName || this.cardholderName.trim() === '') {
      throw new Error('Nome do portador é obrigatório');
    }

    if (this.cardType === 'CREDIT' && this.limit !== undefined && this.limit < 0) {
      throw new Error('Limite do cartão não pode ser negativo');
    }
  }

  isCreditCard(): boolean {
    return this.cardType === 'CREDIT';
  }

  isDebitCard(): boolean {
    return this.cardType === 'DEBIT';
  }

  hasAvailableLimit(amount: number): boolean {
    if (this.cardType !== 'CREDIT') {
      return true;
    }
    return (this.availableLimit ?? 0) >= amount;
  }
}

