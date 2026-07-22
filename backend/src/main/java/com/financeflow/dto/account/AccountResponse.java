package com.financeflow.dto.account;

import com.financeflow.entity.Account;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serial;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AccountResponse implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private UUID id;
    private String name;
    private Account.AccountType type;
    private BigDecimal initialBalance;
    private BigDecimal currentBalance;
    private String currency;
    private String color;
    private String icon;
    private String bankName;
    private String accountNumber;
    private boolean active;
    private BigDecimal creditLimit;
    private Integer closingDay;
    private Integer dueDay;
    private BigDecimal goalBalance;
    private Double goalProgress;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
