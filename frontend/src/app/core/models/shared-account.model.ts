export interface AccountShare {
  id: string;
  accountId: string;
  accountName: string;
  ownerEmail: string;
  sharedWithEmail: string;
  permissionLevel: 'READ' | 'WRITE' | 'ADMIN';
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
}

export interface ShareAccountRequest {
  accountId: string;
  sharedWithEmail: string;
  permissionLevel?: 'READ' | 'WRITE' | 'ADMIN';
}

export interface ExpenseSplit {
  id: string;
  transactionId?: string;
  description: string;
  totalAmount: number;
  splitAmount: number;
  payerEmail: string;
  debtorEmail: string;
  status: 'PENDING' | 'SETTLED' | 'CANCELLED';
  settledAt?: string;
  createdAt: string;
}

export interface CreateExpenseSplitRequest {
  transactionId?: string;
  description: string;
  totalAmount: number;
  splitAmount: number;
  debtorEmail: string;
}
