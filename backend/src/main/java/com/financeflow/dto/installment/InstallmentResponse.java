package com.financeflow.dto.installment;

import com.financeflow.entity.InstallmentGroup;
import com.financeflow.entity.Transaction;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class InstallmentResponse {

    private UUID id;
    private String description;
    private BigDecimal totalAmount;
    private Integer totalInstallments;
    private Integer currentInstallment;
    private BigDecimal installmentAmount;
    private BigDecimal interestRate;
    private LocalDate purchaseDate;
    private InstallmentGroup.InstallmentStatus status;
    private UUID accountId;
    private String accountName;
    private UUID categoryId;
    private String categoryName;
    private List<InstallmentChildResponse> installments;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class InstallmentChildResponse {
        private UUID transactionId;
        private Integer index;
        private BigDecimal amount;
        private LocalDate dueDate;
        private Transaction.TransactionStatus status;
        private Boolean paid;
    }
}
