package com.financeflow.dto.imports;

import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.Map;
import java.util.UUID;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ImportConfirmRequest {

    @NotNull(message = "Import log ID is required")
    private UUID importLogId;

    @Builder.Default
    private boolean skipDuplicates = true;

    private Map<Integer, UUID> categoryOverrides;
}
