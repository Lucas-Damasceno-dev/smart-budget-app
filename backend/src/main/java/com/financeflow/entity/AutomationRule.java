package com.financeflow.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "automation_rules", indexes = {
    @Index(name = "idx_ar_user", columnList = "user_id"),
    @Index(name = "idx_ar_enabled", columnList = "enabled")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AutomationRule {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    private String description;

    @Column(name = "condition_field", nullable = false, length = 30)
    private String conditionField;

    @Column(name = "condition_operator", nullable = false, length = 30)
    private String conditionOperator;

    @Column(name = "condition_value", nullable = false)
    private String conditionValue;

    @Column(name = "set_category_id")
    private UUID setCategoryId;

    @Column(name = "set_account_id")
    private UUID setAccountId;

    @Column(name = "set_description")
    private String setDescription;

    @Column(name = "set_tags", length = 500)
    private String setTags;

    @Column(name = "set_as_transfer")
    @Builder.Default
    private Boolean setAsTransfer = false;

    @Builder.Default
    private Integer priority = 0;

    @Column(nullable = false)
    @Builder.Default
    private Boolean enabled = true;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
