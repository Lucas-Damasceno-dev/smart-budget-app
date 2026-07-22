package com.financeflow.service;

import com.financeflow.dto.sharing.AccountShareRequest;
import com.financeflow.dto.sharing.AccountShareResponse;
import com.financeflow.dto.sharing.ExpenseSplitRequest;
import com.financeflow.dto.sharing.ExpenseSplitResponse;
import com.financeflow.entity.*;
import com.financeflow.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AccountShareService {

    private final AccountRepository accountRepository;
    private final AccountShareRepository accountShareRepository;
    private final ExpenseSplitRepository expenseSplitRepository;
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;

    @Transactional
    public AccountShareResponse shareAccount(UUID ownerId, AccountShareRequest request) {
        Account account = accountRepository.findById(request.getAccountId())
                .orElseThrow(() -> new IllegalArgumentException("Conta não encontrada"));

        if (!account.getUser().getId().equals(ownerId)) {
            throw new IllegalStateException("Apenas o proprietário pode compartilhar a conta");
        }

        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado"));

        User sharedWith = userRepository.findByEmail(request.getSharedWithEmail()).orElse(null);

        AccountShare share = accountShareRepository.findByAccountIdAndSharedWithEmail(account.getId(), request.getSharedWithEmail())
                .orElse(AccountShare.builder()
                        .account(account)
                        .ownerUser(owner)
                        .sharedWithEmail(request.getSharedWithEmail())
                        .build());

        share.setSharedWithUser(sharedWith);
        share.setPermissionLevel(request.getPermissionLevel() != null ? request.getPermissionLevel() : AccountShare.PermissionLevel.READ);
        share.setStatus(sharedWith != null ? AccountShare.ShareStatus.ACCEPTED : AccountShare.ShareStatus.PENDING);

        AccountShare saved = accountShareRepository.save(share);
        return mapShareToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<AccountShareResponse> getMyShares(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado"));

        List<AccountShare> owned = accountShareRepository.findByOwnerUserId(userId);
        List<AccountShare> sharedWithMe = accountShareRepository.findBySharedWithEmail(user.getEmail());

        owned.addAll(sharedWithMe);
        return owned.stream().map(this::mapShareToResponse).collect(Collectors.toList());
    }

    @Transactional
    public void revokeShare(UUID ownerId, UUID shareId) {
        AccountShare share = accountShareRepository.findById(shareId)
                .orElseThrow(() -> new IllegalArgumentException("Compartilhamento não encontrado"));

        if (!share.getOwnerUser().getId().equals(ownerId)) {
            throw new IllegalStateException("Apenas o proprietário pode revogar o compartilhamento");
        }

        accountShareRepository.delete(share);
    }

    @Transactional
    public ExpenseSplitResponse createExpenseSplit(UUID userId, ExpenseSplitRequest request) {
        User payer = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado"));

        User debtor = userRepository.findByEmail(request.getDebtorEmail()).orElse(null);
        Transaction tx = null;
        if (request.getTransactionId() != null) {
            tx = transactionRepository.findById(request.getTransactionId()).orElse(null);
        }

        ExpenseSplit split = ExpenseSplit.builder()
                .transaction(tx)
                .description(request.getDescription())
                .totalAmount(request.getTotalAmount())
                .splitAmount(request.getSplitAmount())
                .payerUser(payer)
                .debtorUser(debtor)
                .debtorEmail(request.getDebtorEmail())
                .status(ExpenseSplit.SplitStatus.PENDING)
                .build();

        ExpenseSplit saved = expenseSplitRepository.save(split);
        return mapSplitToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<ExpenseSplitResponse> getMySplits(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado"));

        List<ExpenseSplit> splits = expenseSplitRepository.findByPayerUserIdOrDebtorUserId(userId, userId);
        List<ExpenseSplit> debtorByEmail = expenseSplitRepository.findByDebtorEmail(user.getEmail());

        for (ExpenseSplit s : debtorByEmail) {
            if (!splits.contains(s)) splits.add(s);
        }

        return splits.stream().map(this::mapSplitToResponse).collect(Collectors.toList());
    }

    @Transactional
    public ExpenseSplitResponse settleSplit(UUID userId, UUID splitId) {
        ExpenseSplit split = expenseSplitRepository.findById(splitId)
                .orElseThrow(() -> new IllegalArgumentException("Divisão não encontrada"));

        split.setStatus(ExpenseSplit.SplitStatus.SETTLED);
        split.setSettledAt(LocalDateTime.now());

        ExpenseSplit saved = expenseSplitRepository.save(split);
        return mapSplitToResponse(saved);
    }

    private AccountShareResponse mapShareToResponse(AccountShare share) {
        return AccountShareResponse.builder()
                .id(share.getId())
                .accountId(share.getAccount().getId())
                .accountName(share.getAccount().getName())
                .ownerEmail(share.getOwnerUser().getEmail())
                .sharedWithEmail(share.getSharedWithEmail())
                .permissionLevel(share.getPermissionLevel())
                .status(share.getStatus())
                .createdAt(share.getCreatedAt())
                .build();
    }

    private ExpenseSplitResponse mapSplitToResponse(ExpenseSplit split) {
        return ExpenseSplitResponse.builder()
                .id(split.getId())
                .transactionId(split.getTransaction() != null ? split.getTransaction().getId() : null)
                .description(split.getDescription())
                .totalAmount(split.getTotalAmount())
                .splitAmount(split.getSplitAmount())
                .payerEmail(split.getPayerUser().getEmail())
                .debtorEmail(split.getDebtorEmail())
                .status(split.getStatus())
                .settledAt(split.getSettledAt())
                .createdAt(split.getCreatedAt())
                .build();
    }
}
