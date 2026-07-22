package com.financeflow.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "goals")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Goal {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal targetAmount;

    @Column(nullable = false, precision = 19, scale = 4)
    @Builder.Default
    private BigDecimal currentAmount = BigDecimal.ZERO;

    @Column(nullable = false)
    private LocalDate targetDate;

    private String color;

    private String icon;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private GoalStatus status = GoalStatus.IN_PROGRESS;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public enum GoalStatus {
        IN_PROGRESS,
        COMPLETED,
        CANCELLED
    }

    public double getProgressPercentage() {
        if (targetAmount == null || targetAmount.compareTo(BigDecimal.ZERO) == 0) return 0;
        BigDecimal cur = currentAmount != null ? currentAmount : BigDecimal.ZERO;
        return cur.divide(targetAmount, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100)).doubleValue();
    }

    public BigDecimal getRemainingAmount() {
        if (targetAmount == null) return BigDecimal.ZERO;
        BigDecimal cur = currentAmount != null ? currentAmount : BigDecimal.ZERO;
        BigDecimal rem = targetAmount.subtract(cur);
        return rem.compareTo(BigDecimal.ZERO) < 0 ? BigDecimal.ZERO : rem;
    }
}
