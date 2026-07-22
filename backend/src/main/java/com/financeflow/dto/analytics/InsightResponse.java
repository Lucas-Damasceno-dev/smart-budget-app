package com.financeflow.dto.analytics;

import lombok.*;

import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class InsightResponse {
    private String id;
    private String type;          // SPENDING_TREND, BUDGET_ALERT, SUBSCRIPTION_RENEWAL, UNUSUAL_SPENDING, INCOME_EXPENSE_RATIO
    private String severity;      // INFO, WARNING, DANGER, SUCCESS
    private String title;
    private String message;
    private String actionLabel;   // nullable — e.g. "Ver transações"
    private String actionRoute;   // nullable — e.g. "/transactions?category=X&month=2026-07"
    private LocalDateTime createdAt;
}
