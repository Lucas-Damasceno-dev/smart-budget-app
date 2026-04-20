export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface Goal {
  id: string;
  categoryId: string;
  amount: number;
  month: string;
  spent: number;
}

export interface Balance {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
}