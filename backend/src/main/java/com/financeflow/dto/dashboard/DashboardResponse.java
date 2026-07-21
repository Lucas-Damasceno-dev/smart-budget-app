package com.financeflow.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serial;
import java.io.Serializable;
import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardResponse implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private BigDecimal totalBalance;
    private BigDecimal monthlyIncome;
    private BigDecimal monthlyExpenses;
    private BigDecimal monthlyBalance;
    private BigDecimal netWorth;
    private BigDecimal projectedCashflow;
    private List<AccountSummary> accounts;
    private List<CategorySummary> topExpenseCategories;
    private List<CategorySummary> topIncomeCategories;
    private List<DailyBalance> balanceHistory;
    private List<BudgetProgress> budgetProgress;
    private RecentActivity recentActivity;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AccountSummary implements Serializable {
        @Serial
        private static final long serialVersionUID = 1L;
        private String id;
        private String name;
        private String type;
        private BigDecimal balance;
        private String color;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategorySummary implements Serializable {
        @Serial
        private static final long serialVersionUID = 1L;
        private String id;
        private String name;
        private BigDecimal amount;
        private String color;
        private Double percentage;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DailyBalance implements Serializable {
        @Serial
        private static final long serialVersionUID = 1L;
        private String date;
        private BigDecimal balance;
        private BigDecimal income;
        private BigDecimal expense;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BudgetProgress implements Serializable {
        @Serial
        private static final long serialVersionUID = 1L;
        private String categoryId;
        private String categoryName;
        private BigDecimal limit;
        private BigDecimal spent;
        private Double percentage;
        private String color;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecentActivity implements Serializable {
        @Serial
        private static final long serialVersionUID = 1L;
        private int transactionsThisMonth;
        private int transactionsLastMonth;
        private Double changePercentage;
    }
}
