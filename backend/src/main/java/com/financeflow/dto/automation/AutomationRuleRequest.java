package com.financeflow.dto.automation;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.util.UUID;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class AutomationRuleRequest {

    @NotBlank(message = "Name is required")
    private String name;

    private String description;

    @NotBlank(message = "Condition field is required")
    private String conditionField;

    @NotBlank(message = "Condition operator is required")
    private String conditionOperator;

    @NotBlank(message = "Condition value is required")
    private String conditionValue;

    private UUID setCategoryId;
    private UUID setAccountId;
    private String setDescription;
    private String setTags;
    private Boolean setAsTransfer;
    private Integer priority;
    private Boolean enabled;
}
