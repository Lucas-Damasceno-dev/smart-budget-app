package com.financeflow.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "import_logs", indexes = {
    @Index(name = "idx_il_user", columnList = "user_id"),
    @Index(name = "idx_il_account", columnList = "account_id"),
    @Index(name = "idx_il_status", columnList = "status")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ImportLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "file_name", nullable = false)
    private String fileName;

    @Column(name = "file_type", nullable = false, length = 10)
    private String fileType;

    @Column(name = "account_id", nullable = false)
    private UUID accountId;

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String status = "PENDING";

    @Column(name = "total_rows")
    private Integer totalRows;

    @Column(name = "imported_count")
    private Integer importedCount;

    @Column(name = "duplicate_count")
    private Integer duplicateCount;

    @Column(name = "error_count")
    private Integer errorCount;

    @Column(name = "error_details", columnDefinition = "TEXT")
    private String errorDetails;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
