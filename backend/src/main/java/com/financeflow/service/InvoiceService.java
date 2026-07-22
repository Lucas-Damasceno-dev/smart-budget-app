package com.financeflow.service;

import com.financeflow.entity.*;
import com.financeflow.exception.BadRequestException;
import com.financeflow.exception.ResourceNotFoundException;
import com.financeflow.repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InvoiceService {

    private final TransactionRepository transactionRepo;
    private final AccountRepository accountRepository;
    private final AccountService accountService;
    private final CategoryRepository categoryRepository;
    private final NotificationService notificationService;

    public InvoiceCycle calculateCycle(Account creditCardAccount, LocalDate referenceDate) {
        int closingDay = creditCardAccount.getClosingDay();
        int dueDay = creditCardAccount.getDueDay();

        LocalDate cycleStart;
        LocalDate cycleEnd;
        LocalDate dueDate;

        if (referenceDate.getDayOfMonth() <= closingDay) {
            cycleEnd = referenceDate.withDayOfMonth(Math.min(closingDay, referenceDate.lengthOfMonth()));
            if (cycleEnd.isBefore(referenceDate)) {
                cycleEnd = cycleEnd.plusMonths(1);
            }
            cycleStart = cycleEnd.minusMonths(1).plusDays(1);
        } else {
            cycleStart = referenceDate.withDayOfMonth(Math.min(closingDay + 1, referenceDate.lengthOfMonth()));
            if (cycleStart.isBefore(referenceDate)) {
                cycleStart = cycleStart.plusMonths(1);
            }
            cycleEnd = cycleStart.plusMonths(1).minusDays(1)
                .withDayOfMonth(Math.min(closingDay, cycleStart.plusMonths(1).minusDays(1).lengthOfMonth()));
        }

        dueDate = cycleEnd.withDayOfMonth(Math.min(dueDay, cycleEnd.lengthOfMonth()));

        return new InvoiceCycle(cycleStart, cycleEnd, dueDate);
    }

    public InvoiceData getCurrentInvoice(UUID accountId, UUID userId) {
        Account account = accountRepository.findById(accountId)
            .orElseThrow(() -> new ResourceNotFoundException("Account not found"));
        if (!account.getUser().getId().equals(userId)) {
            throw new BadRequestException("Account does not belong to user");
        }
        if (account.getType() != Account.AccountType.CREDIT_CARD) {
            throw new BadRequestException("Invoice is only available for credit card accounts");
        }

        InvoiceCycle cycle = calculateCycle(account, LocalDate.now());

        List<Transaction> expenses = transactionRepo
            .findByAccountIdAndDateBetweenAndTypeAndStatus(
                accountId, cycle.start(), cycle.end(),
                Category.TransactionType.EXPENSE, Transaction.TransactionStatus.COMPLETED
            );

        // Also include transfers TO this card (payments) within the cycle
        List<Transaction> payments = transactionRepo
            .findByDestinationAccountIdAndDateBetweenAndType(
                accountId, cycle.start(), cycle.end(),
                Category.TransactionType.TRANSFER
            );

        BigDecimal totalAmount = expenses.stream()
            .map(Transaction::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalPaid = payments.stream()
            .map(Transaction::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<InvoiceLineItem> items = expenses.stream()
            .map(tx -> new InvoiceLineItem(tx.getId(), tx.getDescription(), tx.getAmount(),
                tx.getDate(), tx.getCategory().getName()))
            .collect(Collectors.toList());

        return InvoiceData.builder()
            .accountId(accountId)
            .accountName(account.getName())
            .cycleStart(cycle.start())
            .cycleEnd(cycle.end())
            .dueDate(cycle.dueDate())
            .totalAmount(totalAmount)
            .totalPaid(totalPaid)
            .remainingBalance(totalAmount.subtract(totalPaid))
            .items(items)
            .build();
    }

    public InvoiceData getInvoiceForMonth(UUID accountId, UUID userId, LocalDate monthReference) {
        Account account = accountRepository.findById(accountId)
            .orElseThrow(() -> new ResourceNotFoundException("Account not found"));
        if (!account.getUser().getId().equals(userId)) {
            throw new BadRequestException("Account does not belong to user");
        }
        if (account.getType() != Account.AccountType.CREDIT_CARD) {
            throw new BadRequestException("Invoice is only available for credit card accounts");
        }

        InvoiceCycle cycle = calculateCycle(account, monthReference);

        List<Transaction> expenses = transactionRepo
            .findByAccountIdAndDateBetweenAndTypeAndStatus(
                accountId, cycle.start(), cycle.end(),
                Category.TransactionType.EXPENSE, Transaction.TransactionStatus.COMPLETED
            );

        List<Transaction> payments = transactionRepo
            .findByDestinationAccountIdAndDateBetweenAndType(
                accountId, cycle.start(), cycle.end(),
                Category.TransactionType.TRANSFER
            );

        BigDecimal totalAmount = expenses.stream()
            .map(Transaction::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalPaid = payments.stream()
            .map(Transaction::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<InvoiceLineItem> items = expenses.stream()
            .map(tx -> new InvoiceLineItem(tx.getId(), tx.getDescription(), tx.getAmount(),
                tx.getDate(), tx.getCategory().getName()))
            .collect(Collectors.toList());

        return InvoiceData.builder()
            .accountId(accountId)
            .accountName(account.getName())
            .cycleStart(cycle.start())
            .cycleEnd(cycle.end())
            .dueDate(cycle.dueDate())
            .totalAmount(totalAmount)
            .totalPaid(totalPaid)
            .remainingBalance(totalAmount.subtract(totalPaid))
            .items(items)
            .build();
    }

    @Transactional
    @Caching(evict = {
        @CacheEvict(value = "dashboard", key = "#userId"),
        @CacheEvict(value = "accounts", key = "#userId")
    })
    public Transaction payInvoice(UUID accountId, UUID sourceAccountId, UUID userId) {
        Account creditCard = accountRepository.findById(accountId)
            .orElseThrow(() -> new ResourceNotFoundException("Account not found"));
        Account source = accountRepository.findById(sourceAccountId)
            .orElseThrow(() -> new ResourceNotFoundException("Source account not found"));

        if (!creditCard.getUser().getId().equals(userId) || !source.getUser().getId().equals(userId)) {
            throw new BadRequestException("Accounts must belong to user");
        }
        if (creditCard.getType() != Account.AccountType.CREDIT_CARD) {
            throw new BadRequestException("Target account must be a credit card");
        }

        InvoiceData invoice = getCurrentInvoice(accountId, userId);
        if (invoice.getRemainingBalance().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Invoice already paid");
        }

        // Find or create a "Pagamento de Fatura" category
        Category paymentCategory = categoryRepository
            .findByUserIdAndNameAndType(userId, "Pagamento de Fatura", Category.TransactionType.TRANSFER)
            .orElse(null);

        User user = creditCard.getUser();

        Transaction payment = Transaction.builder()
            .description("Pagamento fatura " + creditCard.getName())
            .amount(invoice.getRemainingBalance())
            .date(LocalDate.now())
            .type(Category.TransactionType.TRANSFER)
            .status(Transaction.TransactionStatus.COMPLETED)
            .account(source)
            .destinationAccount(creditCard)
            .category(paymentCategory)
            .user(user)
            .notes("Fatura " + invoice.getCycleStart() + " a " + invoice.getCycleEnd())
            .build();

        payment = transactionRepo.save(payment);

        // Update balances: source decreases, credit card decreases (credit card balance goes down when paid)
        accountService.updateBalance(source.getId(), invoice.getRemainingBalance(), false);
        accountService.updateBalance(creditCard.getId(), invoice.getRemainingBalance(), false);

        return payment;
    }

    public void checkClosingDateAlerts(UUID userId) {
        List<Account> creditCards = accountRepository.findByUserIdAndType(userId, Account.AccountType.CREDIT_CARD);
        LocalDate today = LocalDate.now();
        for (Account cc : creditCards) {
            if (cc.getClosingDay() == null || cc.getDueDay() == null) continue;
            InvoiceCycle cycle = calculateCycle(cc, today);
            long daysUntilClose = ChronoUnit.DAYS.between(today, cycle.end());
            if (daysUntilClose >= 0 && daysUntilClose <= 3) {
                notificationService.createNotification(
                    userId,
                    "Fatura próxima do fechamento",
                    String.format("Fatura do %s fecha em %d dia(s)", cc.getName(), daysUntilClose),
                    Notification.NotificationType.BUDGET_WARNING
                );
            }
        }
    }

    public record InvoiceCycle(LocalDate start, LocalDate end, LocalDate dueDate) {}

    @lombok.Builder @lombok.Data
    public static class InvoiceData {
        private UUID accountId;
        private String accountName;
        private LocalDate cycleStart;
        private LocalDate cycleEnd;
        private LocalDate dueDate;
        private BigDecimal totalAmount;
        private BigDecimal totalPaid;
        private BigDecimal remainingBalance;
        private List<InvoiceLineItem> items;
    }

    @lombok.Builder @lombok.Data
    public static class InvoiceLineItem {
        private UUID transactionId;
        private String description;
        private BigDecimal amount;
        private LocalDate date;
        private String categoryName;
    }
}
