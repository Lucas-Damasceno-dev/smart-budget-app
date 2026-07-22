package com.financeflow.controller;

import com.financeflow.dto.common.ApiResponse;
import com.financeflow.dto.sharing.AccountShareRequest;
import com.financeflow.dto.sharing.AccountShareResponse;
import com.financeflow.dto.sharing.ExpenseSplitRequest;
import com.financeflow.dto.sharing.ExpenseSplitResponse;
import com.financeflow.service.AccountShareService;
import com.financeflow.util.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/shared-accounts")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class AccountShareController {

    private final AccountShareService accountShareService;
    private final SecurityUtils securityUtils;

    @PostMapping
    public ResponseEntity<ApiResponse<AccountShareResponse>> shareAccount(
            @Valid @RequestBody AccountShareRequest request) {
        UUID userId = securityUtils.getCurrentUserId();
        AccountShareResponse response = accountShareService.shareAccount(userId, request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<AccountShareResponse>>> getMyShares() {
        UUID userId = securityUtils.getCurrentUserId();
        List<AccountShareResponse> shares = accountShareService.getMyShares(userId);
        return ResponseEntity.ok(ApiResponse.success(shares));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> revokeShare(@PathVariable UUID id) {
        UUID userId = securityUtils.getCurrentUserId();
        accountShareService.revokeShare(userId, id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PostMapping("/splits")
    public ResponseEntity<ApiResponse<ExpenseSplitResponse>> createSplit(
            @Valid @RequestBody ExpenseSplitRequest request) {
        UUID userId = securityUtils.getCurrentUserId();
        ExpenseSplitResponse response = accountShareService.createExpenseSplit(userId, request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/splits")
    public ResponseEntity<ApiResponse<List<ExpenseSplitResponse>>> getMySplits() {
        UUID userId = securityUtils.getCurrentUserId();
        List<ExpenseSplitResponse> splits = accountShareService.getMySplits(userId);
        return ResponseEntity.ok(ApiResponse.success(splits));
    }

    @PostMapping("/splits/{id}/settle")
    public ResponseEntity<ApiResponse<ExpenseSplitResponse>> settleSplit(@PathVariable UUID id) {
        UUID userId = securityUtils.getCurrentUserId();
        ExpenseSplitResponse response = accountShareService.settleSplit(userId, id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
