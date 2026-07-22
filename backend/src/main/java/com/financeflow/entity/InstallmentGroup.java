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
@Table(name = "installment_groups", indexes = {
    @Index(name = "idx_instgrp_user", columnList = "user_id"),
    @Index(name = "idx_instgrp_account", columnList = "account_id")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class InstallmentGroup {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String description;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal totalAmount;

    @Column(nullable = false)
    private Integer totalInstallments;

    @Column(nullable = false)
    private Integer installmentNumber;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal installmentAmount;

    @Builder.Default
    private BigDecimal interestRate = BigDecimal.ZERO;

    @Column(nullable = false)
    private LocalDate purchaseDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private InstallmentStatus status = InstallmentStatus.ACTIVE;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

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

    public enum InstallmentStatus {
        ACTIVE, COMPLETED, CANCELLED
    }
}
