export interface Account {
  accountNumber: string;
  agency: string;
  ownerName: string;
  ownerEmail: string;
  balance: number;
}

export class AccountEntity {
  constructor(
    public readonly accountNumber: string,
    public readonly agency: string,
    public readonly ownerName: string,
    public readonly ownerEmail: string,
    public readonly balance: number
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this.accountNumber || this.accountNumber.trim() === '') {
      throw new Error('Número da conta é obrigatório');
    }

    if (!this.agency || this.agency.trim() === '') {
      throw new Error('Agência é obrigatória');
    }

    if (this.balance < 0) {
      throw new Error('Saldo não pode ser negativo');
    }
  }

  hasSufficientBalance(amount: number): boolean {
    return this.balance >= amount;
  }
}

