package com.financeflow.dto.investment;

import com.financeflow.entity.Investment;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvestmentRequest {

    @NotBlank(message = "Name is required")
    private String name;

    @NotNull(message = "Investment type is required")
    private Investment.InvestmentType type;

    private String ticker;

    @NotNull(message = "Quantity is required")
    @Positive(message = "Quantity must be positive")
    private BigDecimal quantity;

    @NotNull(message = "Average price is required")
    @Positive(message = "Average price must be positive")
    private BigDecimal averagePrice;

    private BigDecimal currentPrice;

    private BigDecimal dividendsReceived;

    private LocalDate purchaseDate;

    @NotNull(message = "Account is required")
    private UUID accountId;
}
