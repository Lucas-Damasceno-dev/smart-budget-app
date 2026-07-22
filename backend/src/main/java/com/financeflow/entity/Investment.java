package com.financeflow.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "investments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Investment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private InvestmentType type;

    private String ticker;

    @Column(nullable = false, precision = 19, scale = 8)
    private BigDecimal quantity;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal averagePrice;

    @Column(precision = 19, scale = 4)
    private BigDecimal currentPrice;

    @Column(precision = 19, scale = 4)
    private BigDecimal totalInvested;

    @Column(precision = 19, scale = 4)
    private BigDecimal currentValue;

    @Column(precision = 19, scale = 4)
    @Builder.Default
    private BigDecimal dividendsReceived = BigDecimal.ZERO;

    private LocalDate purchaseDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public enum InvestmentType {
        STOCK,           // Ações
        FII,             // Fundos Imobiliários
        TREASURY_BOND,   // Tesouro Direto
        CRYPTO,          // Criptomoedas
        FIXED_INCOME,    // Renda Fixa
        FUND,            // Fundos de Investimento
        ETF              // ETFs
    }

    public BigDecimal getProfitLoss() {
        if (currentValue == null || totalInvested == null) return BigDecimal.ZERO;
        return currentValue.subtract(totalInvested);
    }

    public BigDecimal getProfitLossPercentage() {
        if (totalInvested == null || totalInvested.compareTo(BigDecimal.ZERO) == 0) return BigDecimal.ZERO;
        return getProfitLoss().divide(totalInvested, 4, java.math.RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100));
    }
}
