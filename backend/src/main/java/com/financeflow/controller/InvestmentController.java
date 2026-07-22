package com.financeflow.controller;

import com.financeflow.dto.common.ApiResponse;
import com.financeflow.dto.investment.InvestmentRequest;
import com.financeflow.dto.investment.InvestmentResponse;
import com.financeflow.dto.investment.InvestmentSummaryResponse;
import com.financeflow.service.InvestmentService;
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
@RequestMapping("/investments")
@RequiredArgsConstructor
@Tag(name = "Investments", description = "Investment portfolio management")
@SecurityRequirement(name = "Bearer Authentication")
public class InvestmentController {

    private final InvestmentService investmentService;
    private final SecurityUtils securityUtils;

    @GetMapping
    @Operation(summary = "Get all investments for user")
    public ResponseEntity<ApiResponse<List<InvestmentResponse>>> getInvestments() {
        UUID userId = securityUtils.getCurrentUserId();
        List<InvestmentResponse> investments = investmentService.getInvestments(userId);
        return ResponseEntity.ok(ApiResponse.success(investments));
    }

    @GetMapping("/summary")
    @Operation(summary = "Get investment portfolio summary")
    public ResponseEntity<ApiResponse<InvestmentSummaryResponse>> getSummary() {
        UUID userId = securityUtils.getCurrentUserId();
        InvestmentSummaryResponse summary = investmentService.getSummary(userId);
        return ResponseEntity.ok(ApiResponse.success(summary));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get investment by ID")
    public ResponseEntity<ApiResponse<InvestmentResponse>> getInvestment(@PathVariable UUID id) {
        UUID userId = securityUtils.getCurrentUserId();
        InvestmentResponse investment = investmentService.getInvestment(id, userId);
        return ResponseEntity.ok(ApiResponse.success(investment));
    }

    @PostMapping
    @Operation(summary = "Create new investment")
    public ResponseEntity<ApiResponse<InvestmentResponse>> createInvestment(
            @Valid @RequestBody InvestmentRequest request) {
        UUID userId = securityUtils.getCurrentUserId();
        InvestmentResponse investment = investmentService.createInvestment(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(investment, "Investment created successfully"));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update investment")
    public ResponseEntity<ApiResponse<InvestmentResponse>> updateInvestment(
            @PathVariable UUID id,
            @Valid @RequestBody InvestmentRequest request) {
        UUID userId = securityUtils.getCurrentUserId();
        InvestmentResponse investment = investmentService.updateInvestment(id, request, userId);
        return ResponseEntity.ok(ApiResponse.success(investment, "Investment updated successfully"));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete investment")
    public ResponseEntity<ApiResponse<Void>> deleteInvestment(@PathVariable UUID id) {
        UUID userId = securityUtils.getCurrentUserId();
        investmentService.deleteInvestment(id, userId);
        return ResponseEntity.ok(ApiResponse.success(null, "Investment deleted successfully"));
    }
}
