export interface Category {
  id: string;
  name: string;
  description?: string;
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER';
  color?: string;
  icon?: string;
  active: boolean;
  isDefault: boolean;
  monthlyBudget?: number;
  parentId?: string;
  parentName?: string;
  subcategories?: Category[];
  createdAt: string;
  updatedAt: string;
}

export interface CategoryRequest {
  name: string;
  description?: string;
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER';
  color?: string;
  icon?: string;
  parentId?: string;
  monthlyBudget?: number;
}
