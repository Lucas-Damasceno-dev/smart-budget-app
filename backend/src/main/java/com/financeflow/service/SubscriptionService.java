package com.financeflow.service;

import com.financeflow.dto.subscription.SubscriptionRequest;
import com.financeflow.dto.subscription.SubscriptionResponse;
import com.financeflow.dto.subscription.SubscriptionSummaryResponse;
import com.financeflow.entity.*;
import com.financeflow.exception.BadRequestException;
import com.financeflow.exception.ResourceNotFoundException;
import com.financeflow.repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepo;
    private final AccountRepository accountRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    @Transactional
    @Caching(evict = {
        @CacheEvict(value = "dashboard", key = "#userId"),
        @CacheEvict(value = "accounts", key = "#userId")
    })
    public SubscriptionResponse createSubscription(SubscriptionRequest request, UUID userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Category category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        }
        Account account = null;
        if (request.getAccountId() != null) {
            account = accountRepository.findById(request.getAccountId())
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));
        }

        Subscription sub = Subscription.builder()
            .name(request.getName())
            .description(request.getDescription())
            .amount(request.getAmount())
            .billingCycle(request.getBillingCycle())
            .category(category)
            .account(account)
            .user(user)
            .nextBillingDate(request.getNextBillingDate())
            .color(request.getColor())
            .icon(request.getIcon())
            .url(request.getUrl())
            .autoCreateTransaction(request.getAutoCreateTransaction())
            .status(Subscription.SubscriptionStatus.ACTIVE)
            .build();

        sub = subscriptionRepo.save(sub);
        return mapToResponse(sub);
    }

    public List<SubscriptionResponse> listSubscriptions(UUID userId) {
        return subscriptionRepo.findByUserId(userId).stream()
            .map(this::mapToResponse)
            .toList();
    }

    public List<SubscriptionResponse> listSubscriptionsByStatus(UUID userId, Subscription.SubscriptionStatus status) {
        return subscriptionRepo.findByUserIdAndStatus(userId, status).stream()
            .map(this::mapToResponse)
            .toList();
    }

    public SubscriptionResponse getSubscription(UUID id, UUID userId) {
        Subscription sub = subscriptionRepo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Subscription not found"));
        if (!sub.getUser().getId().equals(userId)) {
            throw new BadRequestException("Subscription does not belong to user");
        }
        return mapToResponse(sub);
    }

    @Transactional
    @Caching(evict = {
        @CacheEvict(value = "dashboard", key = "#userId"),
        @CacheEvict(value = "accounts", key = "#userId")
    })
    public SubscriptionResponse updateSubscription(UUID id, SubscriptionRequest request, UUID userId) {
        Subscription sub = subscriptionRepo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Subscription not found"));
        if (!sub.getUser().getId().equals(userId)) {
            throw new BadRequestException("Subscription does not belong to user");
        }

        sub.setName(request.getName());
        sub.setDescription(request.getDescription());
        sub.setAmount(request.getAmount());
        sub.setBillingCycle(request.getBillingCycle());
        sub.setNextBillingDate(request.getNextBillingDate());
        sub.setColor(request.getColor());
        sub.setIcon(request.getIcon());
        sub.setUrl(request.getUrl());
        sub.setAutoCreateTransaction(request.getAutoCreateTransaction());

        if (request.getCategoryId() != null) {
            sub.setCategory(categoryRepository.findById(request.getCategoryId()).orElse(null));
        } else {
            sub.setCategory(null);
        }
        if (request.getAccountId() != null) {
            sub.setAccount(accountRepository.findById(request.getAccountId()).orElse(null));
        } else {
            sub.setAccount(null);
        }

        sub = subscriptionRepo.save(sub);
        return mapToResponse(sub);
    }

    @Transactional
    @Caching(evict = {
        @CacheEvict(value = "dashboard", key = "#userId"),
        @CacheEvict(value = "accounts", key = "#userId")
    })
    public void cancelSubscription(UUID id, UUID userId) {
        Subscription sub = subscriptionRepo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Subscription not found"));
        if (!sub.getUser().getId().equals(userId)) {
            throw new BadRequestException("Subscription does not belong to user");
        }
        sub.setStatus(Subscription.SubscriptionStatus.CANCELLED);
        subscriptionRepo.save(sub);
    }

    @Transactional
    @Caching(evict = {
        @CacheEvict(value = "dashboard", key = "#userId"),
        @CacheEvict(value = "accounts", key = "#userId")
    })
    public SubscriptionResponse pauseSubscription(UUID id, UUID userId) {
        Subscription sub = subscriptionRepo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Subscription not found"));
        if (!sub.getUser().getId().equals(userId)) {
            throw new BadRequestException("Subscription does not belong to user");
        }
        sub.setStatus(Subscription.SubscriptionStatus.PAUSED);
        sub = subscriptionRepo.save(sub);
        return mapToResponse(sub);
    }

    @Transactional
    @Caching(evict = {
        @CacheEvict(value = "dashboard", key = "#userId"),
        @CacheEvict(value = "accounts", key = "#userId")
    })
    public SubscriptionResponse resumeSubscription(UUID id, UUID userId) {
        Subscription sub = subscriptionRepo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Subscription not found"));
        if (!sub.getUser().getId().equals(userId)) {
            throw new BadRequestException("Subscription does not belong to user");
        }
        sub.setStatus(Subscription.SubscriptionStatus.ACTIVE);
        sub.setNextBillingDate(LocalDate.now());
        sub = subscriptionRepo.save(sub);
        return mapToResponse(sub);
    }

    public SubscriptionSummaryResponse getSummary(UUID userId) {
        List<Subscription> active = subscriptionRepo
            .findByUserIdAndStatus(userId, Subscription.SubscriptionStatus.ACTIVE);
        List<SubscriptionResponse> responses = active.stream().map(this::mapToResponse).toList();

        BigDecimal totalMonthly = responses.stream()
            .map(SubscriptionResponse::getMonthlyEquivalent)
            .filter(Objects::nonNull)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalAnnual = responses.stream()
            .map(SubscriptionResponse::getAnnualEquivalent)
            .filter(Objects::nonNull)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        return SubscriptionSummaryResponse.builder()
            .activeSubscriptions(responses)
            .totalMonthlyCost(totalMonthly)
            .totalAnnualCost(totalAnnual)
            .activeCount(responses.size())
            .build();
    }

    private SubscriptionResponse mapToResponse(Subscription sub) {
        BigDecimal monthlyEq = computeMonthlyEquivalent(sub.getAmount(), sub.getBillingCycle());
        BigDecimal annualEq = monthlyEq != null ? monthlyEq.multiply(BigDecimal.valueOf(12)) : null;

        return SubscriptionResponse.builder()
            .id(sub.getId())
            .name(sub.getName())
            .description(sub.getDescription())
            .amount(sub.getAmount())
            .billingCycle(sub.getBillingCycle())
            .categoryId(sub.getCategory() != null ? sub.getCategory().getId() : null)
            .categoryName(sub.getCategory() != null ? sub.getCategory().getName() : null)
            .accountId(sub.getAccount() != null ? sub.getAccount().getId() : null)
            .accountName(sub.getAccount() != null ? sub.getAccount().getName() : null)
            .nextBillingDate(sub.getNextBillingDate())
            .status(sub.getStatus())
            .color(sub.getColor())
            .icon(sub.getIcon())
            .url(sub.getUrl())
            .autoCreateTransaction(sub.getAutoCreateTransaction())
            .monthlyEquivalent(monthlyEq)
            .annualEquivalent(annualEq)
            .createdAt(sub.getCreatedAt())
            .updatedAt(sub.getUpdatedAt())
            .build();
    }

    private BigDecimal computeMonthlyEquivalent(BigDecimal amount, Subscription.BillingCycle cycle) {
        if (amount == null) return BigDecimal.ZERO;
        return switch (cycle) {
            case MONTHLY -> amount;
            case QUARTERLY -> amount.divide(BigDecimal.valueOf(3), 2, RoundingMode.HALF_UP);
            case SEMI_ANNUAL -> amount.divide(BigDecimal.valueOf(6), 2, RoundingMode.HALF_UP);
            case YEARLY -> amount.divide(BigDecimal.valueOf(12), 2, RoundingMode.HALF_UP);
        };
    }
}
