package com.financeflow.controller;

import com.financeflow.dto.analytics.CategoryDrilldownResponse;
import com.financeflow.dto.analytics.ForecastResponse;
import com.financeflow.dto.analytics.InsightResponse;
import com.financeflow.dto.analytics.PeriodComparisonResponse;
import com.financeflow.dto.common.ApiResponse;
import com.financeflow.service.AnalyticsService;
import com.financeflow.service.ForecastService;
import com.financeflow.service.InsightService;
import com.financeflow.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class AnalyticsController {

    private final InsightService insightService;
    private final ForecastService forecastService;
    private final AnalyticsService analyticsService;
    private final SecurityUtils securityUtils;

    @GetMapping("/insights")
    public ResponseEntity<ApiResponse<List<InsightResponse>>> getInsights() {
        UUID userId = securityUtils.getCurrentUserId();
        List<InsightResponse> insights = insightService.generateInsights(userId);
        return ResponseEntity.ok(ApiResponse.success(insights));
    }

    @GetMapping("/forecast")
    public ResponseEntity<ApiResponse<ForecastResponse>> getForecast(
            @RequestParam(defaultValue = "30") int days) {
        UUID userId = securityUtils.getCurrentUserId();
        ForecastResponse forecast = forecastService.generateForecast(userId, days);
        return ResponseEntity.ok(ApiResponse.success(forecast));
    }

    @GetMapping("/period-comparison")
    public ResponseEntity<ApiResponse<PeriodComparisonResponse>> getPeriodComparison(
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year) {
        UUID userId = securityUtils.getCurrentUserId();
        PeriodComparisonResponse comparison = analyticsService.getPeriodComparison(userId, month, year);
        return ResponseEntity.ok(ApiResponse.success(comparison));
    }

    @GetMapping("/category-drilldown/{categoryId}")
    public ResponseEntity<ApiResponse<CategoryDrilldownResponse>> getCategoryDrilldown(
            @PathVariable UUID categoryId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        UUID userId = securityUtils.getCurrentUserId();
        CategoryDrilldownResponse drilldown = analyticsService.getCategoryDrilldown(userId, categoryId, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success(drilldown));
    }
}
