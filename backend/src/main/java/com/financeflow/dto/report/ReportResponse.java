package com.financeflow.dto.report;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportResponse {

    private LocalDate startDate;
    private LocalDate endDate;
    private Summary summary;
    private List<CategoryBreakdown> categoryBreakdown;
    private List<MonthlyTrend> monthlyTrends;
    private List<DailyFlow> dailyCashflow;
    private ComparisonData comparison;
    private ParetoAnalysis paretoAnalysis;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Summary {
        private BigDecimal totalIncome;
        private BigDecimal totalExpenses;
        private BigDecimal netBalance;
        private int transactionCount;
        private BigDecimal averageTransactionAmount;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoryBreakdown {
        private String categoryId;
        private String categoryName;
        private String type;
        private BigDecimal amount;
        private Double percentage;
        private int count;
        private String color;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthlyTrend {
        private String month;
        private BigDecimal income;
        private BigDecimal expenses;
        private BigDecimal balance;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DailyFlow {
        private String date;
        private BigDecimal income;
        private BigDecimal expenses;
        private BigDecimal cumulativeBalance;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ComparisonData {
        private BigDecimal currentPeriodExpenses;
        private BigDecimal previousPeriodExpenses;
        private Double changePercentage;
        private Map<String, CategoryComparison> categoryComparison;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoryComparison {
        private BigDecimal currentAmount;
        private BigDecimal previousAmount;
        private Double changePercentage;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ParetoAnalysis {
        private List<ParetoItem> items;
        private BigDecimal top20PercentTotal;
        private Double top20PercentOfTotal;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ParetoItem {
        private String categoryName;
        private BigDecimal amount;
        private Double cumulativePercentage;
    }
}
