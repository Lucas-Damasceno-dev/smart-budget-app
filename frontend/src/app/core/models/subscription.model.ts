export interface Subscription {
  id: string;
  name: string;
  description?: string;
  amount: number;
  billingCycle: 'MONTHLY' | 'QUARTERLY' | 'SEMI_ANNUAL' | 'YEARLY';
  categoryId?: string;
  categoryName?: string;
  accountId?: string;
  accountName?: string;
  nextBillingDate: string;
  status: 'ACTIVE' | 'CANCELLED' | 'PAUSED' | 'EXPIRED';
  color?: string;
  icon?: string;
  url?: string;
  autoCreateTransaction: boolean;
  monthlyEquivalent?: number;
  annualEquivalent?: number;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionRequest {
  name: string;
  description?: string;
  amount: number;
  billingCycle: 'MONTHLY' | 'QUARTERLY' | 'SEMI_ANNUAL' | 'YEARLY';
  categoryId?: string;
  accountId?: string;
  nextBillingDate: string;
  color?: string;
  icon?: string;
  url?: string;
  autoCreateTransaction?: boolean;
}

export interface SubscriptionSummary {
  activeSubscriptions: Subscription[];
  totalMonthlyCost: number;
  totalAnnualCost: number;
  activeCount: number;
}
