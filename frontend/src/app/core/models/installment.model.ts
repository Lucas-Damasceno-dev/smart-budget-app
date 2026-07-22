export interface InstallmentGroup {
  id: string;
  description: string;
  totalAmount: number;
  totalInstallments: number;
  currentInstallment: number;
  installmentAmount: number;
  interestRate: number;
  purchaseDate: string;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  accountId: string;
  accountName: string;
  categoryId: string;
  categoryName: string;
  installments: InstallmentChild[];
  createdAt: string;
  updatedAt: string;
}

export interface InstallmentChild {
  transactionId: string;
  index: number;
  amount: number;
  dueDate: string;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  paid: boolean;
}

export interface InstallmentRequest {
  description: string;
  totalAmount: number;
  totalInstallments: number;
  interestRate?: number;
  purchaseDate: string;
  accountId: string;
  categoryId: string;
  tags?: string[];
  notes?: string;
}

export interface InstallmentEditRequest {
  editAllRemaining?: boolean;
  transactionId?: string;
  description?: string;
  categoryId?: string;
  notes?: string;
  accountId?: string;
  amount?: number;
}
