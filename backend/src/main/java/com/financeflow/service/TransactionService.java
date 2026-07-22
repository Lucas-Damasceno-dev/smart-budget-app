package com.financeflow.service;

import com.financeflow.dto.common.PageResponse;
import com.financeflow.dto.transaction.TransactionFilter;
import com.financeflow.dto.transaction.TransactionRequest;
import com.financeflow.dto.transaction.TransactionResponse;
import com.financeflow.entity.*;
import com.financeflow.exception.BadRequestException;
import com.financeflow.exception.ResourceNotFoundException;
import com.financeflow.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Caching;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;
    private final CategoryRepository categoryRepository;
    private final TagRepository tagRepository;
    private final UserRepository userRepository;
    private final AccountService accountService;
    private final BudgetService budgetService;
    private final NotificationService notificationService;

    public PageResponse<TransactionResponse> getTransactions(UUID userId, TransactionFilter filter, Pageable pageable) {
        Specification<Transaction> spec = buildSpecification(userId, filter);
        Page<Transaction> page = transactionRepository.findAll(spec, pageable);

        List<TransactionResponse> content = page.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return PageResponse.<TransactionResponse>builder()
                .content(content)
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .first(page.isFirst())
                .last(page.isLast())
                .build();
    }

    public TransactionResponse getTransaction(UUID transactionId, UUID userId) {
        Transaction transaction = findTransactionByIdAndUser(transactionId, userId);
        return mapToResponse(transaction);
    }

    @Transactional
    @Caching(evict = {
        @CacheEvict(value = "dashboard", key = "#userId"),
        @CacheEvict(value = "accounts", key = "#userId")
    })
    public TransactionResponse createTransaction(TransactionRequest request, UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Account account = accountRepository.findById(request.getAccountId())
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));

        if (!account.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Account not found");
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        Account destinationAccount = null;
        if (request.getDestinationAccountId() != null) {
            destinationAccount = accountRepository.findById(request.getDestinationAccountId())
                    .orElseThrow(() -> new ResourceNotFoundException("Destination account not found"));
        }

        Transaction transaction = Transaction.builder()
                .description(request.getDescription())
                .amount(request.getAmount())
                .date(request.getDate())
                .type(request.getType())
                .status(request.getStatus())
                .notes(request.getNotes())
                .account(account)
                .destinationAccount(destinationAccount)
                .category(category)
                .user(user)
                .isRecurring(request.isRecurring())
                .recurrenceFrequency(request.getRecurrenceFrequency())
                .recurrenceEndDate(request.getRecurrenceEndDate())
                .build();

        // Handle tags
        if (request.getTags() != null && !request.getTags().isEmpty()) {
            Set<Tag> tags = new HashSet<>();
            for (String tagName : request.getTags()) {
                Tag tag = tagRepository.findByNameAndUserId(tagName, userId)
                        .orElseGet(() -> tagRepository.save(Tag.builder()
                                .name(tagName)
                                .user(user)
                                .build()));
                tags.add(tag);
            }
            transaction.setTags(tags);
        }

        // Handle splits
        if (request.getSplits() != null && !request.getSplits().isEmpty()) {
            BigDecimal totalSplit = request.getSplits().stream()
                    .map(TransactionRequest.SplitRequest::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            if (totalSplit.compareTo(request.getAmount()) != 0) {
                throw new BadRequestException("Split amounts must equal transaction amount");
            }

            List<TransactionSplit> splits = new ArrayList<>();
            for (TransactionRequest.SplitRequest splitReq : request.getSplits()) {
                Category splitCategory = categoryRepository.findById(splitReq.getCategoryId())
                        .orElseThrow(() -> new ResourceNotFoundException("Split category not found"));

                TransactionSplit split = TransactionSplit.builder()
                        .amount(splitReq.getAmount())
                        .description(splitReq.getDescription())
                        .category(splitCategory)
                        .transaction(transaction)
                        .build();
                splits.add(split);
            }
            transaction.setSplits(splits);
        }

        transaction = transactionRepository.save(transaction);

        // Update account balance
        updateAccountBalance(transaction);

        // Update budget spending
        if (request.getType() == Category.TransactionType.EXPENSE) {
            budgetService.updateBudgetSpending(category.getId(), userId, request.getAmount(), request.getDate());
        }

        return mapToResponse(transaction);
    }

    @Transactional
    @Caching(evict = {
        @CacheEvict(value = "dashboard", key = "#userId"),
        @CacheEvict(value = "accounts", key = "#userId")
    })
    public TransactionResponse updateTransaction(UUID transactionId, TransactionRequest request, UUID userId) {
        Transaction transaction = findTransactionByIdAndUser(transactionId, userId);

        // Reverse old balance and budget update
        reverseAccountBalance(transaction);
        if (transaction.getType() == Category.TransactionType.EXPENSE) {
            budgetService.reverseBudgetSpending(
                    transaction.getCategory().getId(), userId, transaction.getAmount(), transaction.getDate());
        }

        // Update fields
        transaction.setDescription(request.getDescription());
        transaction.setAmount(request.getAmount());
        transaction.setDate(request.getDate());
        transaction.setType(request.getType());
        transaction.setStatus(request.getStatus());
        transaction.setNotes(request.getNotes());
        transaction.setRecurring(request.isRecurring());
        transaction.setRecurrenceFrequency(request.getRecurrenceFrequency());
        transaction.setRecurrenceEndDate(request.getRecurrenceEndDate());

        Account account = accountRepository.findById(request.getAccountId())
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));
        transaction.setAccount(account);

        if (request.getDestinationAccountId() != null) {
            Account destAccount = accountRepository.findById(request.getDestinationAccountId())
                    .orElseThrow(() -> new ResourceNotFoundException("Destination account not found"));
            transaction.setDestinationAccount(destAccount);
        } else {
            transaction.setDestinationAccount(null);
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        transaction.setCategory(category);

        transaction = transactionRepository.save(transaction);

        // Apply new balance and budget update
        updateAccountBalance(transaction);
        if (request.getType() == Category.TransactionType.EXPENSE) {
            budgetService.updateBudgetSpending(category.getId(), userId, request.getAmount(), request.getDate());
        }

        return mapToResponse(transaction);
    }

    @Transactional
    @Caching(evict = {
        @CacheEvict(value = "dashboard", key = "#userId"),
        @CacheEvict(value = "accounts", key = "#userId")
    })
    public void deleteTransaction(UUID transactionId, UUID userId) {
        Transaction transaction = findTransactionByIdAndUser(transactionId, userId);
        
        // Reverse balance and budget
        reverseAccountBalance(transaction);
        if (transaction.getType() == Category.TransactionType.EXPENSE) {
            budgetService.reverseBudgetSpending(
                    transaction.getCategory().getId(), userId, transaction.getAmount(), transaction.getDate());
        }

        transactionRepository.delete(transaction);
    }

    public List<Transaction> getTransactionsBetweenDates(UUID userId, LocalDate startDate, LocalDate endDate) {
        return transactionRepository.findByUserIdAndDateBetween(userId, startDate, endDate);
    }

    public BigDecimal sumByType(UUID userId, Category.TransactionType type, LocalDate startDate, LocalDate endDate) {
        BigDecimal sum = transactionRepository.sumByUserIdAndTypeAndDateBetween(userId, type, startDate, endDate);
        return sum != null ? sum : BigDecimal.ZERO;
    }

    private void updateAccountBalance(Transaction transaction) {
        if (transaction.getStatus() != Transaction.TransactionStatus.COMPLETED) {
            return;
        }

        switch (transaction.getType()) {
            case INCOME -> accountService.updateBalance(
                    transaction.getAccount().getId(),
                    transaction.getAmount(),
                    true
            );
            case EXPENSE -> accountService.updateBalance(
                    transaction.getAccount().getId(),
                    transaction.getAmount(),
                    false
            );
            case TRANSFER -> {
                accountService.updateBalance(
                        transaction.getAccount().getId(),
                        transaction.getAmount(),
                        false
                );
                if (transaction.getDestinationAccount() != null) {
                    accountService.updateBalance(
                            transaction.getDestinationAccount().getId(),
                            transaction.getAmount(),
                            true
                    );
                }
            }
        }
    }

    private void reverseAccountBalance(Transaction transaction) {
        if (transaction.getStatus() != Transaction.TransactionStatus.COMPLETED) {
            return;
        }

        switch (transaction.getType()) {
            case INCOME -> accountService.updateBalance(
                    transaction.getAccount().getId(),
                    transaction.getAmount(),
                    false
            );
            case EXPENSE -> accountService.updateBalance(
                    transaction.getAccount().getId(),
                    transaction.getAmount(),
                    true
            );
            case TRANSFER -> {
                accountService.updateBalance(
                        transaction.getAccount().getId(),
                        transaction.getAmount(),
                        true
                );
                if (transaction.getDestinationAccount() != null) {
                    accountService.updateBalance(
                            transaction.getDestinationAccount().getId(),
                            transaction.getAmount(),
                            false
                    );
                }
            }
        }
    }

    private Transaction findTransactionByIdAndUser(UUID transactionId, UUID userId) {
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));

        if (!transaction.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Transaction not found");
        }

        return transaction;
    }

    private Specification<Transaction> buildSpecification(UUID userId, TransactionFilter filter) {
        return (root, query, cb) -> {
            List<jakarta.persistence.criteria.Predicate> predicates = new ArrayList<>();

            predicates.add(cb.equal(root.get("user").get("id"), userId));

            if (filter != null) {
                if (filter.getStartDate() != null) {
                    predicates.add(cb.greaterThanOrEqualTo(root.get("date"), filter.getStartDate()));
                }
                if (filter.getEndDate() != null) {
                    predicates.add(cb.lessThanOrEqualTo(root.get("date"), filter.getEndDate()));
                }
                if (filter.getType() != null) {
                    predicates.add(cb.equal(root.get("type"), filter.getType()));
                }
                if (filter.getStatus() != null) {
                    predicates.add(cb.equal(root.get("status"), filter.getStatus()));
                }
                if (filter.getAccountIds() != null && !filter.getAccountIds().isEmpty()) {
                    predicates.add(root.get("account").get("id").in(filter.getAccountIds()));
                }
                if (filter.getCategoryIds() != null && !filter.getCategoryIds().isEmpty()) {
                    predicates.add(root.get("category").get("id").in(filter.getCategoryIds()));
                }
                if (filter.getMinAmount() != null) {
                    predicates.add(cb.greaterThanOrEqualTo(root.get("amount"), filter.getMinAmount()));
                }
                if (filter.getMaxAmount() != null) {
                    predicates.add(cb.lessThanOrEqualTo(root.get("amount"), filter.getMaxAmount()));
                }
                if (filter.getSearchTerm() != null && !filter.getSearchTerm().isEmpty()) {
                    String searchPattern = "%" + filter.getSearchTerm().toLowerCase() + "%";
                    predicates.add(cb.or(
                            cb.like(cb.lower(root.get("description")), searchPattern),
                            cb.like(cb.lower(root.get("notes")), searchPattern)
                    ));
                }
                if (filter.getIsRecurring() != null) {
                    predicates.add(cb.equal(root.get("isRecurring"), filter.getIsRecurring()));
                }
            }

            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };
    }

    private TransactionResponse mapToResponse(Transaction transaction) {
        TransactionResponse.AccountInfo accountInfo = TransactionResponse.AccountInfo.builder()
                .id(transaction.getAccount().getId())
                .name(transaction.getAccount().getName())
                .type(transaction.getAccount().getType().name())
                .color(transaction.getAccount().getColor())
                .build();

        TransactionResponse.AccountInfo destAccountInfo = null;
        if (transaction.getDestinationAccount() != null) {
            destAccountInfo = TransactionResponse.AccountInfo.builder()
                    .id(transaction.getDestinationAccount().getId())
                    .name(transaction.getDestinationAccount().getName())
                    .type(transaction.getDestinationAccount().getType().name())
                    .color(transaction.getDestinationAccount().getColor())
                    .build();
        }

        TransactionResponse.CategoryInfo categoryInfo = TransactionResponse.CategoryInfo.builder()
                .id(transaction.getCategory().getId())
                .name(transaction.getCategory().getName())
                .color(transaction.getCategory().getColor())
                .icon(transaction.getCategory().getIcon())
                .build();

        Set<TransactionResponse.TagInfo> tagInfos = transaction.getTags() != null
                ? transaction.getTags().stream()
                        .map(tag -> TransactionResponse.TagInfo.builder()
                                .id(tag.getId())
                                .name(tag.getName())
                                .color(tag.getColor())
                                .build())
                        .collect(Collectors.toSet())
                : Collections.emptySet();

        List<TransactionResponse.SplitInfo> splitInfos = transaction.getSplits() != null
                ? transaction.getSplits().stream()
                        .map(split -> TransactionResponse.SplitInfo.builder()
                                .id(split.getId())
                                .amount(split.getAmount())
                                .description(split.getDescription())
                                .category(TransactionResponse.CategoryInfo.builder()
                                        .id(split.getCategory().getId())
                                        .name(split.getCategory().getName())
                                        .color(split.getCategory().getColor())
                                        .icon(split.getCategory().getIcon())
                                        .build())
                                .build())
                        .collect(Collectors.toList())
                : Collections.emptyList();

        return TransactionResponse.builder()
                .id(transaction.getId())
                .description(transaction.getDescription())
                .amount(transaction.getAmount())
                .date(transaction.getDate())
                .type(transaction.getType())
                .status(transaction.getStatus())
                .notes(transaction.getNotes())
                .receiptUrl(transaction.getReceiptUrl())
                .isRecurring(transaction.isRecurring())
                .recurrenceFrequency(transaction.getRecurrenceFrequency())
                .recurrenceEndDate(transaction.getRecurrenceEndDate())
                .account(accountInfo)
                .destinationAccount(destAccountInfo)
                .category(categoryInfo)
                .tags(tagInfos)
                .splits(splitInfos)
                .installmentGroupId(transaction.getInstallmentGroup() != null
                    ? transaction.getInstallmentGroup().getId() : null)
                .installmentIndex(transaction.getInstallmentIndex())
                .installmentTotal(transaction.getInstallmentGroup() != null
                    ? transaction.getInstallmentGroup().getTotalInstallments() : null)
                .createdAt(transaction.getCreatedAt())
                .updatedAt(transaction.getUpdatedAt())
                .build();
    }

    public TransactionResponse toResponse(Transaction transaction) {
        return mapToResponse(transaction);
    }
}
