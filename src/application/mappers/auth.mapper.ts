import type { User } from '../../domain/entities/user.entity';
import type { UserResponseDTO } from '../dto/auth.dto';

export class AuthMapper {
  static toDTO(user: User): UserResponseDTO {
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      emailVerified: user.emailVerified,
    };
  }

  static toDomain(dto: UserResponseDTO): User {
    return {
      uid: dto.uid,
      email: dto.email,
      displayName: dto.displayName,
      emailVerified: dto.emailVerified,
    };
  }

  static fromFirebaseUser(firebaseUser: any): User {
    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email || '',
      displayName: firebaseUser.displayName || undefined,
      emailVerified: firebaseUser.emailVerified || false,
    };
  }
}

