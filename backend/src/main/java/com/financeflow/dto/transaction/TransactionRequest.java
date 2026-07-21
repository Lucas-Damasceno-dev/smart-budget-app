package com.financeflow.dto.transaction;

import com.financeflow.entity.Category;
import com.financeflow.entity.Transaction;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionRequest {

    private String description;

    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be positive")
    private BigDecimal amount;

    @NotNull(message = "Date is required")
    private LocalDate date;

    @NotNull(message = "Transaction type is required")
    private Category.TransactionType type;

    private Transaction.TransactionStatus status = Transaction.TransactionStatus.COMPLETED;

    private String notes;

    @NotNull(message = "Account is required")
    private UUID accountId;

    private UUID destinationAccountId;

    @NotNull(message = "Category is required")
    private UUID categoryId;

    private Set<String> tags;

    private boolean isRecurring = false;

    private Transaction.RecurrenceFrequency recurrenceFrequency;

    private LocalDate recurrenceEndDate;

    private List<SplitRequest> splits;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SplitRequest {
        private BigDecimal amount;
        private UUID categoryId;
        private String description;
    }
}
