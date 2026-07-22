package com.financeflow.service;

import com.financeflow.dto.installment.InstallmentEditRequest;
import com.financeflow.dto.installment.InstallmentRequest;
import com.financeflow.dto.installment.InstallmentResponse;
import com.financeflow.entity.*;
import com.financeflow.exception.BadRequestException;
import com.financeflow.exception.ResourceNotFoundException;
import com.financeflow.repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Caching;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.*;

@Service
@RequiredArgsConstructor
public class InstallmentService {

    private final InstallmentGroupRepository groupRepo;
    private final TransactionRepository transactionRepo;
    private final AccountRepository accountRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final TagRepository tagRepository;
    private final AccountService accountService;

    @Transactional
    @Caching(evict = {
        @CacheEvict(value = "dashboard", key = "#userId"),
        @CacheEvict(value = "accounts", key = "#userId")
    })
    public InstallmentResponse createInstallment(InstallmentRequest request, UUID userId) {
        Account account = accountRepository.findById(request.getAccountId())
            .orElseThrow(() -> new ResourceNotFoundException("Account not found"));
        Category category = categoryRepository.findById(request.getCategoryId())
            .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!account.getUser().getId().equals(userId)) {
            throw new BadRequestException("Account does not belong to user");
        }
        if (!category.getUser().getId().equals(userId)) {
            throw new BadRequestException("Category does not belong to user");
        }

        int n = request.getTotalInstallments();
        BigDecimal installmentAmount = calculateInstallmentAmount(
            request.getTotalAmount(), request.getInterestRate(), n);

        InstallmentGroup group = InstallmentGroup.builder()
            .description(request.getDescription())
            .totalAmount(request.getTotalAmount())
            .totalInstallments(n)
            .installmentNumber(1)
            .installmentAmount(installmentAmount)
            .interestRate(request.getInterestRate())
            .purchaseDate(request.getPurchaseDate())
            .status(InstallmentGroup.InstallmentStatus.ACTIVE)
            .account(account)
            .category(category)
            .user(user)
            .build();
        group = groupRepo.save(group);

        List<InstallmentResponse.InstallmentChildResponse> children = new ArrayList<>();
        InstallmentGroup finalGroup = group;

        // First installment: COMPLETED, on purchase date -> affects balance
        Transaction firstTx = Transaction.builder()
            .description(request.getDescription())
            .amount(installmentAmount)
            .date(request.getPurchaseDate())
            .type(Category.TransactionType.EXPENSE)
            .status(Transaction.TransactionStatus.COMPLETED)
            .account(account)
            .category(category)
            .user(user)
            .notes(request.getNotes())
            .installmentGroup(finalGroup)
            .installmentIndex(1)
            .build();
        firstTx = transactionRepo.save(firstTx);
        accountService.updateBalance(account.getId(), installmentAmount, false);

        children.add(mapToChildResponse(firstTx, 1, true));

        // Remaining installments: PENDING, future dates
        for (int i = 2; i <= n; i++) {
            BigDecimal amount = (i == n)
                ? request.getTotalAmount().subtract(installmentAmount.multiply(BigDecimal.valueOf(n - 1)))
                : installmentAmount;

            LocalDate dueDate = request.getPurchaseDate().plusMonths(i - 1);

            Transaction tx = Transaction.builder()
                .description(request.getDescription())
                .amount(amount)
                .date(dueDate)
                .type(Category.TransactionType.EXPENSE)
                .status(Transaction.TransactionStatus.PENDING)
                .account(account)
                .category(category)
                .user(user)
                .notes(request.getNotes())
                .installmentGroup(finalGroup)
                .installmentIndex(i)
                .build();

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
                tx.setTags(tags);
            }

