package com.financeflow.dto.subscription;

import com.financeflow.entity.Subscription;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class SubscriptionResponse {

    private UUID id;
    private String name;
    private String description;
    private BigDecimal amount;
    private Subscription.BillingCycle billingCycle;
    private UUID categoryId;
    private String categoryName;
    private UUID accountId;
    private String accountName;
    private LocalDate nextBillingDate;
    private Subscription.SubscriptionStatus status;
    private String color;
    private String icon;
    private String url;
    private Boolean autoCreateTransaction;
    private BigDecimal monthlyEquivalent;
    private BigDecimal annualEquivalent;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
