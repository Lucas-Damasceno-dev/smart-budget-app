package com.financeflow.service;

import com.financeflow.entity.Budget;
import com.financeflow.entity.Category;
import com.financeflow.entity.User;
import com.financeflow.repository.BudgetRepository;
import com.financeflow.repository.CategoryRepository;
import com.financeflow.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BudgetServiceTest {

    @Mock
    private BudgetRepository budgetRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private BudgetService budgetService;

    private User user;
    private Category category;
    private UUID userId;
    private UUID categoryId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        categoryId = UUID.randomUUID();

        user = User.builder().id(userId).email("user@example.com").build();
        category = Category.builder().id(categoryId).name("Utilities").type(Category.TransactionType.EXPENSE).build();
    }

    @Test
    void createOrUpdateBudget_CreatesNewBudget() {
        when(categoryRepository.findById(categoryId)).thenReturn(Optional.of(category));
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(budgetRepository.findByCategoryIdAndMonthAndYear(categoryId, 7, 2026)).thenReturn(Optional.empty());

        Budget newBudget = Budget.builder()
                .id(UUID.randomUUID())
                .limitAmount(new BigDecimal("500.00"))
                .spentAmount(BigDecimal.ZERO)
                .month(7)
                .year(2026)
                .category(category)
                .user(user)
                .build();

        when(budgetRepository.save(any(Budget.class))).thenReturn(newBudget);

        Budget result = budgetService.createOrUpdateBudget(categoryId, userId, new BigDecimal("500.00"), 7, 2026);

        assertNotNull(result);
        assertEquals(new BigDecimal("500.00"), result.getLimitAmount());
    }

    @Test
    void updateBudgetSpending_IncrementsSpentAmount() {
        Budget budget = Budget.builder()
                .id(UUID.randomUUID())
                .limitAmount(new BigDecimal("1000.00"))
                .spentAmount(new BigDecimal("200.00"))
                .month(7)
                .year(2026)
                .category(category)
                .user(user)
                .build();

        when(budgetRepository.findByCategoryIdAndMonthAndYear(categoryId, 7, 2026)).thenReturn(Optional.of(budget));

        budgetService.updateBudgetSpending(categoryId, userId, new BigDecimal("100.00"), LocalDate.of(2026, 7, 15));

        assertEquals(new BigDecimal("300.00"), budget.getSpentAmount());
        verify(budgetRepository, times(1)).save(budget);
    }

    @Test
    void reverseBudgetSpending_DecrementsSpentAmount() {
        Budget budget = Budget.builder()
                .id(UUID.randomUUID())
                .limitAmount(new BigDecimal("1000.00"))
                .spentAmount(new BigDecimal("200.00"))
                .month(7)
                .year(2026)
                .category(category)
                .user(user)
                .build();

        when(budgetRepository.findByCategoryIdAndMonthAndYear(categoryId, 7, 2026)).thenReturn(Optional.of(budget));

        budgetService.reverseBudgetSpending(categoryId, userId, new BigDecimal("150.00"), LocalDate.of(2026, 7, 15));

        assertEquals(new BigDecimal("50.00"), budget.getSpentAmount());
        verify(budgetRepository, times(1)).save(budget);
    }
}
