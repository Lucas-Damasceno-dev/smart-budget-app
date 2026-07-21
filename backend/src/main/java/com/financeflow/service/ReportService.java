package com.financeflow.service;

import com.financeflow.dto.report.ReportResponse;
import com.financeflow.entity.Category;
import com.financeflow.entity.Transaction;
import com.financeflow.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final TransactionRepository transactionRepository;

    public ReportResponse generateReport(UUID userId, LocalDate startDate, LocalDate endDate) {
        List<Transaction> transactions = transactionRepository.findByUserIdAndDateBetween(userId, startDate, endDate);

        // Summary
        BigDecimal totalIncome = transactions.stream()
                .filter(t -> t.getType() == Category.TransactionType.INCOME)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalExpenses = transactions.stream()
                .filter(t -> t.getType() == Category.TransactionType.EXPENSE)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal netBalance = totalIncome.subtract(totalExpenses);
        int transactionCount = transactions.size();
        BigDecimal avgAmount = transactionCount > 0 
                ? totalExpenses.add(totalIncome).divide(BigDecimal.valueOf(transactionCount), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        ReportResponse.Summary summary = ReportResponse.Summary.builder()
                .totalIncome(totalIncome)
                .totalExpenses(totalExpenses)
                .netBalance(netBalance)
                .transactionCount(transactionCount)
                .averageTransactionAmount(avgAmount)
                .build();

        // Category breakdown
        Map<UUID, List<Transaction>> byCategory = transactions.stream()
                .collect(Collectors.groupingBy(t -> t.getCategory().getId()));

        List<ReportResponse.CategoryBreakdown> categoryBreakdown = byCategory.entrySet().stream()
                .map(entry -> {
                    List<Transaction> catTransactions = entry.getValue();
                    Transaction sample = catTransactions.get(0);
                    BigDecimal amount = catTransactions.stream()
                            .map(Transaction::getAmount)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);

                    BigDecimal total = sample.getType() == Category.TransactionType.EXPENSE ? totalExpenses : totalIncome;
                    double percentage = total.compareTo(BigDecimal.ZERO) == 0 ? 0 :
                            amount.divide(total, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)).doubleValue();

                    return ReportResponse.CategoryBreakdown.builder()
                            .categoryId(entry.getKey().toString())
                            .categoryName(sample.getCategory().getName())
                            .type(sample.getType().name())
                            .amount(amount)
                            .percentage(percentage)
                            .count(catTransactions.size())
                            .color(sample.getCategory().getColor())
                            .build();
                })
                .sorted((a, b) -> b.getAmount().compareTo(a.getAmount()))
                .collect(Collectors.toList());

        // Monthly trends
        Map<String, List<Transaction>> byMonth = transactions.stream()
                .collect(Collectors.groupingBy(t -> t.getDate().format(DateTimeFormatter.ofPattern("yyyy-MM"))));

        List<ReportResponse.MonthlyTrend> monthlyTrends = byMonth.entrySet().stream()
                .map(entry -> {
                    BigDecimal income = entry.getValue().stream()
                            .filter(t -> t.getType() == Category.TransactionType.INCOME)
                            .map(Transaction::getAmount)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);

                    BigDecimal expenses = entry.getValue().stream()
                            .filter(t -> t.getType() == Category.TransactionType.EXPENSE)
                            .map(Transaction::getAmount)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);

                    return ReportResponse.MonthlyTrend.builder()
                            .month(entry.getKey())
                            .income(income)
                            .expenses(expenses)
                            .balance(income.subtract(expenses))
                            .build();
                })
                .sorted(Comparator.comparing(ReportResponse.MonthlyTrend::getMonth))
                .collect(Collectors.toList());

        // Daily cashflow
        Map<LocalDate, List<Transaction>> byDate = transactions.stream()
                .collect(Collectors.groupingBy(Transaction::getDate));

        BigDecimal cumulative = BigDecimal.ZERO;
        List<ReportResponse.DailyFlow> dailyCashflow = new ArrayList<>();

        for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
            List<Transaction> dayTransactions = byDate.getOrDefault(date, Collections.emptyList());

            BigDecimal dayIncome = dayTransactions.stream()
                    .filter(t -> t.getType() == Category.TransactionType.INCOME)
                    .map(Transaction::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal dayExpenses = dayTransactions.stream()
                    .filter(t -> t.getType() == Category.TransactionType.EXPENSE)
                    .map(Transaction::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            cumulative = cumulative.add(dayIncome).subtract(dayExpenses);

            dailyCashflow.add(ReportResponse.DailyFlow.builder()
                    .date(date.format(DateTimeFormatter.ISO_DATE))
                    .income(dayIncome)
                    .expenses(dayExpenses)
                    .cumulativeBalance(cumulative)
                    .build());
        }

        // Comparison with previous period
        long periodDays = java.time.temporal.ChronoUnit.DAYS.between(startDate, endDate) + 1;
        LocalDate prevStart = startDate.minusDays(periodDays);
        LocalDate prevEnd = startDate.minusDays(1);

        List<Transaction> prevTransactions = transactionRepository.findByUserIdAndDateBetween(userId, prevStart, prevEnd);

        BigDecimal prevExpenses = prevTransactions.stream()
                .filter(t -> t.getType() == Category.TransactionType.EXPENSE)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        double expenseChange = prevExpenses.compareTo(BigDecimal.ZERO) == 0 ? 0 :
                totalExpenses.subtract(prevExpenses)
                        .divide(prevExpenses, 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100)).doubleValue();

        ReportResponse.ComparisonData comparison = ReportResponse.ComparisonData.builder()
                .currentPeriodExpenses(totalExpenses)
                .previousPeriodExpenses(prevExpenses)
                .changePercentage(expenseChange)
                .build();

        // Pareto analysis (80/20 rule)
        List<ReportResponse.CategoryBreakdown> expenseCategories = categoryBreakdown.stream()
                .filter(c -> "EXPENSE".equals(c.getType()))
                .sorted((a, b) -> b.getAmount().compareTo(a.getAmount()))
                .collect(Collectors.toList());

        List<ReportResponse.ParetoItem> paretoItems = new ArrayList<>();
        BigDecimal cumPercent = BigDecimal.ZERO;

        for (ReportResponse.CategoryBreakdown cat : expenseCategories) {
            cumPercent = cumPercent.add(BigDecimal.valueOf(cat.getPercentage()));
            paretoItems.add(ReportResponse.ParetoItem.builder()
                    .categoryName(cat.getCategoryName())
                    .amount(cat.getAmount())
                    .cumulativePercentage(cumPercent.doubleValue())
                    .build());
        }

        // Calculate top 20% categories total
        int top20Count = Math.max(1, (int) Math.ceil(expenseCategories.size() * 0.2));
        BigDecimal top20Total = expenseCategories.stream()
                .limit(top20Count)
                .map(ReportResponse.CategoryBreakdown::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        double top20OfTotal = totalExpenses.compareTo(BigDecimal.ZERO) == 0 ? 0 :
                top20Total.divide(totalExpenses, 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100)).doubleValue();

        ReportResponse.ParetoAnalysis paretoAnalysis = ReportResponse.ParetoAnalysis.builder()
                .items(paretoItems)
                .top20PercentTotal(top20Total)
                .top20PercentOfTotal(top20OfTotal)
                .build();

        return ReportResponse.builder()
                .startDate(startDate)
                .endDate(endDate)
                .summary(summary)
                .categoryBreakdown(categoryBreakdown)
                .monthlyTrends(monthlyTrends)
                .dailyCashflow(dailyCashflow)
                .comparison(comparison)
                .paretoAnalysis(paretoAnalysis)
                .build();
    }
}
