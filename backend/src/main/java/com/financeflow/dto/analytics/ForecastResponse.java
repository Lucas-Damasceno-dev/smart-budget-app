package com.financeflow.dto.analytics;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ForecastResponse {
    private BigDecimal currentBalance;
    private BigDecimal averageMonthlyIncome;
    private BigDecimal averageMonthlyExpenses;
    private BigDecimal projectedIncomeNextMonth;
    private BigDecimal projectedExpensesNextMonth;
    private BigDecimal projectedBalanceNextMonth;
    private BigDecimal safeToSpend;     // conservative estimate of discretionary spending
    private List<ProjectedDay> dailyProjection;
    private List<ProjectedMonth> monthlyProjection;

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ProjectedDay {
        private LocalDate date;
        private BigDecimal income;
        private BigDecimal expenses;
        private BigDecimal balance;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ProjectedMonth {
        private String month;     // "2026-07"
        private BigDecimal projectedIncome;
        private BigDecimal projectedExpenses;
        private BigDecimal projectedBalance;
    }
}
