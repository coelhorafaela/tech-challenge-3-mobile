import type { Card, CardType } from '../../entities/card.entity';
import type { CardRepository } from '../../repositories/card.repository';

export class CreateCardUseCase {
  constructor(private readonly cardRepository: CardRepository) {}

  async execute(params: {
    cardType: CardType;
    cardholderName: string;
    accountNumber: string;
  }): Promise<Card> {
    if (!params.cardType || (params.cardType !== 'CREDIT' && params.cardType !== 'DEBIT')) {
      throw new Error('Tipo de cartão inválido');
    }

    if (!params.cardholderName || params.cardholderName.trim() === '') {
      throw new Error('Nome do portador é obrigatório');
    }

    if (!params.accountNumber || params.accountNumber.trim() === '') {
      throw new Error('Número da conta é obrigatório');
    }

    return await this.cardRepository.createCard(params);
  }
}

