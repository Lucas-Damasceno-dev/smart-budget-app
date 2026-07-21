package com.financeflow.dto.account;

import com.financeflow.entity.Account;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AccountRequest {

    @NotBlank(message = "Account name is required")
    private String name;

    @NotNull(message = "Account type is required")
    private Account.AccountType type;

    private BigDecimal initialBalance = BigDecimal.ZERO;

    private String currency = "BRL";

    private String color;

    private String icon;

    private String bankName;

    private String accountNumber;

    private BigDecimal goalBalance;
}
