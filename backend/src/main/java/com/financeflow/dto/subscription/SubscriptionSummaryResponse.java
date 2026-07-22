package com.financeflow.dto.subscription;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class SubscriptionSummaryResponse {

    private List<SubscriptionResponse> activeSubscriptions;
    private BigDecimal totalMonthlyCost;
    private BigDecimal totalAnnualCost;
    private Integer activeCount;
}
