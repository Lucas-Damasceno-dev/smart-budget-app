export interface Account {
  id: string;
  name: string;
  type: AccountType;
  initialBalance: number;
  currentBalance: number;
  currency: string;
  color?: string;
  icon?: string;
  bankName?: string;
  accountNumber?: string;
  active: boolean;
  goalBalance?: number;
  goalProgress?: number;
  createdAt: string;
  updatedAt: string;
}

export type AccountType =
  | 'CHECKING'
  | 'SAVINGS'
  | 'INVESTMENT'
  | 'CREDIT_CARD'
  | 'CASH'
  | 'DIGITAL_WALLET';

export interface AccountRequest {
  name: string;
  type: AccountType;
  initialBalance?: number;
  currency?: string;
  color?: string;
  icon?: string;
  bankName?: string;
  accountNumber?: string;
  goalBalance?: number;
}
