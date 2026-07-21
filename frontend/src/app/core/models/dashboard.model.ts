export interface Dashboard {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlyBalance: number;
  netWorth: number;
  projectedCashflow: number;
  accounts: AccountSummary[];
  topExpenseCategories: CategorySummary[];
  topIncomeCategories: CategorySummary[];
  balanceHistory: DailyBalance[];
  budgetProgress: BudgetProgress[];
  recentActivity: RecentActivity;
}

export interface AccountSummary {
  id: string;
  name: string;
  type: string;
  balance: number;
  color?: string;
}

export interface CategorySummary {
  id: string;
  name: string;
  amount: number;
  color?: string;
  percentage: number;
}

export interface DailyBalance {
  date: string;
  balance: number;
  income: number;
  expense: number;
}

export interface BudgetProgress {
  categoryId: string;
  categoryName: string;
  limit: number;
  spent: number;
  percentage: number;
  color?: string;
}

export interface RecentActivity {
  transactionsThisMonth: number;
  transactionsLastMonth: number;
  changePercentage: number;
}
