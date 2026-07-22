package com.financeflow.dto.account;

import com.financeflow.entity.Account;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
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

    @Builder.Default
    private BigDecimal initialBalance = BigDecimal.ZERO;

    @Builder.Default
    private String currency = "BRL";

    private String color;

    private String icon;

    private String bankName;

    private String accountNumber;

    private BigDecimal creditLimit;

    @Min(value = 1, message = "Closing day must be between 1 and 31")
    @Max(value = 31, message = "Closing day must be between 1 and 31")
    private Integer closingDay;

    @Min(value = 1, message = "Due day must be between 1 and 31")
    @Max(value = 31, message = "Due day must be between 1 and 31")
    private Integer dueDay;

    private BigDecimal goalBalance;
}
