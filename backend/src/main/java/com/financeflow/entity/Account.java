package com.financeflow.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@Entity
@Table(name = "accounts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Account {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Version
    private Long version;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AccountType type;

    @Column(nullable = false, precision = 19, scale = 4)
    @Builder.Default
    private BigDecimal initialBalance = BigDecimal.ZERO;

    @Column(nullable = false, precision = 19, scale = 4)
    @Builder.Default
    private BigDecimal currentBalance = BigDecimal.ZERO;

    @Builder.Default
    private String currency = "BRL";

    private String color;

    private String icon;

    private String bankName;

    private String accountNumber;

    @Builder.Default
    private boolean active = true;

    @Column(name = "credit_limit", precision = 19, scale = 4)
    private BigDecimal creditLimit;

    @Column(name = "closing_day")
    private Integer closingDay;

    @Column(name = "due_day")
    private Integer dueDay;

    @Column(precision = 19, scale = 4)
    private BigDecimal goalBalance;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @OneToMany(mappedBy = "account", cascade = CascadeType.ALL)
    @Builder.Default
    private List<Transaction> transactions = new ArrayList<>();

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public enum AccountType {
        CHECKING,      // Conta Corrente
        SAVINGS,       // Poupança
        INVESTMENT,    // Investimentos
        CREDIT_CARD,   // Cartão de Crédito
        CASH,          // Dinheiro
        DIGITAL_WALLET // Carteira Digital
    }
}
