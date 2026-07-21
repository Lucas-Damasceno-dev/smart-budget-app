package com.financeflow.dto.transaction;

import com.financeflow.entity.Category;
import com.financeflow.entity.Transaction;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionResponse {

    private UUID id;
    private String description;
    private BigDecimal amount;
    private LocalDate date;
    private Category.TransactionType type;
    private Transaction.TransactionStatus status;
    private String notes;
    private String receiptUrl;
    private boolean isRecurring;
    private Transaction.RecurrenceFrequency recurrenceFrequency;
    private LocalDate recurrenceEndDate;
    private AccountInfo account;
    private AccountInfo destinationAccount;
    private CategoryInfo category;
    private Set<TagInfo> tags;
    private List<SplitInfo> splits;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AccountInfo {
        private UUID id;
        private String name;
        private String type;
        private String color;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoryInfo {
        private UUID id;
        private String name;
        private String color;
        private String icon;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TagInfo {
        private UUID id;
        private String name;
        private String color;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SplitInfo {
        private UUID id;
        private BigDecimal amount;
        private String description;
        private CategoryInfo category;
    }
}
