package com.financeflow.dto.goal;

import com.financeflow.entity.Goal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GoalResponse {

    private UUID id;
    private String name;
    private BigDecimal targetAmount;
    private BigDecimal currentAmount;
    private BigDecimal remainingAmount;
    private double progressPercentage;
    private LocalDate targetDate;
    private String color;
    private String icon;
    private Goal.GoalStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
