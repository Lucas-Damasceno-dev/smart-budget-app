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
@Table(name = "budgets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Budget {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal limitAmount;

    @Column(precision = 19, scale = 4)
    @Builder.Default
    private BigDecimal spentAmount = BigDecimal.ZERO;

    private int month;

    private int year;

    @Column(name = "alert_at80_sent")
    @Builder.Default
    private boolean alertAt80Sent = false;

    @Column(name = "alert_at100_sent")
    @Builder.Default
    private boolean alertAt100Sent = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public BigDecimal getRemainingAmount() {
        BigDecimal spent = spentAmount != null ? spentAmount : BigDecimal.ZERO;
        return limitAmount != null ? limitAmount.subtract(spent) : BigDecimal.ZERO;
    }

    public double getPercentageUsed() {
        BigDecimal spent = spentAmount != null ? spentAmount : BigDecimal.ZERO;
        if (limitAmount == null || limitAmount.compareTo(BigDecimal.ZERO) == 0) return 0;
        return spent.divide(limitAmount, 4, java.math.RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100)).doubleValue();
    }
}
