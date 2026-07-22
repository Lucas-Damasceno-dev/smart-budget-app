package com.financeflow.dto.sharing;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExpenseSplitRequest {

    private UUID transactionId;

    @NotBlank(message = "Descrição é obrigatória")
    private String description;

    @NotNull(message = "Valor total é obrigatório")
    private BigDecimal totalAmount;

    @NotNull(message = "Valor da divisão é obrigatório")
    private BigDecimal splitAmount;

    @NotBlank(message = "E-mail do devedor é obrigatório")
    @Email(message = "E-mail inválido")
    private String debtorEmail;
}
