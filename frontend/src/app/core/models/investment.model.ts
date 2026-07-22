export type InvestmentType =
  | 'STOCK'
  | 'FII'
  | 'TREASURY_BOND'
  | 'CRYPTO'
  | 'FIXED_INCOME'
  | 'FUND'
  | 'ETF';

export interface InvestmentAccountInfo {
  id: string;
  name: string;
}

export interface Investment {
  id: string;
  name: string;
  type: InvestmentType;
  ticker?: string;
  quantity: number;
  averagePrice: number;
  currentPrice?: number;
  totalInvested: number;
  currentValue: number;
  profitLoss: number;
  profitLossPercentage: number;
  dividendsReceived: number;
  purchaseDate?: string;
  account: InvestmentAccountInfo;
  createdAt?: string;
  updatedAt?: string;
}

export interface InvestmentRequest {
  name: string;
  type: InvestmentType;
  ticker?: string;
  quantity: number;
  averagePrice: number;
  currentPrice?: number;
  dividendsReceived?: number;
  purchaseDate?: string;
  accountId: string;
}

export interface AllocationItem {
  type: string;
  amount: number;
  percentage: number;
}

export interface InvestmentSummary {
  totalInvested: number;
  currentValue: number;
  totalProfitLoss: number;
  totalProfitLossPercentage: number;
  totalDividends: number;
  distribution: AllocationItem[];
}
