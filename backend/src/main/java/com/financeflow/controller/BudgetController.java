package com.financeflow.controller;

import com.financeflow.dto.budget.BudgetRequest;
import com.financeflow.dto.budget.BudgetResponse;
import com.financeflow.dto.common.ApiResponse;
import com.financeflow.entity.Budget;
import com.financeflow.service.BudgetService;
import com.financeflow.util.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/budgets")
@RequiredArgsConstructor
@Tag(name = "Budgets", description = "Budget management")
@SecurityRequirement(name = "Bearer Authentication")
public class BudgetController {

    private final BudgetService budgetService;
    private final SecurityUtils securityUtils;

    @GetMapping
    @Operation(summary = "Get budgets for current month")
    public ResponseEntity<ApiResponse<List<BudgetResponse>>> getBudgets(
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year) {
        UUID userId = securityUtils.getCurrentUserId();
        
        LocalDate now = LocalDate.now();
        int targetMonth = month != null ? month : now.getMonthValue();
        int targetYear = year != null ? year : now.getYear();
        
        List<Budget> budgets = budgetService.getBudgetsForMonth(userId, targetMonth, targetYear);
        List<BudgetResponse> responses = budgets.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @PostMapping
    @Operation(summary = "Create or update budget")
    public ResponseEntity<ApiResponse<BudgetResponse>> createOrUpdateBudget(
            @Valid @RequestBody BudgetRequest request) {
        UUID userId = securityUtils.getCurrentUserId();
        
        Budget budget = budgetService.createOrUpdateBudget(
                request.getCategoryId(),
                userId,
                request.getLimitAmount(),
                request.getMonth(),
                request.getYear()
        );
        
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(mapToResponse(budget), "Budget saved successfully"));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete budget")
    public ResponseEntity<ApiResponse<Void>> deleteBudget(@PathVariable UUID id) {
        UUID userId = securityUtils.getCurrentUserId();
        budgetService.deleteBudget(id, userId);
        return ResponseEntity.ok(ApiResponse.success(null, "Budget deleted successfully"));
    }

    private BudgetResponse mapToResponse(Budget budget) {
        return BudgetResponse.builder()
                .id(budget.getId())
                .categoryId(budget.getCategory().getId())
                .categoryName(budget.getCategory().getName())
                .categoryColor(budget.getCategory().getColor())
                .categoryIcon(budget.getCategory().getIcon())
                .limitAmount(budget.getLimitAmount())
                .spentAmount(budget.getSpentAmount())
                .remainingAmount(budget.getRemainingAmount())
                .percentageUsed(budget.getPercentageUsed())
                .month(budget.getMonth())
                .year(budget.getYear())
                .createdAt(budget.getCreatedAt())
                .updatedAt(budget.getUpdatedAt())
                .build();
    }
}
