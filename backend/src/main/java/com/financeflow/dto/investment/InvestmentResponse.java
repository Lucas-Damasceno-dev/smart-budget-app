package com.financeflow.dto.investment;

import com.financeflow.entity.Investment;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvestmentResponse {

    private UUID id;
    private String name;
    private Investment.InvestmentType type;
    private String ticker;
    private BigDecimal quantity;
    private BigDecimal averagePrice;
    private BigDecimal currentPrice;
    private BigDecimal totalInvested;
    private BigDecimal currentValue;
    private BigDecimal profitLoss;
    private BigDecimal profitLossPercentage;
    private BigDecimal dividendsReceived;
    private LocalDate purchaseDate;
    private AccountInfo account;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AccountInfo {
        private UUID id;
        private String name;
    }
}
