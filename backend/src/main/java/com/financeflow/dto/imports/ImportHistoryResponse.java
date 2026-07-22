package com.financeflow.dto.imports;

import lombok.*;

import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ImportHistoryResponse {

    private List<ImportLogResponse> imports;
    private int totalImported;
    private int totalDuplicates;
}
