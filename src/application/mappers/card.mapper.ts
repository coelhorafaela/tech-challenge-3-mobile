import type { Card, CardType } from '../../domain/entities/card.entity';
import type { CardResponseDTO } from '../dto/card.dto';

export class CardMapper {
  static toDTO(card: Card): CardResponseDTO {
    return {
      id: card.id,
      cardNumber: card.cardNumber,
      cardType: card.cardType,
      cardholderName: card.cardholderName,
      expiryDate: card.expiryDate,
      cvv: card.cvv,
      limit: card.limit,
      availableLimit: card.availableLimit,
      invoiceAmount: card.invoiceAmount,
      accountNumber: card.accountNumber,
    };
  }

  static toDomain(dto: CardResponseDTO): Card {
    return {
      id: dto.id,
      cardNumber: dto.cardNumber,
      cardType: dto.cardType,
      cardholderName: dto.cardholderName,
      expiryDate: dto.expiryDate,
      cvv: dto.cvv,
      limit: dto.limit,
      availableLimit: dto.availableLimit,
      invoiceAmount: dto.invoiceAmount,
      accountNumber: dto.accountNumber,
    };
  }

  static fromFirebaseResponse(data: any): Card {
    const cardType = (data.cardType || data.type || 'DEBIT') as CardType;
    
    return {
      id: data.id || data.cardId || '',
      cardNumber: data.cardNumber || data.maskedNumber || data.lastFourDigits || '',
      cardType: cardType === 'CREDIT' || cardType === 'DEBIT' ? cardType : 'DEBIT',
      cardholderName: data.cardholderName || data.label || '',
      expiryDate: data.expiryDate || '',
      cvv: data.cvv || '',
      limit: data.creditLimit || data.limit,
      availableLimit: data.availableLimit,
      invoiceAmount: data.invoiceAmount,
      accountNumber: data.accountNumber || data.accountId || '',
    };
  }
}

