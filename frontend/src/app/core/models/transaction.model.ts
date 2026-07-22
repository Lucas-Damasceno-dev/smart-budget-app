export interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  type: TransactionType;
  status: TransactionStatus;
  notes?: string;
  receiptUrl?: string;
  isRecurring: boolean;
  recurrenceFrequency?: RecurrenceFrequency;
  installmentGroupId?: string;
  installmentIndex?: number;
  installmentTotal?: number;
  recurrenceEndDate?: string;
  account: AccountInfo;
  destinationAccount?: AccountInfo;
  category: CategoryInfo;
  tags: TagInfo[];
  splits: SplitInfo[];
  createdAt: string;
  updatedAt: string;
}

export type TransactionType = 'INCOME' | 'EXPENSE' | 'TRANSFER';
export type TransactionStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED';
export type RecurrenceFrequency =
  | 'DAILY'
  | 'WEEKLY'
  | 'BIWEEKLY'
  | 'MONTHLY'
  | 'QUARTERLY'
  | 'YEARLY';

export interface AccountInfo {
  id: string;
  name: string;
  type: string;
  color?: string;
}

export interface CategoryInfo {
  id: string;
  name: string;
  color?: string;
  icon?: string;
}

export interface TagInfo {
  id: string;
  name: string;
  color?: string;
}

export interface SplitInfo {
  id: string;
  amount: number;
  description?: string;
  category: CategoryInfo;
}

export interface TransactionRequest {
  description: string;
  amount: number;
  date: string;
  type: TransactionType;
  status?: TransactionStatus;
  notes?: string;
  accountId: string;
  destinationAccountId?: string;
  categoryId: string;
  tags?: string[];
  isRecurring?: boolean;
  recurrenceFrequency?: RecurrenceFrequency;
  recurrenceEndDate?: string;
  splits?: { amount: number; categoryId: string; description?: string }[];
}

export interface TransactionFilter {
  startDate?: string;
  endDate?: string;
  type?: TransactionType;
  status?: TransactionStatus;
  accountIds?: string[];
  categoryIds?: string[];
  minAmount?: number;
  maxAmount?: number;
  searchTerm?: string;
  isRecurring?: boolean;
}
