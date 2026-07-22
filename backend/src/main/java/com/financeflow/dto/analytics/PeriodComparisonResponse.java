package com.financeflow.dto.analytics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PeriodComparisonResponse {

    private PeriodMetrics currentPeriod;
    private PeriodMetrics previousPeriod;
    private PeriodMetrics samePeriodLastYear;
    private List<CategoryComparison> topCategoryChanges;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PeriodMetrics {
        private String label;
        private BigDecimal totalIncome;
        private BigDecimal totalExpenses;
        private BigDecimal netSavings;
        private double savingsRate;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoryComparison {
        private String categoryName;
        private String categoryColor;
        private BigDecimal currentAmount;
        private BigDecimal previousAmount;
        private BigDecimal changeAmount;
        private double changePercentage;
        private String status; // INCREASED, DECREASED, STABLE
    }
}
