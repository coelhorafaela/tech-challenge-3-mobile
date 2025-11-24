import type { Card } from '../../entities/card.entity';
import type { CardRepository } from '../../repositories/card.repository';

export class ListCardsUseCase {
  constructor(private readonly cardRepository: CardRepository) {}

  async execute(accountNumber?: string): Promise<Card[]> {
    return await this.cardRepository.listCards(accountNumber);
  }
}

