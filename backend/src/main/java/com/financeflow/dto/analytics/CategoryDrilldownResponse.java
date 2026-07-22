package com.financeflow.dto.analytics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryDrilldownResponse {

    private UUID categoryId;
    private String categoryName;
    private String categoryColor;
    private String categoryIcon;
    private BigDecimal totalAmount;
    private int transactionCount;
    private double percentageOfTotalExpenses;
    private List<SubcategorySummary> subcategories;
    private List<RecentCategoryTransaction> recentTransactions;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SubcategorySummary {
        private UUID categoryId;
        private String name;
        private BigDecimal totalAmount;
        private int transactionCount;
        private double percentageOfParent;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecentCategoryTransaction {
        private UUID id;
        private String description;
        private BigDecimal amount;
        private LocalDate date;
        private String accountName;
    }
}
