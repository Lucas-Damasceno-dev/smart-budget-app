package com.financeflow.controller;

import com.financeflow.dto.common.ApiResponse;
import com.financeflow.dto.subscription.SubscriptionRequest;
import com.financeflow.dto.subscription.SubscriptionResponse;
import com.financeflow.dto.subscription.SubscriptionSummaryResponse;
import com.financeflow.entity.Subscription;
import com.financeflow.service.SubscriptionService;
import com.financeflow.util.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/subscriptions")
@RequiredArgsConstructor
public class SubscriptionController {

    private final SubscriptionService subscriptionService;
    private final SecurityUtils securityUtils;

    @PostMapping
    public ResponseEntity<ApiResponse<SubscriptionResponse>> createSubscription(
            @Valid @RequestBody SubscriptionRequest request) {
        UUID userId = securityUtils.getCurrentUserId();
        SubscriptionResponse response = subscriptionService.createSubscription(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success(response, "Subscription created"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<SubscriptionResponse>>> listSubscriptions(
            @RequestParam(required = false) Subscription.SubscriptionStatus status) {
        UUID userId = securityUtils.getCurrentUserId();
        List<SubscriptionResponse> subs;
        if (status != null) {
            subs = subscriptionService.listSubscriptionsByStatus(userId, status);
        } else {
            subs = subscriptionService.listSubscriptions(userId);
        }
        return ResponseEntity.ok(ApiResponse.success(subs));
    }

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<SubscriptionSummaryResponse>> getSummary() {
        UUID userId = securityUtils.getCurrentUserId();
        SubscriptionSummaryResponse summary = subscriptionService.getSummary(userId);
        return ResponseEntity.ok(ApiResponse.success(summary));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SubscriptionResponse>> getSubscription(@PathVariable UUID id) {
        UUID userId = securityUtils.getCurrentUserId();
        SubscriptionResponse response = subscriptionService.getSubscription(id, userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<SubscriptionResponse>> updateSubscription(
            @PathVariable UUID id,
            @Valid @RequestBody SubscriptionRequest request) {
        UUID userId = securityUtils.getCurrentUserId();
        SubscriptionResponse response = subscriptionService.updateSubscription(id, request, userId);
        return ResponseEntity.ok(ApiResponse.success(response, "Subscription updated"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteSubscription(@PathVariable UUID id) {
        UUID userId = securityUtils.getCurrentUserId();
        subscriptionService.cancelSubscription(id, userId);
        return ResponseEntity.ok(ApiResponse.success(null, "Subscription cancelled"));
    }

    @PutMapping("/{id}/pause")
    public ResponseEntity<ApiResponse<SubscriptionResponse>> pauseSubscription(@PathVariable UUID id) {
        UUID userId = securityUtils.getCurrentUserId();
        SubscriptionResponse response = subscriptionService.pauseSubscription(id, userId);
        return ResponseEntity.ok(ApiResponse.success(response, "Subscription paused"));
    }

    @PutMapping("/{id}/resume")
    public ResponseEntity<ApiResponse<SubscriptionResponse>> resumeSubscription(@PathVariable UUID id) {
        UUID userId = securityUtils.getCurrentUserId();
        SubscriptionResponse response = subscriptionService.resumeSubscription(id, userId);
        return ResponseEntity.ok(ApiResponse.success(response, "Subscription resumed"));
    }
}
