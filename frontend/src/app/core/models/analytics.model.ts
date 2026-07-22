export interface Insight {
  id: string;
  type: 'SPENDING_TREND' | 'BUDGET_ALERT' | 'SUBSCRIPTION_RENEWAL' | 'UNUSUAL_SPENDING' | 'INCOME_EXPENSE_RATIO';
  severity: 'INFO' | 'WARNING' | 'DANGER' | 'SUCCESS';
  title: string;
  message: string;
  actionLabel?: string;
  actionRoute?: string;
  createdAt: string;
}

export interface ForecastDay {
  date: string;
  income: number;
  expenses: number;
  balance: number;
}

export interface ForecastMonth {
  month: string;
  projectedIncome: number;
  projectedExpenses: number;
  projectedBalance: number;
}

export interface Forecast {
  currentBalance: number;
  averageMonthlyIncome: number;
  averageMonthlyExpenses: number;
  projectedIncomeNextMonth: number;
  projectedExpensesNextMonth: number;
  projectedBalanceNextMonth: number;
  safeToSpend: number;
  dailyProjection: ForecastDay[];
  monthlyProjection: ForecastMonth[];
}

export interface PeriodMetrics {
  label: string;
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  savingsRate: number;
}

export interface CategoryComparison {
  categoryName: string;
  categoryColor: string;
  currentAmount: number;
  previousAmount: number;
  changeAmount: number;
  changePercentage: number;
  status: 'INCREASED' | 'DECREASED' | 'STABLE';
}

export interface PeriodComparison {
  currentPeriod: PeriodMetrics;
  previousPeriod: PeriodMetrics;
  samePeriodLastYear: PeriodMetrics;
  topCategoryChanges: CategoryComparison[];
}

export interface SubcategorySummary {
  categoryId: string;
  name: string;
  totalAmount: number;
  transactionCount: number;
  percentageOfParent: number;
}

export interface RecentCategoryTransaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  accountName: string;
}

export interface CategoryDrilldown {
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  categoryIcon: string;
  totalAmount: number;
  transactionCount: number;
  percentageOfTotalExpenses: number;
  subcategories: SubcategorySummary[];
  recentTransactions: RecentCategoryTransaction[];
}