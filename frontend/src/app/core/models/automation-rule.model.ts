export interface AutomationRule {
  id: string;
  name: string;
  description?: string;
  conditionField: string;
  conditionOperator: string;
  conditionValue: string;
  setCategoryId?: string;
  setCategoryName?: string;
  setAccountId?: string;
  setAccountName?: string;
  setDescription?: string;
  setTags?: string;
  setAsTransfer: boolean;
  priority: number;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AutomationRuleRequest {
  name: string;
  description?: string;
  conditionField: string;
  conditionOperator: string;
  conditionValue: string;
  setCategoryId?: string;
  setAccountId?: string;
  setDescription?: string;
  setTags?: string;
  setAsTransfer?: boolean;
  priority?: number;
  enabled?: boolean;
}