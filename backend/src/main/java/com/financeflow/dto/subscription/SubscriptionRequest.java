package com.financeflow.dto.subscription;

import com.financeflow.entity.Subscription;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class SubscriptionRequest {

    @NotBlank(message = "Name is required")
    private String name;

    private String description;

    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be positive")
    private BigDecimal amount;

    @NotNull(message = "Billing cycle is required")
    private Subscription.BillingCycle billingCycle;

    private UUID categoryId;
    private UUID accountId;

    @NotNull(message = "Next billing date is required")
    private LocalDate nextBillingDate;

    private String color;
    private String icon;
    private String url;

    @Builder.Default
    private Boolean autoCreateTransaction = true;
}
