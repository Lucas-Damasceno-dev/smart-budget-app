package com.financeflow.service;

import com.financeflow.entity.Budget;
import com.financeflow.entity.Category;
import com.financeflow.entity.Notification;
import com.financeflow.entity.User;
import com.financeflow.exception.ResourceNotFoundException;
import com.financeflow.repository.BudgetRepository;
import com.financeflow.repository.CategoryRepository;
import com.financeflow.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public List<Budget> getBudgetsForMonth(UUID userId, int month, int year) {
        return budgetRepository.findByUserIdAndMonthAndYearWithCategory(userId, month, year);
    }

    @Transactional
    public Budget createOrUpdateBudget(UUID categoryId, UUID userId, BigDecimal limitAmount, int month, int year) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Optional<Budget> existingBudget = budgetRepository.findByCategoryIdAndMonthAndYear(categoryId, month, year);

        Budget budget;
        if (existingBudget.isPresent()) {
            budget = existingBudget.get();
            budget.setLimitAmount(limitAmount);
        } else {
            budget = Budget.builder()
                    .limitAmount(limitAmount)
                    .spentAmount(BigDecimal.ZERO)
                    .month(month)
                    .year(year)
                    .category(category)
                    .user(user)
                    .build();
        }

        return budgetRepository.save(budget);
    }

    @Transactional
    public void updateBudgetSpending(UUID categoryId, UUID userId, BigDecimal amount, LocalDate transactionDate) {
        Optional<Budget> budgetOpt = budgetRepository.findByCategoryIdAndMonthAndYear(
                categoryId, transactionDate.getMonthValue(), transactionDate.getYear());

        if (budgetOpt.isPresent()) {
            Budget budget = budgetOpt.get();
            budget.setSpentAmount(budget.getSpentAmount().add(amount));
            budgetRepository.save(budget);

            // Check for alerts
            double percentage = budget.getPercentageUsed();
            
            if (percentage >= 100 && !budget.isAlertAt100Sent()) {
                notificationService.createNotification(
                        userId,
                        "Orçamento Excedido",
                        String.format("Você ultrapassou 100%% do orçamento de %s", budget.getCategory().getName()),
                        Notification.NotificationType.BUDGET_EXCEEDED
                );
                budget.setAlertAt100Sent(true);
                budgetRepository.save(budget);
            } else if (percentage >= 80 && !budget.isAlertAt80Sent()) {
                notificationService.createNotification(
                        userId,
                        "Alerta de Orçamento",
                        String.format("Você atingiu 80%% do orçamento de %s", budget.getCategory().getName()),
                        Notification.NotificationType.BUDGET_WARNING
                );
                budget.setAlertAt80Sent(true);
                budgetRepository.save(budget);
            }
        }
    }

    public void deleteBudget(UUID budgetId, UUID userId) {
        Budget budget = budgetRepository.findById(budgetId)
                .orElseThrow(() -> new ResourceNotFoundException("Budget not found"));

        if (!budget.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Budget not found");
        }

        budgetRepository.delete(budget);
    }
}
