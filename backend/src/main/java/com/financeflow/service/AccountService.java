package com.financeflow.service;

import com.financeflow.dto.account.AccountRequest;
import com.financeflow.dto.account.AccountResponse;
import com.financeflow.entity.Account;
import com.financeflow.entity.User;
import com.financeflow.exception.BadRequestException;
import com.financeflow.exception.ResourceNotFoundException;
import com.financeflow.repository.AccountRepository;
import com.financeflow.repository.UserRepository;
import jakarta.persistence.OptimisticLockException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AccountService {

    private final AccountRepository accountRepository;
    private final UserRepository userRepository;

    @Cacheable(value = "accounts", key = "#userId")
    public List<AccountResponse> getAllAccounts(UUID userId) {
        return accountRepository.findByUserIdAndActiveTrue(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public AccountResponse getAccount(UUID accountId, UUID userId) {
        Account account = findAccountByIdAndUser(accountId, userId);
        return mapToResponse(account);
    }

    @Transactional
    @CacheEvict(value = "accounts", key = "#userId")
    public AccountResponse createAccount(AccountRequest request, UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Account account = Account.builder()
                .name(request.getName())
                .type(request.getType())
                .initialBalance(request.getInitialBalance() != null ? request.getInitialBalance() : BigDecimal.ZERO)
                .currentBalance(request.getInitialBalance() != null ? request.getInitialBalance() : BigDecimal.ZERO)
                .currency(request.getCurrency() != null ? request.getCurrency() : "BRL")
                .color(request.getColor())
                .icon(request.getIcon())
                .bankName(request.getBankName())
                .accountNumber(request.getAccountNumber())
                .goalBalance(request.getGoalBalance())
                .user(user)
                .active(true)
                .build();

        account = accountRepository.save(account);
        return mapToResponse(account);
    }

    @Transactional
    @CacheEvict(value = "accounts", key = "#userId")
    public AccountResponse updateAccount(UUID accountId, AccountRequest request, UUID userId) {
        Account account = findAccountByIdAndUser(accountId, userId);

        account.setName(request.getName());
        account.setType(request.getType());
        account.setCurrency(request.getCurrency());
        account.setColor(request.getColor());
        account.setIcon(request.getIcon());
        account.setBankName(request.getBankName());
        account.setAccountNumber(request.getAccountNumber());
        account.setGoalBalance(request.getGoalBalance());

        account = accountRepository.save(account);
        return mapToResponse(account);
    }

    @Transactional
    @CacheEvict(value = "accounts", key = "#userId")
    public void deleteAccount(UUID accountId, UUID userId) {
        Account account = findAccountByIdAndUser(accountId, userId);
        account.setActive(false);
        accountRepository.save(account);
    }

    public BigDecimal getTotalBalance(UUID userId) {
        BigDecimal total = accountRepository.getTotalBalance(userId);
        return total != null ? total : BigDecimal.ZERO;
    }

    @Transactional(isolation = Isolation.REPEATABLE_READ)
    @Retryable(
        retryFor = OptimisticLockException.class,
        maxAttempts = 3,
        backoff = @Backoff(delay = 100, multiplier = 2)
    )
    public void updateBalance(UUID accountId, BigDecimal amount, boolean isCredit) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));

        BigDecimal newBalance = isCredit
                ? account.getCurrentBalance().add(amount)
                : account.getCurrentBalance().subtract(amount);

        account.setCurrentBalance(newBalance);
        
        try {
            accountRepository.save(account);
        } catch (OptimisticLockException e) {
            log.warn("Optimistic lock conflict on account {}, retrying...", accountId);
            throw e;
        }
    }

    private Account findAccountByIdAndUser(UUID accountId, UUID userId) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));

        if (!account.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Account not found");
        }

        return account;
    }

    private AccountResponse mapToResponse(Account account) {
        Double goalProgress = null;
        if (account.getGoalBalance() != null && account.getGoalBalance().compareTo(BigDecimal.ZERO) > 0) {
            goalProgress = account.getCurrentBalance()
                    .divide(account.getGoalBalance(), 4, java.math.RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100))
                    .doubleValue();
        }

        return AccountResponse.builder()
                .id(account.getId())
                .name(account.getName())
                .type(account.getType())
                .initialBalance(account.getInitialBalance())
                .currentBalance(account.getCurrentBalance())
                .currency(account.getCurrency())
                .color(account.getColor())
                .icon(account.getIcon())
                .bankName(account.getBankName())
                .accountNumber(account.getAccountNumber())
                .active(account.isActive())
                .goalBalance(account.getGoalBalance())
                .goalProgress(goalProgress)
                .createdAt(account.getCreatedAt())
                .updatedAt(account.getUpdatedAt())
                .build();
    }
}
