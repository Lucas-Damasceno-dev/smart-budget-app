package com.financeflow.controller;

import com.financeflow.dto.common.ApiResponse;
import com.financeflow.dto.imports.ImportConfirmRequest;
import com.financeflow.dto.imports.ImportHistoryResponse;
import com.financeflow.dto.imports.ImportLogResponse;
import com.financeflow.dto.imports.ImportPreviewResponse;
import com.financeflow.service.ImportService;
import com.financeflow.util.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/imports")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class ImportController {

    private final ImportService importService;
    private final SecurityUtils securityUtils;

    @PostMapping(value = "/preview", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<ImportPreviewResponse>> previewImport(
            @RequestParam("file") MultipartFile file,
            @RequestParam("accountId") UUID accountId) {
        UUID userId = securityUtils.getCurrentUserId();
        ImportPreviewResponse response = importService.previewImport(file, accountId, userId);
        return ResponseEntity.ok(ApiResponse.success(response, "File previewed successfully"));
    }

    @PostMapping("/confirm")
    public ResponseEntity<ApiResponse<ImportLogResponse>> confirmImport(
            @Valid @RequestBody ImportConfirmRequest request) {
        UUID userId = securityUtils.getCurrentUserId();
        ImportLogResponse response = importService.confirmImport(request, userId);
        return ResponseEntity.ok(ApiResponse.success(response, "Import confirmed successfully"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<ImportHistoryResponse>> getHistory() {
        UUID userId = securityUtils.getCurrentUserId();
        ImportHistoryResponse history = importService.getHistory(userId);
        return ResponseEntity.ok(ApiResponse.success(history));
    }

    @GetMapping("/recent")
    public ResponseEntity<ApiResponse<List<ImportLogResponse>>> getRecentImports() {
        UUID userId = securityUtils.getCurrentUserId();
        List<ImportLogResponse> recent = importService.getRecentImports(userId);
        return ResponseEntity.ok(ApiResponse.success(recent));
    }
}
