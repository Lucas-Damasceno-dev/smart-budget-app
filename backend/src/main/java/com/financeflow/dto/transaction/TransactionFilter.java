package com.financeflow.dto.transaction;

import com.financeflow.entity.Category;
import com.financeflow.entity.Transaction;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Set;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionFilter {

    private LocalDate startDate;
    private LocalDate endDate;
    private Category.TransactionType type;
    private Transaction.TransactionStatus status;
    private Set<UUID> accountIds;
    private Set<UUID> categoryIds;
    private Set<UUID> tagIds;
    private BigDecimal minAmount;
    private BigDecimal maxAmount;
    private String searchTerm;
    private Boolean isRecurring;
}
