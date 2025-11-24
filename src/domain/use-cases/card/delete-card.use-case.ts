import type { CardRepository } from '../../repositories/card.repository';

export class DeleteCardUseCase {
  constructor(private readonly cardRepository: CardRepository) {}

  async execute(cardId: string): Promise<void> {
    if (!cardId || cardId.trim() === '') {
      throw new Error('ID do cartão é obrigatório');
    }

    await this.cardRepository.deleteCard(cardId);
  }
}

