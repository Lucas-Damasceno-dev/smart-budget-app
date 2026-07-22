package com.financeflow.service;

import com.financeflow.dto.account.AccountRequest;
import com.financeflow.dto.account.AccountResponse;
import com.financeflow.entity.Account;
import com.financeflow.entity.User;
import com.financeflow.exception.ResourceNotFoundException;
import com.financeflow.repository.AccountRepository;
import com.financeflow.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AccountServiceTest {

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private AccountService accountService;

    private User user;
    private UUID userId;
    private UUID accountId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        accountId = UUID.randomUUID();

        user = User.builder()
                .id(userId)
                .email("user@example.com")
                .firstName("Alice")
                .lastName("Smith")
                .build();
    }

    @Test
    void createAccount_Success() {
        AccountRequest request = AccountRequest.builder()
                .name("Savings")
                .type(Account.AccountType.SAVINGS)
                .initialBalance(new BigDecimal("500.00"))
                .currency("BRL")
                .build();

        Account savedAccount = Account.builder()
                .id(accountId)
                .name("Savings")
                .type(Account.AccountType.SAVINGS)
                .initialBalance(new BigDecimal("500.00"))
                .currentBalance(new BigDecimal("500.00"))
                .currency("BRL")
                .user(user)
                .active(true)
                .build();

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(accountRepository.save(any(Account.class))).thenReturn(savedAccount);

        AccountResponse response = accountService.createAccount(request, userId);

        assertNotNull(response);
        assertEquals("Savings", response.getName());
        assertEquals(new BigDecimal("500.00"), response.getCurrentBalance());
    }

    @Test
    void updateBalance_Credit_Success() {
        Account account = Account.builder()
                .id(accountId)
                .name("Checking")
                .currentBalance(new BigDecimal("100.00"))
                .build();

        when(accountRepository.findById(accountId)).thenReturn(Optional.of(account));

        accountService.updateBalance(accountId, new BigDecimal("50.00"), true);

        assertEquals(new BigDecimal("150.00"), account.getCurrentBalance());
        verify(accountRepository).save(account);
    }

    @Test
    void updateBalance_Debit_Success() {
        Account account = Account.builder()
                .id(accountId)
                .name("Checking")
                .currentBalance(new BigDecimal("100.00"))
                .build();

        when(accountRepository.findById(accountId)).thenReturn(Optional.of(account));

        accountService.updateBalance(accountId, new BigDecimal("30.00"), false);

        assertEquals(new BigDecimal("70.00"), account.getCurrentBalance());
        verify(accountRepository).save(account);
    }

    @Test
    void getAllAccounts_ReturnsActiveUserAccounts() {
        Account account = Account.builder()
                .id(accountId)
                .name("Checking")
                .type(Account.AccountType.CHECKING)
                .currentBalance(new BigDecimal("100.00"))
                .active(true)
                .build();

        when(accountRepository.findByUserIdAndActiveTrue(userId)).thenReturn(List.of(account));

        List<AccountResponse> responses = accountService.getAllAccounts(userId);

        assertEquals(1, responses.size());
        assertEquals("Checking", responses.get(0).getName());
    }
}
