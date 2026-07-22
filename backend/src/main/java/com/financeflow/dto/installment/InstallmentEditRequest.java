package com.financeflow.dto.installment;

import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class InstallmentEditRequest {

    @Builder.Default
    private boolean editAllRemaining = true;

    private UUID transactionId;

    private String description;
    private UUID categoryId;
    private String notes;
    private UUID accountId;
    private BigDecimal amount;
}
