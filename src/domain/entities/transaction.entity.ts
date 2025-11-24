export type TransactionType = 'DEPOSIT' | 'WITHDRAWAL';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  timestamp: Date;
  newBalance: number;
  category?: string | null;
  accountNumber?: string;
}

export class TransactionEntity {
  constructor(
    public readonly id: string,
    public readonly type: TransactionType,
    public readonly amount: number,
    public readonly timestamp: Date,
    public readonly newBalance: number,
    public readonly category?: string | null,
    public readonly accountNumber?: string
  ) {
    this.validate();
  }

  private validate(): void {
    if (this.amount <= 0) {
      throw new Error('O valor da transação deve ser maior que zero');
    }

    if (this.type === 'WITHDRAWAL' && this.amount > this.newBalance) {
      throw new Error('Saldo insuficiente para realizar a transação');
    }
  }

  isDeposit(): boolean {
    return this.type === 'DEPOSIT';
  }

  isWithdrawal(): boolean {
    return this.type === 'WITHDRAWAL';
  }
}

