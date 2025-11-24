import type { Transaction } from '../../domain/entities/transaction.entity';
import type { CreateTransactionDTO } from '../dto/transaction.dto';

export class TransactionMapper {
  static toDTO(transaction: Transaction): CreateTransactionDTO {
    return {
      amount: transaction.amount,
      type: transaction.type,
      timestamp: transaction.timestamp instanceof Date ? transaction.timestamp : new Date(transaction.timestamp),
      accountNumber: transaction.accountNumber,
    };
  }

  static toDomain(dto: CreateTransactionDTO & { id: string; newBalance: number; category?: string | null }): Transaction {
    return {
      id: dto.id,
      type: dto.type,
      amount: dto.amount,
      timestamp: dto.timestamp || new Date(),
      newBalance: dto.newBalance,
      category: dto.category,
      accountNumber: dto.accountNumber,
    };
  }

  static fromFirebaseResponse(data: any): Transaction {
    let timestamp: Date;
    if (data.timestamp) {
      if (typeof data.timestamp === 'string') {
        timestamp = new Date(data.timestamp);
      } else if (typeof data.timestamp === 'number') {
        timestamp = new Date(data.timestamp);
      } else {
        timestamp = new Date();
      }
    } else {
      timestamp = new Date();
    }

    return {
      id: data.id || data.transactionId || '',
      type: data.type,
      amount: data.amount || 0,
      timestamp,
      newBalance: data.newBalance || 0,
      category: data.category || null,
      accountNumber: data.accountNumber,
    };
  }
}

