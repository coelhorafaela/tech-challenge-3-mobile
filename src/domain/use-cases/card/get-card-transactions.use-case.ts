import type { Card } from '../../entities/card.entity';
import type { CardRepository } from '../../repositories/card.repository';

export class GetCardTransactionsUseCase {
  constructor(private readonly cardRepository: CardRepository) {}

  async execute(cardId: string): Promise<Card[]> {
    if (!cardId || cardId.trim() === '') {
      throw new Error('ID do cartão é obrigatório');
    }

    return await this.cardRepository.getCardTransactions(cardId);
  }
}

