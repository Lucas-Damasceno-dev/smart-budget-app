package com.financeflow.dto.imports;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ImportPreviewResponse {

    private UUID importLogId;
    private String fileName;
    private String fileType;
    private UUID accountId;
    private String accountName;
    private int totalRows;
    private int duplicateCount;
    private List<ImportRowDto> rows;

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ImportRowDto {
        private int rowIndex;
        private String date;
        private String description;
        private BigDecimal amount;
        private String fitId;
        private boolean duplicate;
        private String suggestedCategory;
    }
}
