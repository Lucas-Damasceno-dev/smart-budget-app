package com.financeflow.service;

import com.financeflow.entity.*;
import com.financeflow.repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ScheduledTransactionService {

    private final TransactionRepository transactionRepo;
    private final InstallmentGroupRepository groupRepo;
    private final SubscriptionRepository subscriptionRepo;
    private final AccountRepository accountRepository;
    private final AccountService accountService;
    private final NotificationService notificationService;

    @Scheduled(cron = "0 0 1 * * ?")
    @Transactional
    public void promoteInstallmentTransactions() {
        LocalDate today = LocalDate.now();
        log.info("Running installment promotion job for {}", today);

        List<Transaction> dueTransactions = transactionRepo.findPendingTransactionsDueBefore(today);

        for (Transaction tx : dueTransactions) {
            if (tx.getInstallmentGroup() == null) continue;

            tx.setStatus(Transaction.TransactionStatus.COMPLETED);
            transactionRepo.save(tx);

            accountService.updateBalance(
                tx.getAccount().getId(), tx.getAmount(), false);

            InstallmentGroup group = tx.getInstallmentGroup();
            group.setInstallmentNumber(group.getInstallmentNumber() + 1);
            if (group.getInstallmentNumber() >= group.getTotalInstallments()) {
                group.setStatus(InstallmentGroup.InstallmentStatus.COMPLETED);
                log.info("Installment group {} completed", group.getId());
            }
            groupRepo.save(group);
        }

        if (!dueTransactions.isEmpty()) {
            log.info("Promoted {} installment transactions", dueTransactions.size());
        }
    }

    @Scheduled(cron = "0 0 6 * * ?")
    @Transactional
    public void processSubscriptions() {
        LocalDate today = LocalDate.now();
        log.info("Running subscription processing job for {}", today);

        List<Subscription> dueSubscriptions = subscriptionRepo
            .findByStatusAndNextBillingDateLessThanOrEqual(Subscription.SubscriptionStatus.ACTIVE, today);

        for (Subscription sub : dueSubscriptions) {
            if (Boolean.TRUE.equals(sub.getAutoCreateTransaction())
                    && sub.getAccount() != null && sub.getCategory() != null) {

                Transaction tx = Transaction.builder()
                    .description(sub.getName())
                    .amount(sub.getAmount())
                    .date(today)
                    .type(Category.TransactionType.EXPENSE)
                    .status(Transaction.TransactionStatus.COMPLETED)
                    .account(sub.getAccount())
                    .category(sub.getCategory())
                    .user(sub.getUser())
                    .notes("Assinatura automática - " + sub.getName())
                    .build();
                transactionRepo.save(tx);

                accountService.updateBalance(sub.getAccount().getId(), sub.getAmount(), false);
            }

            notificationService.createNotification(
                sub.getUser().getId(),
                "Cobrança de assinatura",
                String.format("%s - R$ %s vence hoje", sub.getName(), sub.getAmount()),
                Notification.NotificationType.RECURRING_TRANSACTION
            );

            sub.setNextBillingDate(advanceBillingDate(sub.getNextBillingDate(), sub.getBillingCycle()));
            subscriptionRepo.save(sub);
        }

        if (!dueSubscriptions.isEmpty()) {
            log.info("Processed {} subscriptions", dueSubscriptions.size());
        }
    }

    private LocalDate advanceBillingDate(LocalDate current, Subscription.BillingCycle cycle) {
        return switch (cycle) {
            case MONTHLY -> current.plusMonths(1);
            case QUARTERLY -> current.plusMonths(3);
            case SEMI_ANNUAL -> current.plusMonths(6);
            case YEARLY -> current.plusYears(1);
        };
    }
}
