package com.financeflow.service;

import com.financeflow.dto.analytics.InsightResponse;
import com.financeflow.entity.*;
import com.financeflow.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
@RequiredArgsConstructor
public class InsightService {

    private final TransactionRepository transactionRepository;
    private final BudgetRepository budgetRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final CategoryRepository categoryRepository;
    private final AccountRepository accountRepository;

    public List<InsightResponse> generateInsights(UUID userId) {
        List<InsightResponse> insights = new ArrayList<>();
        LocalDate today = LocalDate.now();
        LocalDate startOfMonth = today.withDayOfMonth(1);
        LocalDate startOfLastMonth = startOfMonth.minusMonths(1);
        LocalDate endOfLastMonth = startOfMonth.minusDays(1);

        // 1. Spending trend by category (this month vs last month)
        insights.addAll(generateSpendingTrendInsights(userId, startOfMonth, startOfLastMonth, endOfLastMonth));

        // 2. Budget alerts (near/exceeded)
        insights.addAll(generateBudgetAlerts(userId, today));

        // 3. Upcoming subscription renewals (next 7 days)
        insights.addAll(generateSubscriptionRenewalAlerts(userId, today));

        // 4. Income vs expense ratio
        insights.addAll(generateIncomeExpenseRatioInsight(userId, startOfMonth, today));

        return insights;
    }

    private List<InsightResponse> generateSpendingTrendInsights(
            UUID userId, LocalDate startOfMonth, LocalDate startOfLastMonth, LocalDate endOfLastMonth) {
        List<InsightResponse> insights = new ArrayList<>();

        List<Object[]> thisMonthExpenses = transactionRepository.getTopCategoriesByUserAndType(
                userId, Category.TransactionType.EXPENSE, startOfMonth,
                LocalDate.now(), PageRequest.of(0, 50));

        List<Object[]> lastMonthExpenses = transactionRepository.getTopCategoriesByUserAndType(
                userId, Category.TransactionType.EXPENSE, startOfLastMonth, endOfLastMonth,
                PageRequest.of(0, 50));

        Map<String, BigDecimal> thisMonthMap = new HashMap<>();
        for (Object[] row : thisMonthExpenses) {
            thisMonthMap.put((String) row[1], (BigDecimal) row[2]);
        }

        Map<String, BigDecimal> lastMonthMap = new HashMap<>();
        for (Object[] row : lastMonthExpenses) {
            lastMonthMap.put((String) row[1], (BigDecimal) row[2]);
        }

        for (Map.Entry<String, BigDecimal> entry : thisMonthMap.entrySet()) {
            String catName = entry.getKey();
            BigDecimal thisAmount = entry.getValue();
            BigDecimal lastAmount = lastMonthMap.getOrDefault(catName, BigDecimal.ZERO);

            if (lastAmount.compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal change = thisAmount.subtract(lastAmount)
                        .divide(lastAmount, 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100));

                if (change.abs().compareTo(BigDecimal.valueOf(30)) >= 0) {
                    String direction = change.compareTo(BigDecimal.ZERO) > 0 ? "aumentou" : "diminuiu";
                    String severity = change.abs().compareTo(BigDecimal.valueOf(50)) >= 0 ? "WARNING" : "INFO";

                    insights.add(InsightResponse.builder()
                            .id(UUID.randomUUID().toString())
                            .type("SPENDING_TREND")
                            .severity(severity)
                            .title("Gasto em " + catName + " " + direction)
                            .message(String.format(
                                    "Seus gastos com %s %s %.0f%% comparado ao mês passado (R$ %s → R$ %s)",
                                    catName.toLowerCase(), direction, change.abs(),
                                    formatCurrency(lastAmount), formatCurrency(thisAmount)))
                            .actionLabel("Ver transações")
                            .actionRoute("/transactions?category=" + catName)
                            .createdAt(LocalDateTime.now())
                            .build());
                }
            }
        }

