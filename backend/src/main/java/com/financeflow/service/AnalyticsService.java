package com.financeflow.service;

import com.financeflow.dto.analytics.CategoryDrilldownResponse;
import com.financeflow.dto.analytics.PeriodComparisonResponse;
import com.financeflow.entity.Category;
import com.financeflow.entity.Transaction;
import com.financeflow.repository.CategoryRepository;
import com.financeflow.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;

import java.util.*;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final TransactionRepository transactionRepository;
    private final CategoryRepository categoryRepository;

    public PeriodComparisonResponse getPeriodComparison(UUID userId, Integer month, Integer year) {
        LocalDate now = LocalDate.now();
        int targetMonth = month != null ? month : now.getMonthValue();
        int targetYear = year != null ? year : now.getYear();

        YearMonth currentYm = YearMonth.of(targetYear, targetMonth);
        YearMonth prevYm = currentYm.minusMonths(1);
        YearMonth prevYearYm = currentYm.minusYears(1);

        PeriodComparisonResponse.PeriodMetrics current = buildMetrics(userId, currentYm, "Mês Atual (" + currentYm.toString() + ")");
        PeriodComparisonResponse.PeriodMetrics previous = buildMetrics(userId, prevYm, "Mês Anterior (" + prevYm.toString() + ")");
        PeriodComparisonResponse.PeriodMetrics sameLastYear = buildMetrics(userId, prevYearYm, "Mesmo Mês Ano Passado (" + prevYearYm.toString() + ")");

        // Category comparisons (current vs previous)
        LocalDate curStart = currentYm.atDay(1);
        LocalDate curEnd = currentYm.atEndOfMonth();
        LocalDate prevStart = prevYm.atDay(1);
        LocalDate prevEnd = prevYm.atEndOfMonth();

        List<Object[]> curCategories = transactionRepository.getTopCategoriesByUserAndType(
                userId, Category.TransactionType.EXPENSE, curStart, curEnd, PageRequest.of(0, 50));
        List<Object[]> prevCategories = transactionRepository.getTopCategoriesByUserAndType(
                userId, Category.TransactionType.EXPENSE, prevStart, prevEnd, PageRequest.of(0, 50));

        Map<String, BigDecimal> curMap = new HashMap<>();
        for (Object[] r : curCategories) {
            curMap.put((String) r[1], (BigDecimal) r[2]);
        }

        Map<String, BigDecimal> prevMap = new HashMap<>();
        for (Object[] r : prevCategories) {
            prevMap.put((String) r[1], (BigDecimal) r[2]);
        }

        Set<String> allCats = new HashSet<>();
        allCats.addAll(curMap.keySet());
        allCats.addAll(prevMap.keySet());

        List<PeriodComparisonResponse.CategoryComparison> categoryChanges = new ArrayList<>();
        for (String catName : allCats) {
            BigDecimal curAmt = curMap.getOrDefault(catName, BigDecimal.ZERO);
            BigDecimal prevAmt = prevMap.getOrDefault(catName, BigDecimal.ZERO);
            BigDecimal diff = curAmt.subtract(prevAmt);

            double pct = 0.0;
            if (prevAmt.compareTo(BigDecimal.ZERO) > 0) {
                pct = diff.divide(prevAmt, 4, RoundingMode.HALF_UP).doubleValue() * 100.0;
            } else if (curAmt.compareTo(BigDecimal.ZERO) > 0) {
                pct = 100.0;
            }

            String status = diff.compareTo(BigDecimal.ZERO) > 0 ? "INCREASED"
                    : (diff.compareTo(BigDecimal.ZERO) < 0 ? "DECREASED" : "STABLE");

            categoryChanges.add(PeriodComparisonResponse.CategoryComparison.builder()
                    .categoryName(catName)
                    .categoryColor("#3b82f6")
                    .currentAmount(curAmt)
                    .previousAmount(prevAmt)
                    .changeAmount(diff)
                    .changePercentage(Math.round(pct * 10.0) / 10.0)
                    .status(status)
                    .build());
        }

        categoryChanges.sort((a, b) -> b.getCurrentAmount().compareTo(a.getCurrentAmount()));

        return PeriodComparisonResponse.builder()
                .currentPeriod(current)
                .previousPeriod(previous)
                .samePeriodLastYear(sameLastYear)
                .topCategoryChanges(categoryChanges)
                .build();
    }

    public CategoryDrilldownResponse getCategoryDrilldown(UUID userId, UUID categoryId, LocalDate startDate, LocalDate endDate) {
        if (startDate == null) startDate = LocalDate.now().withDayOfMonth(1);
        if (endDate == null) endDate = LocalDate.now().withDayOfMonth(startDate.lengthOfMonth());

        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));

        BigDecimal categoryTotal = transactionRepository.sumByUserIdAndCategoryAndDateBetween(
                userId, categoryId, startDate, endDate);
        if (categoryTotal == null) categoryTotal = BigDecimal.ZERO;

        BigDecimal totalExpenses = transactionRepository.sumByUserIdAndTypeAndDateBetween(
                userId, Category.TransactionType.EXPENSE, startDate, endDate);
        if (totalExpenses == null || totalExpenses.compareTo(BigDecimal.ZERO) == 0) totalExpenses = BigDecimal.ONE;

        double pctOfTotal = categoryTotal.divide(totalExpenses, 4, RoundingMode.HALF_UP).doubleValue() * 100.0;

        List<Category> subcats = categoryRepository.findByParentCategoryId(categoryId);
        List<CategoryDrilldownResponse.SubcategorySummary> subcatSummaries = new ArrayList<>();

        for (Category sub : subcats) {
            BigDecimal subTotal = transactionRepository.sumByUserIdAndCategoryAndDateBetween(
                    userId, sub.getId(), startDate, endDate);
            if (subTotal == null) subTotal = BigDecimal.ZERO;

            double subPct = categoryTotal.compareTo(BigDecimal.ZERO) > 0
                    ? subTotal.divide(categoryTotal, 4, RoundingMode.HALF_UP).doubleValue() * 100.0
                    : 0.0;

            subcatSummaries.add(CategoryDrilldownResponse.SubcategorySummary.builder()
                    .categoryId(sub.getId())
                    .name(sub.getName())
                    .totalAmount(subTotal)
                    .transactionCount(0)
                    .percentageOfParent(Math.round(subPct * 10.0) / 10.0)
                    .build());
        }

        List<Transaction> recent = transactionRepository.findByUserIdAndCategoryIdAndDateBetween(
                userId, categoryId, startDate, endDate);

        List<CategoryDrilldownResponse.RecentCategoryTransaction> recentTxDtos = recent.stream()
                .limit(10)
                .map(t -> CategoryDrilldownResponse.RecentCategoryTransaction.builder()
                        .id(t.getId())
                        .description(t.getDescription())
                        .amount(t.getAmount())
                        .date(t.getDate())
                        .accountName(t.getAccount() != null ? t.getAccount().getName() : "")
                        .build())
                .toList();

        return CategoryDrilldownResponse.builder()
                .categoryId(category.getId())
                .categoryName(category.getName())
                .categoryColor(category.getColor())
                .categoryIcon(category.getIcon())
                .totalAmount(categoryTotal)
                .transactionCount(recent.size())
                .percentageOfTotalExpenses(Math.round(pctOfTotal * 10.0) / 10.0)
                .subcategories(subcatSummaries)
                .recentTransactions(recentTxDtos)
                .build();
    }

    private PeriodComparisonResponse.PeriodMetrics buildMetrics(UUID userId, YearMonth ym, String label) {
        LocalDate start = ym.atDay(1);
        LocalDate end = ym.atEndOfMonth();

        BigDecimal income = transactionRepository.sumByUserIdAndTypeAndDateBetween(
                userId, Category.TransactionType.INCOME, start, end);
        BigDecimal expense = transactionRepository.sumByUserIdAndTypeAndDateBetween(
                userId, Category.TransactionType.EXPENSE, start, end);

        if (income == null) income = BigDecimal.ZERO;
        if (expense == null) expense = BigDecimal.ZERO;

        BigDecimal net = income.subtract(expense);
        double savingsRate = income.compareTo(BigDecimal.ZERO) > 0
                ? net.divide(income, 4, RoundingMode.HALF_UP).doubleValue() * 100.0
                : 0.0;

        return PeriodComparisonResponse.PeriodMetrics.builder()
                .label(label)
                .totalIncome(income)
                .totalExpenses(expense)
                .netSavings(net)
                .savingsRate(Math.round(savingsRate * 10.0) / 10.0)
                .build();
    }
}
