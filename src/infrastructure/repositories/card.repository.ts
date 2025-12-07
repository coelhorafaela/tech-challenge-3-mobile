import type { Card, CardType } from '../../domain/entities/card.entity';
import type { CardRepository as ICardRepository } from '../../domain/repositories/card.repository';
import { SQLiteDatabase } from '../services/config/sqlite';

const generateCardNumber = (type: CardType): string => {
  const prefixes: Record<CardType, string> = {
    CREDIT: '5555',
    DEBIT: '4444',
  };
  const prefix = prefixes[type] || '4444';
  const rest = Array.from({ length: 12 }, () => Math.floor(Math.random() * 10)).join('');
  return `${prefix}${rest}`;
};

const generateCVV = (): string => {
  return Array.from({ length: 3 }, () => Math.floor(Math.random() * 10)).join('');
};

const generateExpiryDate = (): string => {
  const now = new Date();
  const futureYear = now.getFullYear() + 3;
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${month}/${futureYear.toString().slice(-2)}`;
};

const getCardBrand = (type: CardType): string => {
  return type === 'CREDIT' ? 'Mastercard' : 'Visa';
};

export class CardRepository implements ICardRepository {
  async createCard(params: {
    cardType: CardType;
    cardholderName: string;
    accountNumber: string;
  }): Promise<Card> {
    const db = await SQLiteDatabase.getInstance();
    
    const cardId = `card_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const cardNumber = generateCardNumber(params.cardType);
    const cvv = generateCVV();
    const expiryDate = generateExpiryDate();
    const brand = getCardBrand(params.cardType);
    const createdAt = Date.now();

    await db.runAsync(
      'INSERT INTO cards (id, account_number, card_number, card_type, cardholder_name, cvv, expiry_date, brand, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [cardId, params.accountNumber, cardNumber, params.cardType, params.cardholderName, cvv, expiryDate, brand, 1, createdAt]
    );

    return {
      id: cardId,
      accountNumber: params.accountNumber,
      cardNumber,
      cardType: params.cardType,
      cardholderName: params.cardholderName,
      cvv,
      expiryDate,
    };
  }

  async listCards(accountNumber?: string): Promise<Card[]> {
    const db = await SQLiteDatabase.getInstance();
    
    let query = 'SELECT * FROM cards WHERE is_active = 1';
    const params: string[] = [];
    
    if (accountNumber) {
      query += ' AND account_number = ?';
      params.push(accountNumber);
    }
    
    query += ' ORDER BY created_at DESC';

    const cards = await db.getAllAsync<{
      id: string;
      account_number: string;
      card_number: string;
      card_type: string;
      cardholder_name: string;
      cvv: string;
      expiry_date: string;
      brand: string;
      is_active: number;
    }>(query, params);

    return cards.map(card => ({
      id: card.id,
      accountNumber: card.account_number,
      cardNumber: card.card_number,
      cardType: card.card_type as CardType,
      cardholderName: card.cardholder_name,
      cvv: card.cvv,
      expiryDate: card.expiry_date,
    }));
  }

  async getCardById(cardId: string): Promise<Card | null> {
    const db = await SQLiteDatabase.getInstance();
    
    const card = await db.getFirstAsync<{
      id: string;
      account_number: string;
      card_number: string;
      card_type: string;
      cardholder_name: string;
      cvv: string;
      expiry_date: string;
      brand: string;
      is_active: number;
    }>('SELECT * FROM cards WHERE id = ?', [cardId]);

    if (!card) {
      return null;
    }

    return {
      id: card.id,
      accountNumber: card.account_number,
      cardNumber: card.card_number,
      cardType: card.card_type as CardType,
      cardholderName: card.cardholder_name,
      cvv: card.cvv,
      expiryDate: card.expiry_date,
    };
  }

  async getCardTransactions(cardId: string): Promise<Card[]> {
    return [];
  }

  async deleteCard(cardId: string): Promise<void> {
    const db = await SQLiteDatabase.getInstance();

    await db.runAsync(
      'UPDATE cards SET is_active = 0 WHERE id = ?',
      [cardId]
    );
  }
}
