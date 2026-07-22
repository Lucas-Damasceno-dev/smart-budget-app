package com.financeflow.controller;

import com.financeflow.dto.common.ApiResponse;
import com.financeflow.dto.report.ReportResponse;
import com.financeflow.service.ReportService;
import com.financeflow.util.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.UUID;

@RestController
@RequestMapping("/reports")
@RequiredArgsConstructor
@Tag(name = "Reports", description = "Financial reports and analytics")
@SecurityRequirement(name = "Bearer Authentication")
public class ReportController {

    private final ReportService reportService;
    private final SecurityUtils securityUtils;

    @GetMapping
    @Operation(summary = "Generate financial report")
    public ResponseEntity<ApiResponse<ReportResponse>> generateReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        UUID userId = securityUtils.getCurrentUserId();
        ReportResponse report = reportService.generateReport(userId, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success(report));
    }

    @GetMapping("/monthly")
    @Operation(summary = "Get monthly report")
    public ResponseEntity<ApiResponse<ReportResponse>> getMonthlyReport(
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year) {
        UUID userId = securityUtils.getCurrentUserId();

        LocalDate now = LocalDate.now();
        int targetMonth = month != null ? month : now.getMonthValue();
        int targetYear = year != null ? year : now.getYear();

        LocalDate startDate = LocalDate.of(targetYear, targetMonth, 1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());

        ReportResponse report = reportService.generateReport(userId, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success(report));
    }

    @GetMapping("/yearly")
    @Operation(summary = "Get yearly report")
    public ResponseEntity<ApiResponse<ReportResponse>> getYearlyReport(
            @RequestParam(required = false) Integer year) {
        UUID userId = securityUtils.getCurrentUserId();

        int targetYear = year != null ? year : LocalDate.now().getYear();
        LocalDate startDate = LocalDate.of(targetYear, 1, 1);
        LocalDate endDate = LocalDate.of(targetYear, 12, 31);

        ReportResponse report = reportService.generateReport(userId, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success(report));
    }

    @GetMapping("/export/csv")
    @Operation(summary = "Export report as CSV")
    public ResponseEntity<byte[]> exportCsv(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        UUID userId = securityUtils.getCurrentUserId();
        byte[] csvData = reportService.generateCsvReport(userId, startDate, endDate);

        return ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"financeflow-report.csv\"")
                .header(org.springframework.http.HttpHeaders.CONTENT_TYPE, "text/csv; charset=UTF-8")
                .body(csvData);
    }
}
