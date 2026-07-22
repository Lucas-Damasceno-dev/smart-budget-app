export type GoalStatus = 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  remainingAmount: number;
  progressPercentage: number;
  targetDate: string;
  color?: string;
  icon?: string;
  status: GoalStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface GoalRequest {
  name: string;
  targetAmount: number;
  currentAmount?: number;
  targetDate: string;
  color?: string;
  icon?: string;
  status?: GoalStatus;
}

export interface GoalDepositRequest {
  amount: number;
}
