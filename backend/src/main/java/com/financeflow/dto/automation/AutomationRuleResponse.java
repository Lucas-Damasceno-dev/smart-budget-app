package com.financeflow.dto.automation;

import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class AutomationRuleResponse {

    private UUID id;
    private String name;
    private String description;
    private String conditionField;
    private String conditionOperator;
    private String conditionValue;
    private UUID setCategoryId;
    private String setCategoryName;
    private UUID setAccountId;
    private String setAccountName;
    private String setDescription;
    private String setTags;
    private Boolean setAsTransfer;
    private Integer priority;
    private Boolean enabled;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
