package com.financeflow.dto.imports;

import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ImportLogResponse {

    private UUID id;
    private String fileName;
    private String fileType;
    private UUID accountId;
    private String accountName;
    private String status;
    private int totalRows;
    private int importedCount;
    private int duplicateCount;
    private int errorCount;
    private String errorDetails;
    private LocalDateTime createdAt;
}
