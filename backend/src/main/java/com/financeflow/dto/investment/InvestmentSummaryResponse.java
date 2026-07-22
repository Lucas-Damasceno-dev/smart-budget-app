package com.financeflow.dto.investment;

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
public class InvestmentSummaryResponse {

    private BigDecimal totalInvested;
    private BigDecimal currentValue;
    private BigDecimal totalProfitLoss;
    private BigDecimal totalProfitLossPercentage;
    private BigDecimal totalDividends;
    private List<AllocationItem> distribution;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AllocationItem {
        private String type;
        private BigDecimal amount;
        private double percentage;
    }
}
