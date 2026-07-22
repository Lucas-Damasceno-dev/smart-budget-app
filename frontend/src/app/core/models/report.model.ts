export interface ReportSummary {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  transactionCount: number;
  averageTransactionAmount: number;
}

export interface CategoryBreakdown {
  categoryId: string;
  categoryName: string;
  type: string;
  amount: number;
  percentage: number;
  count: number;
  color?: string;
}

export interface MonthlyTrend {
  month: string;
  income: number;
  expenses: number;
  balance: number;
}

export interface DailyFlow {
  date: string;
  income: number;
  expenses: number;
  cumulativeBalance: number;
}

export interface ComparisonData {
  currentPeriodExpenses: number;
  previousPeriodExpenses: number;
  changePercentage: number;
}

export interface ParetoItem {
  categoryName: string;
  amount: number;
  cumulativePercentage: number;
}

export interface ParetoAnalysis {
  items: ParetoItem[];
  top20PercentTotal: number;
  top20PercentOfTotal: number;
}

export interface ReportResponse {
  startDate: string;
  endDate: string;
  summary: ReportSummary;
  categoryBreakdown: CategoryBreakdown[];
  monthlyTrends: MonthlyTrend[];
  dailyCashflow: DailyFlow[];
  comparison: ComparisonData;
  paretoAnalysis: ParetoAnalysis;
}
