package com.financeflow.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "account_shares")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AccountShare {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_user_id", nullable = false)
    private User ownerUser;

    @Column(name = "shared_with_email", nullable = false)
    private String sharedWithEmail;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shared_with_user_id")
    private User sharedWithUser;

    @Enumerated(EnumType.STRING)
    @Column(name = "permission_level", nullable = false)
    @Builder.Default
    private PermissionLevel permissionLevel = PermissionLevel.READ;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private ShareStatus status = ShareStatus.PENDING;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public enum PermissionLevel {
        READ, WRITE, ADMIN
    }

    public enum ShareStatus {
        PENDING, ACCEPTED, REJECTED
    }
}
