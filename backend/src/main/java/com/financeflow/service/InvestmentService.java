package com.financeflow.service;

import com.financeflow.dto.investment.InvestmentRequest;
import com.financeflow.dto.investment.InvestmentResponse;
import com.financeflow.dto.investment.InvestmentSummaryResponse;
import com.financeflow.entity.Account;
import com.financeflow.entity.Investment;
import com.financeflow.entity.User;
import com.financeflow.exception.ResourceNotFoundException;
import com.financeflow.repository.AccountRepository;
import com.financeflow.repository.InvestmentRepository;
import com.financeflow.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InvestmentService {

    private final InvestmentRepository investmentRepository;
    private final AccountRepository accountRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    @Cacheable(value = "investments", key = "#userId")
    public List<InvestmentResponse> getInvestments(UUID userId) {
        return investmentRepository.findByUserId(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public InvestmentResponse getInvestment(UUID id, UUID userId) {
        Investment investment = findInvestmentByIdAndUser(id, userId);
        return mapToResponse(investment);
    }

    @Transactional
    @CacheEvict(value = {"investments", "dashboard"}, key = "#userId")
    public InvestmentResponse createInvestment(InvestmentRequest request, UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Account account = accountRepository.findById(request.getAccountId())
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));

        BigDecimal currentPrice = request.getCurrentPrice() != null ? request.getCurrentPrice() : request.getAveragePrice();
        BigDecimal totalInvested = request.getQuantity().multiply(request.getAveragePrice());
        BigDecimal currentValue = request.getQuantity().multiply(currentPrice);

        Investment investment = Investment.builder()
                .name(request.getName())
                .type(request.getType())
                .ticker(request.getTicker())
                .quantity(request.getQuantity())
                .averagePrice(request.getAveragePrice())
                .currentPrice(currentPrice)
                .totalInvested(totalInvested)
                .currentValue(currentValue)
                .dividendsReceived(request.getDividendsReceived() != null ? request.getDividendsReceived() : BigDecimal.ZERO)
                .purchaseDate(request.getPurchaseDate())
                .account(account)
                .user(user)
                .build();

        investment = investmentRepository.save(investment);
        return mapToResponse(investment);
    }

    @Transactional
    @CacheEvict(value = {"investments", "dashboard"}, key = "#userId")
    public InvestmentResponse updateInvestment(UUID id, InvestmentRequest request, UUID userId) {
        Investment investment = findInvestmentByIdAndUser(id, userId);

        Account account = accountRepository.findById(request.getAccountId())
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));

        BigDecimal currentPrice = request.getCurrentPrice() != null ? request.getCurrentPrice() : request.getAveragePrice();
        BigDecimal totalInvested = request.getQuantity().multiply(request.getAveragePrice());
        BigDecimal currentValue = request.getQuantity().multiply(currentPrice);

        investment.setName(request.getName());
        investment.setType(request.getType());
        investment.setTicker(request.getTicker());
        investment.setQuantity(request.getQuantity());
        investment.setAveragePrice(request.getAveragePrice());
        investment.setCurrentPrice(currentPrice);
        investment.setTotalInvested(totalInvested);
        investment.setCurrentValue(currentValue);
        if (request.getDividendsReceived() != null) {
            investment.setDividendsReceived(request.getDividendsReceived());
        }
        investment.setPurchaseDate(request.getPurchaseDate());
        investment.setAccount(account);

        investment = investmentRepository.save(investment);
        return mapToResponse(investment);
    }

    @Transactional
    @CacheEvict(value = {"investments", "dashboard"}, key = "#userId")
    public void deleteInvestment(UUID id, UUID userId) {
        Investment investment = findInvestmentByIdAndUser(id, userId);
        investmentRepository.delete(investment);
    }

    @Transactional(readOnly = true)
    public InvestmentSummaryResponse getSummary(UUID userId) {
        BigDecimal totalInvested = investmentRepository.getTotalInvested(userId);
        if (totalInvested == null) totalInvested = BigDecimal.ZERO;

        BigDecimal currentValue = investmentRepository.getTotalInvestmentValue(userId);
        if (currentValue == null) currentValue = BigDecimal.ZERO;

        BigDecimal totalDividends = investmentRepository.getTotalDividends(userId);
        if (totalDividends == null) totalDividends = BigDecimal.ZERO;

        BigDecimal totalProfitLoss = currentValue.subtract(totalInvested);
        BigDecimal totalProfitLossPercentage = BigDecimal.ZERO;
        if (totalInvested.compareTo(BigDecimal.ZERO) > 0) {
            totalProfitLossPercentage = totalProfitLoss.divide(totalInvested, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100));
        }

        List<Object[]> distRows = investmentRepository.getPortfolioDistribution(userId);
        List<InvestmentSummaryResponse.AllocationItem> distribution = new ArrayList<>();

        for (Object[] row : distRows) {
            Investment.InvestmentType type = (Investment.InvestmentType) row[0];
            BigDecimal val = (BigDecimal) row[1];
            double pct = currentValue.compareTo(BigDecimal.ZERO) == 0 ? 0 :
                    val.divide(currentValue, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)).doubleValue();

            distribution.add(InvestmentSummaryResponse.AllocationItem.builder()
                    .type(type.name())
                    .amount(val)
                    .percentage(pct)
                    .build());
        }

        return InvestmentSummaryResponse.builder()
                .totalInvested(totalInvested)
                .currentValue(currentValue)
                .totalProfitLoss(totalProfitLoss)
                .totalProfitLossPercentage(totalProfitLossPercentage)
                .totalDividends(totalDividends)
                .distribution(distribution)
                .build();
    }

    private Investment findInvestmentByIdAndUser(UUID id, UUID userId) {
        Investment investment = investmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Investment not found"));

        if (!investment.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Investment not found");
        }

        return investment;
    }

    private InvestmentResponse mapToResponse(Investment i) {
        return InvestmentResponse.builder()
                .id(i.getId())
                .name(i.getName())
                .type(i.getType())
                .ticker(i.getTicker())
                .quantity(i.getQuantity())
                .averagePrice(i.getAveragePrice())
                .currentPrice(i.getCurrentPrice())
                .totalInvested(i.getTotalInvested())
                .currentValue(i.getCurrentValue())
                .profitLoss(i.getProfitLoss())
                .profitLossPercentage(i.getProfitLossPercentage())
                .dividendsReceived(i.getDividendsReceived())
                .purchaseDate(i.getPurchaseDate())
                .account(i.getAccount() != null ? InvestmentResponse.AccountInfo.builder()
                        .id(i.getAccount().getId())
                        .name(i.getAccount().getName())
                        .build() : null)
                .createdAt(i.getCreatedAt())
                .updatedAt(i.getUpdatedAt())
                .build();
    }
}
