package com.financeflow.dto.installment;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Set;
import java.util.UUID;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class InstallmentRequest {

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Total amount is required")
    @Positive(message = "Total amount must be positive")
    private BigDecimal totalAmount;

    @NotNull(message = "Total installments is required")
    @Min(value = 2, message = "Minimum of 2 installments")
    @Max(value = 60, message = "Maximum of 60 installments")
    private Integer totalInstallments;

    @Builder.Default
    private BigDecimal interestRate = BigDecimal.ZERO;

    @NotNull(message = "Purchase date is required")
    private LocalDate purchaseDate;

    @NotNull(message = "Account is required")
    private UUID accountId;

    @NotNull(message = "Category is required")
    private UUID categoryId;

    private Set<String> tags;
    private String notes;
}
