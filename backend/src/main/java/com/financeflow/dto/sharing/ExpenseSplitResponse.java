package com.financeflow.dto.sharing;

import com.financeflow.entity.ExpenseSplit;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExpenseSplitResponse {
    private UUID id;
    private UUID transactionId;
    private String description;
    private BigDecimal totalAmount;
    private BigDecimal splitAmount;
    private String payerEmail;
    private String debtorEmail;
    private ExpenseSplit.SplitStatus status;
    private LocalDateTime settledAt;
    private LocalDateTime createdAt;
}
