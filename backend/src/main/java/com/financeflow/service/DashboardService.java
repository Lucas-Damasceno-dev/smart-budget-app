package com.financeflow.service;

import com.financeflow.dto.dashboard.DashboardResponse;
import com.financeflow.entity.Account;
import com.financeflow.entity.Budget;
import com.financeflow.entity.Category;
import com.financeflow.entity.Transaction;
import com.financeflow.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final BudgetRepository budgetRepository;
    private final InvestmentRepository investmentRepository;

    @Cacheable(value = "dashboard", key = "#userId")
    public DashboardResponse getDashboard(UUID userId) {
        LocalDate today = LocalDate.now();
        LocalDate startOfMonth = today.withDayOfMonth(1);
        LocalDate endOfMonth = today.withDayOfMonth(today.lengthOfMonth());
        LocalDate startOfLastMonth = startOfMonth.minusMonths(1);
        LocalDate endOfLastMonth = startOfMonth.minusDays(1);

        // Total balance
        BigDecimal totalBalance = accountRepository.getTotalBalance(userId);
        if (totalBalance == null) totalBalance = BigDecimal.ZERO;

        // Monthly income and expenses
        BigDecimal monthlyIncome = transactionRepository.sumByUserIdAndTypeAndDateBetween(
                userId, Category.TransactionType.INCOME, startOfMonth, endOfMonth);
        BigDecimal monthlyExpenses = transactionRepository.sumByUserIdAndTypeAndDateBetween(
                userId, Category.TransactionType.EXPENSE, startOfMonth, endOfMonth);

        if (monthlyIncome == null) monthlyIncome = BigDecimal.ZERO;
        if (monthlyExpenses == null) monthlyExpenses = BigDecimal.ZERO;

        BigDecimal monthlyBalance = monthlyIncome.subtract(monthlyExpenses);

        // Investment value for net worth
        BigDecimal investmentValue = investmentRepository.getTotalInvestmentValue(userId);
        if (investmentValue == null) investmentValue = BigDecimal.ZERO;

        BigDecimal netWorth = totalBalance.add(investmentValue);

        // Projected cashflow (30 days based on current month average)
        int daysElapsed = today.getDayOfMonth();
        BigDecimal dailyAverage = monthlyBalance.divide(BigDecimal.valueOf(daysElapsed), 2, RoundingMode.HALF_UP);
        BigDecimal projectedCashflow = dailyAverage.multiply(BigDecimal.valueOf(30));

        // Accounts summary
        List<Account> accounts = accountRepository.findByUserIdAndActiveTrue(userId);
        List<DashboardResponse.AccountSummary> accountSummaries = accounts.stream()
                .map(a -> DashboardResponse.AccountSummary.builder()
                        .id(a.getId().toString())
                        .name(a.getName())
                        .type(a.getType().name())
                        .balance(a.getCurrentBalance())
                        .color(a.getColor())
                        .build())
                .collect(Collectors.toList());

        // Top expense categories
        List<Object[]> topExpenses = transactionRepository.getTopCategoriesByUserAndType(
                userId, Category.TransactionType.EXPENSE, startOfMonth, endOfMonth, PageRequest.of(0, 5));

        BigDecimal totalExpenseAmount = monthlyExpenses.compareTo(BigDecimal.ZERO) == 0 
                ? BigDecimal.ONE : monthlyExpenses;

        List<DashboardResponse.CategorySummary> topExpenseCategories = topExpenses.stream()
                .map(row -> DashboardResponse.CategorySummary.builder()
                        .id(row[0].toString())
                        .name((String) row[1])
                        .amount((BigDecimal) row[2])
                        .percentage(((BigDecimal) row[2]).divide(totalExpenseAmount, 4, RoundingMode.HALF_UP)
                                .multiply(BigDecimal.valueOf(100)).doubleValue())
                        .build())
                .collect(Collectors.toList());

        // Top income categories
        List<Object[]> topIncomes = transactionRepository.getTopCategoriesByUserAndType(
                userId, Category.TransactionType.INCOME, startOfMonth, endOfMonth, PageRequest.of(0, 5));

        BigDecimal totalIncomeAmount = monthlyIncome.compareTo(BigDecimal.ZERO) == 0 
                ? BigDecimal.ONE : monthlyIncome;

        List<DashboardResponse.CategorySummary> topIncomeCategories = topIncomes.stream()
                .map(row -> DashboardResponse.CategorySummary.builder()
                        .id(row[0].toString())
                        .name((String) row[1])
                        .amount((BigDecimal) row[2])
                        .percentage(((BigDecimal) row[2]).divide(totalIncomeAmount, 4, RoundingMode.HALF_UP)
                                .multiply(BigDecimal.valueOf(100)).doubleValue())
                        .build())
                .collect(Collectors.toList());

        // Balance history (last 30 days)
        List<DashboardResponse.DailyBalance> balanceHistory = calculateBalanceHistory(userId, today.minusDays(30), today);

        // Budget progress
        List<Budget> budgets = budgetRepository.findByUserIdAndMonthAndYearWithCategory(
                userId, today.getMonthValue(), today.getYear());

        List<DashboardResponse.BudgetProgress> budgetProgress = budgets.stream()
                .map(b -> DashboardResponse.BudgetProgress.builder()
                        .categoryId(b.getCategory().getId().toString())
                        .categoryName(b.getCategory().getName())
                        .limit(b.getLimitAmount())
                        .spent(b.getSpentAmount())
                        .percentage(b.getPercentageUsed())
                        .color(b.getCategory().getColor())
                        .build())
                .collect(Collectors.toList());

        // Recent activity
        long transactionsThisMonth = transactionRepository.countByUserIdAndDateBetween(userId, startOfMonth, endOfMonth);
        long transactionsLastMonth = transactionRepository.countByUserIdAndDateBetween(userId, startOfLastMonth, endOfLastMonth);

        double changePercentage = 0;
        if (transactionsLastMonth > 0) {
            changePercentage = ((double) (transactionsThisMonth - transactionsLastMonth) / transactionsLastMonth) * 100;
        }

        DashboardResponse.RecentActivity recentActivity = DashboardResponse.RecentActivity.builder()
                .transactionsThisMonth((int) transactionsThisMonth)
                .transactionsLastMonth((int) transactionsLastMonth)
                .changePercentage(changePercentage)
                .build();

        return DashboardResponse.builder()
                .totalBalance(totalBalance)
                .monthlyIncome(monthlyIncome)
                .monthlyExpenses(monthlyExpenses)
                .monthlyBalance(monthlyBalance)
                .netWorth(netWorth)
                .projectedCashflow(projectedCashflow)
                .accounts(accountSummaries)
                .topExpenseCategories(topExpenseCategories)
                .topIncomeCategories(topIncomeCategories)
                .balanceHistory(balanceHistory)
                .budgetProgress(budgetProgress)
                .recentActivity(recentActivity)
                .build();
    }

    private List<DashboardResponse.DailyBalance> calculateBalanceHistory(UUID userId, LocalDate startDate, LocalDate endDate) {
        List<Transaction> transactions = transactionRepository.findByUserIdAndDateBetween(userId, startDate, endDate);

        Map<LocalDate, BigDecimal> incomeByDate = new HashMap<>();
        Map<LocalDate, BigDecimal> expenseByDate = new HashMap<>();

        for (Transaction t : transactions) {
            if (t.getType() == Category.TransactionType.INCOME) {
                incomeByDate.merge(t.getDate(), t.getAmount(), BigDecimal::add);
            } else if (t.getType() == Category.TransactionType.EXPENSE) {
                expenseByDate.merge(t.getDate(), t.getAmount(), BigDecimal::add);
            }
        }

        List<DashboardResponse.DailyBalance> history = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ISO_DATE;
        BigDecimal runningBalance = BigDecimal.ZERO;

        for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
            BigDecimal income = incomeByDate.getOrDefault(date, BigDecimal.ZERO);
            BigDecimal expense = expenseByDate.getOrDefault(date, BigDecimal.ZERO);
            runningBalance = runningBalance.add(income).subtract(expense);

            history.add(DashboardResponse.DailyBalance.builder()
                    .date(date.format(formatter))
                    .balance(runningBalance)
                    .income(income)
                    .expense(expense)
                    .build());
        }

        return history;
    }
}
