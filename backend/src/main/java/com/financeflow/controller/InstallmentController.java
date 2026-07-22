package com.financeflow.controller;

import com.financeflow.dto.common.ApiResponse;
import com.financeflow.dto.installment.InstallmentEditRequest;
import com.financeflow.dto.installment.InstallmentRequest;
import com.financeflow.dto.installment.InstallmentResponse;
import com.financeflow.service.InstallmentService;
import com.financeflow.util.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/installments")
@RequiredArgsConstructor
public class InstallmentController {

    private final InstallmentService installmentService;
    private final SecurityUtils securityUtils;

    @PostMapping
    public ResponseEntity<ApiResponse<InstallmentResponse>> createInstallment(
            @Valid @RequestBody InstallmentRequest request) {
        UUID userId = securityUtils.getCurrentUserId();
        InstallmentResponse response = installmentService.createInstallment(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success(response, "Installment group created"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<InstallmentResponse>>> listInstallments() {
        UUID userId = securityUtils.getCurrentUserId();
        List<InstallmentResponse> groups = installmentService.listInstallmentGroups(userId);
        return ResponseEntity.ok(ApiResponse.success(groups));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<InstallmentResponse>> getInstallment(@PathVariable UUID id) {
        UUID userId = securityUtils.getCurrentUserId();
        InstallmentResponse response = installmentService.getInstallmentGroup(id, userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<InstallmentResponse>> editInstallment(
            @PathVariable UUID id,
            @Valid @RequestBody InstallmentEditRequest request) {
        UUID userId = securityUtils.getCurrentUserId();
        InstallmentResponse response = installmentService.editInstallment(id, request, userId);
        return ResponseEntity.ok(ApiResponse.success(response, "Installment updated"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> cancelInstallment(@PathVariable UUID id) {
        UUID userId = securityUtils.getCurrentUserId();
        installmentService.cancelInstallmentGroup(id, userId);
        return ResponseEntity.ok(ApiResponse.success(null, "Installment group cancelled"));
    }
}