            tx = transactionRepo.save(tx);
            children.add(mapToChildResponse(tx, i, false));
        }

        return buildResponse(finalGroup, children);
    }

    @Transactional
    @Caching(evict = {
        @CacheEvict(value = "dashboard", key = "#userId"),
        @CacheEvict(value = "accounts", key = "#userId")
    })
    public InstallmentResponse editInstallment(UUID groupId, InstallmentEditRequest request, UUID userId) {
        InstallmentGroup group = groupRepo.findById(groupId)
            .orElseThrow(() -> new ResourceNotFoundException("Installment group not found"));
        if (!group.getUser().getId().equals(userId)) {
            throw new BadRequestException("Group does not belong to user");
        }

        if (request.isEditAllRemaining()) {
            List<Transaction> pendingTx = transactionRepo
                .findByInstallmentGroupIdAndStatus(groupId, Transaction.TransactionStatus.PENDING);
            for (Transaction tx : pendingTx) {
                if (request.getDescription() != null) tx.setDescription(request.getDescription());
                if (request.getCategoryId() != null) {
                    Category cat = categoryRepository.findById(request.getCategoryId()).orElse(null);
                    if (cat != null) tx.setCategory(cat);
                }
                if (request.getNotes() != null) tx.setNotes(request.getNotes());
                if (request.getAccountId() != null) {
                    Account acc = accountRepository.findById(request.getAccountId()).orElse(null);
                    if (acc != null) tx.setAccount(acc);
                }
                if (request.getAmount() != null) tx.setAmount(request.getAmount());
                transactionRepo.save(tx);
            }
            if (request.getDescription() != null) group.setDescription(request.getDescription());
            if (request.getAmount() != null) {
                group.setInstallmentAmount(request.getAmount());
            }
            groupRepo.save(group);
        } else {
            if (request.getTransactionId() == null) {
                throw new BadRequestException("transactionId required when editAllRemaining=false");
            }
            Transaction tx = transactionRepo.findById(request.getTransactionId())
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));
            if (tx.getStatus() != Transaction.TransactionStatus.PENDING) {
                throw new BadRequestException("Can only edit PENDING installments");
            }
            if (request.getDescription() != null) tx.setDescription(request.getDescription());
            if (request.getCategoryId() != null) {
                Category cat = categoryRepository.findById(request.getCategoryId()).orElse(null);
                if (cat != null) tx.setCategory(cat);
            }
            if (request.getNotes() != null) tx.setNotes(request.getNotes());
            if (request.getAccountId() != null) {
                Account acc = accountRepository.findById(request.getAccountId()).orElse(null);
                if (acc != null) tx.setAccount(acc);
            }
            if (request.getAmount() != null) tx.setAmount(request.getAmount());
            transactionRepo.save(tx);
        }

        List<Transaction> allTx = transactionRepo.findByInstallmentGroupIdOrderByInstallmentIndexAsc(groupId);
        List<InstallmentResponse.InstallmentChildResponse> children = allTx.stream()
            .map(tx -> mapToChildResponse(tx, tx.getInstallmentIndex(),
                tx.getStatus() == Transaction.TransactionStatus.COMPLETED))
            .toList();

        return buildResponse(groupRepo.findById(groupId).orElse(group), children);
    }

    @Transactional
    @Caching(evict = {
        @CacheEvict(value = "dashboard", key = "#userId"),
        @CacheEvict(value = "accounts", key = "#userId")
    })
    public void cancelInstallmentGroup(UUID groupId, UUID userId) {
        InstallmentGroup group = groupRepo.findById(groupId)
            .orElseThrow(() -> new ResourceNotFoundException("Installment group not found"));
        if (!group.getUser().getId().equals(userId)) {
            throw new BadRequestException("Group does not belong to user");
        }

        List<Transaction> transactions = transactionRepo.findByInstallmentGroupIdOrderByInstallmentIndexAsc(groupId);
        for (Transaction tx : transactions) {
            if (tx.getStatus() == Transaction.TransactionStatus.PENDING) {
                tx.setStatus(Transaction.TransactionStatus.CANCELLED);
                transactionRepo.save(tx);
            }
        }
        group.setStatus(InstallmentGroup.InstallmentStatus.CANCELLED);
        groupRepo.save(group);
    }

    public InstallmentResponse getInstallmentGroup(UUID groupId, UUID userId) {
        InstallmentGroup group = groupRepo.findById(groupId)
            .orElseThrow(() -> new ResourceNotFoundException("Installment group not found"));
        if (!group.getUser().getId().equals(userId)) {
            throw new BadRequestException("Group does not belong to user");
        }
        List<Transaction> allTx = transactionRepo.findByInstallmentGroupIdOrderByInstallmentIndexAsc(groupId);
        List<InstallmentResponse.InstallmentChildResponse> children = allTx.stream()
            .map(tx -> mapToChildResponse(tx, tx.getInstallmentIndex(),
                tx.getStatus() == Transaction.TransactionStatus.COMPLETED))
            .toList();
        return buildResponse(group, children);
    }

    public List<InstallmentResponse> listInstallmentGroups(UUID userId) {
        List<InstallmentGroup> groups = groupRepo.findByUserIdOrderByCreatedAtDesc(userId);
        return groups.stream().map(g -> {
            List<Transaction> txs = transactionRepo.findByInstallmentGroupIdOrderByInstallmentIndexAsc(g.getId());
            List<InstallmentResponse.InstallmentChildResponse> children = txs.stream()
                .map(tx -> mapToChildResponse(tx, tx.getInstallmentIndex(),
                    tx.getStatus() == Transaction.TransactionStatus.COMPLETED))
                .toList();
            return buildResponse(g, children);
        }).toList();
    }

    private BigDecimal calculateInstallmentAmount(BigDecimal total, BigDecimal monthlyRate, int n) {
        if (monthlyRate == null || monthlyRate.compareTo(BigDecimal.ZERO) == 0) {
            return total.divide(BigDecimal.valueOf(n), 4, RoundingMode.HALF_UP);
        }
        // Tabela Price: PMT = PV * (r * (1+r)^n) / ((1+r)^n - 1)
        BigDecimal r = monthlyRate.divide(BigDecimal.valueOf(100), 10, RoundingMode.HALF_UP);
        BigDecimal onePlusR = BigDecimal.ONE.add(r);
        BigDecimal factorPow = onePlusR.pow(n);
        BigDecimal numerator = r.multiply(factorPow);
        BigDecimal denominator = factorPow.subtract(BigDecimal.ONE);
        return total.multiply(numerator).divide(denominator, 4, RoundingMode.HALF_UP);
    }

    private InstallmentResponse.InstallmentChildResponse mapToChildResponse(Transaction tx, int index, boolean paid) {
        return InstallmentResponse.InstallmentChildResponse.builder()
            .transactionId(tx.getId())
            .index(index)
            .amount(tx.getAmount())
            .dueDate(tx.getDate())
            .status(tx.getStatus())
            .paid(paid)
            .build();
    }

    private InstallmentResponse buildResponse(InstallmentGroup group, List<InstallmentResponse.InstallmentChildResponse> children) {
        return InstallmentResponse.builder()
            .id(group.getId())
            .description(group.getDescription())
            .totalAmount(group.getTotalAmount())
            .totalInstallments(group.getTotalInstallments())
            .currentInstallment(group.getInstallmentNumber())
            .installmentAmount(group.getInstallmentAmount())
            .interestRate(group.getInterestRate())
            .purchaseDate(group.getPurchaseDate())
            .status(group.getStatus())
            .accountId(group.getAccount().getId())
            .accountName(group.getAccount().getName())
            .categoryId(group.getCategory().getId())
            .categoryName(group.getCategory().getName())
            .installments(children)
            .createdAt(group.getCreatedAt())
            .updatedAt(group.getUpdatedAt())
            .build();
    }
}
