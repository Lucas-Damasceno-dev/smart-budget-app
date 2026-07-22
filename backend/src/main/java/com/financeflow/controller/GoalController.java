package com.financeflow.controller;

import com.financeflow.dto.common.ApiResponse;
import com.financeflow.dto.goal.GoalDepositRequest;
import com.financeflow.dto.goal.GoalRequest;
import com.financeflow.dto.goal.GoalResponse;
import com.financeflow.service.GoalService;
import com.financeflow.util.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/goals")
@RequiredArgsConstructor
@Tag(name = "Goals", description = "Financial goals management")
@SecurityRequirement(name = "Bearer Authentication")
public class GoalController {

    private final GoalService goalService;
    private final SecurityUtils securityUtils;

    @GetMapping
    @Operation(summary = "Get all financial goals for user")
    public ResponseEntity<ApiResponse<List<GoalResponse>>> getGoals() {
        UUID userId = securityUtils.getCurrentUserId();
        List<GoalResponse> goals = goalService.getGoals(userId);
        return ResponseEntity.ok(ApiResponse.success(goals));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get goal by ID")
    public ResponseEntity<ApiResponse<GoalResponse>> getGoal(@PathVariable UUID id) {
        UUID userId = securityUtils.getCurrentUserId();
        GoalResponse goal = goalService.getGoal(id, userId);
        return ResponseEntity.ok(ApiResponse.success(goal));
    }

    @PostMapping
    @Operation(summary = "Create new goal")
    public ResponseEntity<ApiResponse<GoalResponse>> createGoal(@Valid @RequestBody GoalRequest request) {
        UUID userId = securityUtils.getCurrentUserId();
        GoalResponse goal = goalService.createGoal(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(goal, "Goal created successfully"));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update goal")
    public ResponseEntity<ApiResponse<GoalResponse>> updateGoal(
            @PathVariable UUID id,
            @Valid @RequestBody GoalRequest request) {
        UUID userId = securityUtils.getCurrentUserId();
        GoalResponse goal = goalService.updateGoal(id, request, userId);
        return ResponseEntity.ok(ApiResponse.success(goal, "Goal updated successfully"));
    }

    @PostMapping("/{id}/deposit")
    @Operation(summary = "Deposit funds into goal")
    public ResponseEntity<ApiResponse<GoalResponse>> depositToGoal(
            @PathVariable UUID id,
            @Valid @RequestBody GoalDepositRequest request) {
        UUID userId = securityUtils.getCurrentUserId();
        GoalResponse goal = goalService.depositToGoal(id, request, userId);
        return ResponseEntity.ok(ApiResponse.success(goal, "Funds deposited successfully"));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete goal")
    public ResponseEntity<ApiResponse<Void>> deleteGoal(@PathVariable UUID id) {
        UUID userId = securityUtils.getCurrentUserId();
        goalService.deleteGoal(id, userId);
        return ResponseEntity.ok(ApiResponse.success(null, "Goal deleted successfully"));
    }
}
