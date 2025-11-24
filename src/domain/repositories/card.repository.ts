import type { Card, CardType } from '../entities/card.entity';

export interface CardRepository {
  createCard(params: {
    cardType: CardType;
    cardholderName: string;
    accountNumber: string;
  }): Promise<Card>;

  listCards(accountNumber?: string): Promise<Card[]>;

  getCardById(cardId: string): Promise<Card | null>;

  getCardTransactions(cardId: string): Promise<Card[]>;

  deleteCard(cardId: string): Promise<void>;
}

