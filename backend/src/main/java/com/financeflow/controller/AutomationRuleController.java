package com.financeflow.controller;

import com.financeflow.dto.automation.AutomationRuleRequest;
import com.financeflow.dto.automation.AutomationRuleResponse;
import com.financeflow.dto.common.ApiResponse;
import com.financeflow.service.AutomationRuleService;
import com.financeflow.util.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/automation-rules")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class AutomationRuleController {

    private final AutomationRuleService automationRuleService;
    private final SecurityUtils securityUtils;

    @PostMapping
    public ResponseEntity<ApiResponse<AutomationRuleResponse>> createRule(
            @Valid @RequestBody AutomationRuleRequest request) {
        UUID userId = securityUtils.getCurrentUserId();
        AutomationRuleResponse response = automationRuleService.createRule(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Automation rule created"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<AutomationRuleResponse>>> listRules() {
        UUID userId = securityUtils.getCurrentUserId();
        List<AutomationRuleResponse> rules = automationRuleService.listRules(userId);
        return ResponseEntity.ok(ApiResponse.success(rules));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AutomationRuleResponse>> getRule(@PathVariable UUID id) {
        UUID userId = securityUtils.getCurrentUserId();
        AutomationRuleResponse rule = automationRuleService.getRule(id, userId);
        return ResponseEntity.ok(ApiResponse.success(rule));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AutomationRuleResponse>> updateRule(
            @PathVariable UUID id,
            @Valid @RequestBody AutomationRuleRequest request) {
        UUID userId = securityUtils.getCurrentUserId();
        AutomationRuleResponse response = automationRuleService.updateRule(id, request, userId);
        return ResponseEntity.ok(ApiResponse.success(response, "Automation rule updated"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteRule(@PathVariable UUID id) {
        UUID userId = securityUtils.getCurrentUserId();
        automationRuleService.deleteRule(id, userId);
        return ResponseEntity.ok(ApiResponse.success(null, "Automation rule deleted"));
    }

    @PostMapping("/{id}/toggle")
    public ResponseEntity<ApiResponse<AutomationRuleResponse>> toggleRule(@PathVariable UUID id) {
        UUID userId = securityUtils.getCurrentUserId();
        AutomationRuleResponse response = automationRuleService.toggleRule(id, userId);
        return ResponseEntity.ok(ApiResponse.success(response, "Automation rule toggled"));
    }

    @PostMapping("/apply")
    public ResponseEntity<ApiResponse<Map<String, Integer>>> applyRules(
            @RequestBody Map<String, String> body) {
        UUID userId = securityUtils.getCurrentUserId();
        String startDateStr = body.get("startDate");
        String endDateStr = body.get("endDate");

        if (startDateStr == null || endDateStr == null) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("startDate and endDate are required"));
        }

        LocalDate startDate = LocalDate.parse(startDateStr);
        LocalDate endDate = LocalDate.parse(endDateStr);

        int modifiedCount = automationRuleService.applyRulesToExistingTransactions(userId, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success(Map.of("modifiedCount", modifiedCount), "Rules applied"));
    }
}
