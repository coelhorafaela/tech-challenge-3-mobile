import type { Account } from '../../domain/entities/account.entity';
import type { AccountResponseDTO } from '../dto/account.dto';

export class AccountMapper {
  static toDTO(account: Account): AccountResponseDTO {
    return {
      accountNumber: account.accountNumber,
      agency: account.agency,
      ownerName: account.ownerName,
      ownerEmail: account.ownerEmail,
      balance: account.balance,
    };
  }

  static toDomain(dto: AccountResponseDTO): Account {
    return {
      accountNumber: dto.accountNumber,
      agency: dto.agency,
      ownerName: dto.ownerName,
      ownerEmail: dto.ownerEmail,
      balance: dto.balance,
    };
  }

  static fromFirebaseResponse(data: any): Account {
    return {
      accountNumber: data.accountNumber || '',
      agency: data.agency || '0001',
      ownerName: data.ownerName || '',
      ownerEmail: data.ownerEmail || '',
      balance: data.balance || 0,
    };
  }
}