        return insights.size() > 3 ? insights.subList(0, 3) : insights;
    }

    private List<InsightResponse> generateBudgetAlerts(UUID userId, LocalDate today) {
        List<InsightResponse> insights = new ArrayList<>();
        List<Budget> budgets = budgetRepository.findByUserIdAndMonthAndYearWithCategory(
                userId, today.getMonthValue(), today.getYear());

        for (Budget budget : budgets) {
            double pct = budget.getPercentageUsed();

            if (pct >= 100) {
                insights.add(InsightResponse.builder()
                        .id(UUID.randomUUID().toString())
                        .type("BUDGET_ALERT")
                        .severity("DANGER")
                        .title("Orçamento de " + budget.getCategory().getName() + " excedido")
                        .message(String.format("Você já gastou %.0f%% do orçamento de %s (R$ %s de R$ %s)",
                                pct, budget.getCategory().getName(),
                                formatCurrency(budget.getSpentAmount()),
                                formatCurrency(budget.getLimitAmount())))
                        .actionLabel("Ver orçamento")
                        .actionRoute("/settings")
                        .createdAt(LocalDateTime.now())
                        .build());
            } else if (pct >= 80) {
                insights.add(InsightResponse.builder()
                        .id(UUID.randomUUID().toString())
                        .type("BUDGET_ALERT")
                        .severity("WARNING")
                        .title("Orçamento de " + budget.getCategory().getName() + " próximo do limite")
                        .message(String.format("Você já usou %.0f%% do orçamento de %s (R$ %s de R$ %s)",
                                pct, budget.getCategory().getName(),
                                formatCurrency(budget.getSpentAmount()),
                                formatCurrency(budget.getLimitAmount())))
                        .actionLabel("Ver orçamento")
                        .actionRoute("/settings")
                        .createdAt(LocalDateTime.now())
                        .build());
            }
        }

        return insights;
    }

    private List<InsightResponse> generateSubscriptionRenewalAlerts(UUID userId, LocalDate today) {
        List<InsightResponse> insights = new ArrayList<>();
        LocalDate weekFromNow = today.plusDays(7);

        List<Subscription> upcoming = subscriptionRepository
                .findByStatusAndNextBillingDateLessThanOrEqual(
                        Subscription.SubscriptionStatus.ACTIVE, weekFromNow);

        for (Subscription sub : upcoming) {
            if (sub.getNextBillingDate() != null && !sub.getNextBillingDate().isBefore(today)) {
                long daysUntil = ChronoUnit.DAYS.between(today, sub.getNextBillingDate());
                String when = daysUntil == 0 ? "hoje" : "em " + daysUntil + " dia(s)";

                insights.add(InsightResponse.builder()
                        .id(UUID.randomUUID().toString())
                        .type("SUBSCRIPTION_RENEWAL")
                        .severity("INFO")
                        .title("Assinatura vence " + when)
                        .message(String.format("%s de R$ %s vence %s",
                                sub.getName(), formatCurrency(sub.getAmount()), when))
                        .actionLabel("Ver assinaturas")
                        .actionRoute("/assinaturas")
                        .createdAt(LocalDateTime.now())
                        .build());
            }
        }

        return insights;
    }

    private List<InsightResponse> generateIncomeExpenseRatioInsight(
            UUID userId, LocalDate startOfMonth, LocalDate today) {
        List<InsightResponse> insights = new ArrayList<>();

        BigDecimal income = transactionRepository.sumByUserIdAndTypeAndDateBetween(
                userId, Category.TransactionType.INCOME, startOfMonth, today);
        BigDecimal expenses = transactionRepository.sumByUserIdAndTypeAndDateBetween(
                userId, Category.TransactionType.EXPENSE, startOfMonth, today);

        if (income == null) income = BigDecimal.ZERO;
        if (expenses == null) expenses = BigDecimal.ZERO;

        if (income.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal ratio = expenses.multiply(BigDecimal.valueOf(100))
                    .divide(income, 2, RoundingMode.HALF_UP);

            if (ratio.compareTo(BigDecimal.valueOf(90)) >= 0) {
                insights.add(InsightResponse.builder()
                        .id(UUID.randomUUID().toString())
                        .type("INCOME_EXPENSE_RATIO")
                        .severity("WARNING")
                        .title("Atenção: gastos representam " + ratio + "% da receita")
                        .message(String.format(
                                "Você está gastando %.0f%% do que ganha este mês. Tente manter abaixo de 80%% para poupar mais.",
                                ratio))
                        .actionLabel("Ver relatórios")
                        .actionRoute("/reports")
                        .createdAt(LocalDateTime.now())
                        .build());
            } else if (ratio.compareTo(BigDecimal.valueOf(70)) >= 0) {
                insights.add(InsightResponse.builder()
                        .id(UUID.randomUUID().toString())
                        .type("INCOME_EXPENSE_RATIO")
                        .severity("INFO")
                        .title("Relação receita/despesa: " + ratio + "%")
                        .message(String.format("Você está gastando %.0f%% da sua receita este mês.", ratio))
                        .actionLabel("Ver relatórios")
                        .actionRoute("/reports")
                        .createdAt(LocalDateTime.now())
                        .build());
            } else {
                insights.add(InsightResponse.builder()
                        .id(UUID.randomUUID().toString())
                        .type("INCOME_EXPENSE_RATIO")
                        .severity("SUCCESS")
                        .title("Saúde financeira boa")
                        .message(String.format("Você está gastando apenas %.0f%% da sua receita. Continue assim!",
                                ratio))
                        .createdAt(LocalDateTime.now())
                        .build());
            }
        }

        return insights;
    }

    private String formatCurrency(BigDecimal value) {
        if (value == null) return "R$ 0,00";
        return "R$ " + String.format("%,.2f", value)
                .replace(",", "X")
                .replace(".", ",")
                .replace("X", ".");
    }
}
