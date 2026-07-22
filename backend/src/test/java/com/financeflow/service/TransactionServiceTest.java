package com.financeflow.service;

import com.financeflow.dto.transaction.TransactionRequest;
import com.financeflow.dto.transaction.TransactionResponse;
import com.financeflow.entity.Account;
import com.financeflow.entity.Category;
import com.financeflow.entity.Transaction;
import com.financeflow.entity.User;
import com.financeflow.exception.ResourceNotFoundException;
import com.financeflow.repository.AccountRepository;
import com.financeflow.repository.CategoryRepository;
import com.financeflow.repository.TagRepository;
import com.financeflow.repository.TransactionRepository;
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
class TransactionServiceTest {

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private TagRepository tagRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private AccountService accountService;

    @Mock
    private BudgetService budgetService;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private TransactionService transactionService;

    private User user;
    private Account account;
    private Category category;
    private UUID userId;
    private UUID accountId;
    private UUID categoryId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        accountId = UUID.randomUUID();
        categoryId = UUID.randomUUID();

        user = User.builder()
                .id(userId)
                .email("test@example.com")
                .firstName("John")
                .lastName("Doe")
                .build();

        account = Account.builder()
                .id(accountId)
                .name("Checking")
                .type(Account.AccountType.CHECKING)
                .currentBalance(new BigDecimal("1000.00"))
                .user(user)
                .build();

        category = Category.builder()
                .id(categoryId)
                .name("Food")
                .type(Category.TransactionType.EXPENSE)
                .build();
    }

    @Test
    void createTransaction_Expense_Success() {
        TransactionRequest request = TransactionRequest.builder()
                .description("Supermarket")
                .amount(new BigDecimal("150.00"))
                .date(LocalDate.now())
                .type(Category.TransactionType.EXPENSE)
                .status(Transaction.TransactionStatus.COMPLETED)
                .accountId(accountId)
                .categoryId(categoryId)
                .build();

        Transaction savedTransaction = Transaction.builder()
                .id(UUID.randomUUID())
                .description(request.getDescription())
                .amount(request.getAmount())
                .date(request.getDate())
                .type(request.getType())
                .status(request.getStatus())
                .account(account)
                .category(category)
                .user(user)
                .build();

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(accountRepository.findById(accountId)).thenReturn(Optional.of(account));
        when(categoryRepository.findById(categoryId)).thenReturn(Optional.of(category));
        when(transactionRepository.save(any(Transaction.class))).thenReturn(savedTransaction);

        TransactionResponse response = transactionService.createTransaction(request, userId);

        assertNotNull(response);
        assertEquals("Supermarket", response.getDescription());
        assertEquals(new BigDecimal("150.00"), response.getAmount());

        verify(accountService, times(1)).updateBalance(accountId, new BigDecimal("150.00"), false);
        verify(budgetService, times(1)).updateBudgetSpending(eq(categoryId), eq(userId), eq(new BigDecimal("150.00")), any(LocalDate.class));
    }

    @Test
    void createTransaction_UserNotFound_ThrowsException() {
        TransactionRequest request = TransactionRequest.builder()
                .accountId(accountId)
                .categoryId(categoryId)
                .amount(new BigDecimal("50.00"))
                .build();

        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> transactionService.createTransaction(request, userId));
    }

    @Test
    void deleteTransaction_ReversesBalanceAndBudget() {
        UUID transactionId = UUID.randomUUID();
        Transaction transaction = Transaction.builder()
                .id(transactionId)
                .description("Dinner")
                .amount(new BigDecimal("80.00"))
                .date(LocalDate.now())
                .type(Category.TransactionType.EXPENSE)
                .status(Transaction.TransactionStatus.COMPLETED)
                .account(account)
                .category(category)
                .user(user)
                .build();

        when(transactionRepository.findById(transactionId)).thenReturn(Optional.of(transaction));

        transactionService.deleteTransaction(transactionId, userId);

        verify(accountService, times(1)).updateBalance(accountId, new BigDecimal("80.00"), true);
        verify(budgetService, times(1)).reverseBudgetSpending(eq(categoryId), eq(userId), eq(new BigDecimal("80.00")), any(LocalDate.class));
        verify(transactionRepository, times(1)).delete(transaction);
    }
}
