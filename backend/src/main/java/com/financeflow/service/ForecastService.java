package com.financeflow.service;

import com.financeflow.dto.analytics.ForecastResponse;
import com.financeflow.entity.*;
import com.financeflow.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ForecastService {

    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final SubscriptionRepository subscriptionRepository;

    public ForecastResponse generateForecast(UUID userId, int projectionDays) {
        if (projectionDays <= 0) projectionDays = 30;
        if (projectionDays > 365) projectionDays = 365;

        LocalDate today = LocalDate.now();
        LocalDate threeMonthsAgo = today.minusMonths(3);

        // Current balance
        BigDecimal currentBalance = accountRepository.getTotalBalance(userId);
        if (currentBalance == null) currentBalance = BigDecimal.ZERO;

        // Average monthly income (last 3 months)
        BigDecimal monthlyIncomeSum = transactionRepository.sumByUserIdAndTypeAndDateBetween(
                userId, Category.TransactionType.INCOME, threeMonthsAgo, today);
        BigDecimal avgMonthlyIncome = calculateAverageMonthly(monthlyIncomeSum, 3);

        // Average monthly expenses (last 3 months)
        BigDecimal monthlyExpenseSum = transactionRepository.sumByUserIdAndTypeAndDateBetween(
                userId, Category.TransactionType.EXPENSE, threeMonthsAgo, today);
        BigDecimal avgMonthlyExpenses = calculateAverageMonthly(monthlyExpenseSum, 3);

        // Get recurring transactions
        List<Transaction> recurringTxs = transactionRepository.findByUserIdAndIsRecurringTrue(userId);

        // Get active subscriptions
        List<Subscription> activeSubs = subscriptionRepository.findByUserIdAndStatus(
                userId, Subscription.SubscriptionStatus.ACTIVE);

        // Generate daily projection
        List<ForecastResponse.ProjectedDay> dailyProjection = new ArrayList<>();
        BigDecimal runningBalance = currentBalance;

        for (int i = 0; i < projectionDays; i++) {
            LocalDate date = today.plusDays(i);
            BigDecimal dayIncome = BigDecimal.ZERO;
            BigDecimal dayExpenses = BigDecimal.ZERO;

            // Add recurring transactions that fall on this date
            for (Transaction rt : recurringTxs) {
                if (isRecurringOnDate(rt, date)) {
                    if (rt.getType() == Category.TransactionType.INCOME) {
                        dayIncome = dayIncome.add(rt.getAmount());
                    } else {
                        dayExpenses = dayExpenses.add(rt.getAmount());
                    }
                }
            }

            // Add subscriptions that fall on this date
            for (Subscription sub : activeSubs) {
                if (Boolean.TRUE.equals(sub.getAutoCreateTransaction())
                        && sub.getNextBillingDate() != null
                        && sub.getNextBillingDate().equals(date)) {
                    dayExpenses = dayExpenses.add(sub.getAmount());
                }
            }

            runningBalance = runningBalance.add(dayIncome).subtract(dayExpenses);

            dailyProjection.add(ForecastResponse.ProjectedDay.builder()
                    .date(date)
                    .income(dayIncome)
                    .expenses(dayExpenses)
                    .balance(runningBalance)
                    .build());
        }

        // Generate monthly projection (next 3 months)
        List<ForecastResponse.ProjectedMonth> monthlyProjection = new ArrayList<>();
        for (int m = 0; m < 3; m++) {
            YearMonth ym = YearMonth.from(today.plusMonths(m));
            BigDecimal monthIncome = avgMonthlyIncome != null ? avgMonthlyIncome : BigDecimal.ZERO;
            BigDecimal monthExpenses = avgMonthlyExpenses != null ? avgMonthlyExpenses : BigDecimal.ZERO;

            monthlyProjection.add(ForecastResponse.ProjectedMonth.builder()
                    .month(ym.toString())
                    .projectedIncome(monthIncome)
                    .projectedExpenses(monthExpenses)
                    .projectedBalance(monthIncome.subtract(monthExpenses))
                    .build());
        }

        // Safe to spend: currentBalance - (projected expenses for this month so far + next 15 days buffer) * 80%
        BigDecimal safeBuffer = avgMonthlyExpenses != null
                ? avgMonthlyExpenses.multiply(BigDecimal.valueOf(0.5))
                : BigDecimal.ZERO;
        BigDecimal safeToSpend = currentBalance.subtract(safeBuffer);
        if (safeToSpend.compareTo(BigDecimal.ZERO) < 0) safeToSpend = BigDecimal.ZERO;

        // Projected next month
        BigDecimal projectedIncome = avgMonthlyIncome != null ? avgMonthlyIncome : BigDecimal.ZERO;
        BigDecimal projectedExpenses = avgMonthlyExpenses != null ? avgMonthlyExpenses : BigDecimal.ZERO;

        return ForecastResponse.builder()
                .currentBalance(currentBalance)
                .averageMonthlyIncome(avgMonthlyIncome)
                .averageMonthlyExpenses(avgMonthlyExpenses)
                .projectedIncomeNextMonth(projectedIncome)
                .projectedExpensesNextMonth(projectedExpenses)
                .projectedBalanceNextMonth(currentBalance.add(projectedIncome).subtract(projectedExpenses))
                .safeToSpend(safeToSpend)
                .dailyProjection(dailyProjection)
                .monthlyProjection(monthlyProjection)
                .build();
    }

    private BigDecimal calculateAverageMonthly(BigDecimal total, int months) {
        if (total == null || total.compareTo(BigDecimal.ZERO) == 0) return BigDecimal.ZERO;
        return total.divide(BigDecimal.valueOf(months), 2, RoundingMode.HALF_UP);
    }

    private boolean isRecurringOnDate(Transaction tx, LocalDate date) {
        if (tx.getRecurrenceEndDate() != null && date.isAfter(tx.getRecurrenceEndDate())) {
            return false;
        }

        LocalDate txDate = tx.getDate();
        if (txDate == null) return false;

        if (date.isBefore(txDate)) return false;

        String freq = tx.getRecurrenceFrequency() != null ? tx.getRecurrenceFrequency().name() : null;
        if (freq == null) return false;

        long daysBetween = ChronoUnit.DAYS.between(txDate, date);

        return switch (freq.toUpperCase()) {
            case "DAILY" -> true;
            case "WEEKLY" -> daysBetween % 7 == 0;
            case "BIWEEKLY" -> daysBetween % 14 == 0;
            case "MONTHLY" -> txDate.getDayOfMonth() == date.getDayOfMonth();
            case "QUARTERLY" -> txDate.getDayOfMonth() == date.getDayOfMonth()
                    && (date.getMonthValue() - txDate.getMonthValue()) % 3 == 0;
            case "YEARLY" -> txDate.getDayOfMonth() == date.getDayOfMonth()
                    && txDate.getMonth() == date.getMonth();
            default -> false;
        };
    }
}
