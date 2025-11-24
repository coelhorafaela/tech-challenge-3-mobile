import { httpsCallable } from 'firebase/functions';
import { CardMapper } from '../../application/mappers/card.mapper';
import type { Card, CardType } from '../../domain/entities/card.entity';
import type { CardRepository as ICardRepository } from '../../domain/repositories/card.repository';
import { getFirebaseFunctions } from '../services/config/firebase';

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

export class CardRepository implements ICardRepository {
  async createCard(params: {
    cardType: CardType;
    cardholderName: string;
    accountNumber: string;
  }): Promise<Card> {
    const functions = getFirebaseFunctions();
    const callable = httpsCallable<
      { type: string; label?: string; brand?: string },
      { success: boolean; card: any; message?: string }
    >(functions, 'createPaymentCard');

    const response = await callable({
      type: params.cardType,
    });

    const data = normalizeCallableData<{
      success: boolean;
      card: any;
      message?: string;
    }>(response.data);

    if (!data.success || !data.card) {
      throw new Error(data.message ?? 'Não foi possível criar o cartão.');
    }

    return CardMapper.fromFirebaseResponse({
      ...data.card,
      cardType: params.cardType,
      cardholderName: params.cardholderName,
      accountNumber: params.accountNumber,
    });
  }

  async listCards(accountNumber?: string): Promise<Card[]> {
    const functions = getFirebaseFunctions();
    const callable = httpsCallable<
      Record<string, never>,
      { success: boolean; cards: any[] }
    >(functions, 'listPaymentCards');

    const response = await callable({} as Record<string, never>);
    const data = normalizeCallableData<{ success: boolean; cards: any[] }>(response.data);

    if (!data.success) {
      throw new Error('Não foi possível carregar os cartões.');
    }

    return (data.cards || []).map((card) => CardMapper.fromFirebaseResponse({
      ...card,
      accountNumber: accountNumber || card.accountNumber || '',
    }));
  }

  async getCardById(cardId: string): Promise<Card | null> {
    const cards = await this.listCards();
    return cards.find((card) => card.id === cardId) || null;
  }

  async getCardTransactions(cardId: string): Promise<Card[]> {
    const functions = getFirebaseFunctions();
    const callable = httpsCallable<
      { cardId: string; limit?: number },
      { success: boolean; transactions: any[] }
    >(functions, 'getPaymentCardTransactions');

    const response = await callable({ cardId });
    const data = normalizeCallableData<{ success: boolean; transactions: any[] }>(response.data);

    if (!data.success) {
      throw new Error('Não foi possível carregar as transações do cartão.');
    }

    return [];
  }

  async deleteCard(cardId: string): Promise<void> {
    const functions = getFirebaseFunctions();
    const callable = httpsCallable<
      { cardId: string },
      { success: boolean }
    >(functions, 'deletePaymentCard');

    const response = await callable({ cardId });
    const data = normalizeCallableData<{ success: boolean }>(response.data);

    if (!data.success) {
      throw new Error('Não foi possível excluir o cartão.');
    }
  }
}

