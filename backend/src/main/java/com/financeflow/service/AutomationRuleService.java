package com.financeflow.service;

import com.financeflow.dto.automation.AutomationRuleRequest;
import com.financeflow.dto.automation.AutomationRuleResponse;
import com.financeflow.entity.Account;
import com.financeflow.entity.AutomationRule;
import com.financeflow.entity.Category;
import com.financeflow.entity.Transaction;
import com.financeflow.exception.BadRequestException;
import com.financeflow.exception.ResourceNotFoundException;
import com.financeflow.repository.AccountRepository;
import com.financeflow.repository.AutomationRuleRepository;
import com.financeflow.repository.CategoryRepository;
import com.financeflow.repository.TransactionRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AutomationRuleService {

    private final AutomationRuleRepository ruleRepo;
    private final CategoryRepository categoryRepo;
    private final AccountRepository accountRepo;
    private final TransactionRepository transactionRepo;

    @Transactional
    public AutomationRuleResponse createRule(AutomationRuleRequest request, UUID userId) {
        AutomationRule rule = AutomationRule.builder()
                .name(request.getName())
                .description(request.getDescription())
                .conditionField(request.getConditionField())
                .conditionOperator(request.getConditionOperator())
                .conditionValue(request.getConditionValue())
                .setCategoryId(request.getSetCategoryId())
                .setAccountId(request.getSetAccountId())
                .setDescription(request.getSetDescription())
                .setTags(request.getSetTags())
                .setAsTransfer(request.getSetAsTransfer() != null ? request.getSetAsTransfer() : false)
                .priority(request.getPriority() != null ? request.getPriority() : 0)
                .enabled(request.getEnabled() != null ? request.getEnabled() : true)
                .userId(userId)
                .build();

        rule = ruleRepo.save(rule);
        return toResponse(rule);
    }

    @Transactional
    public AutomationRuleResponse updateRule(UUID id, AutomationRuleRequest request, UUID userId) {
        AutomationRule rule = findByIdAndUser(id, userId);

        rule.setName(request.getName());
        rule.setDescription(request.getDescription());
        rule.setConditionField(request.getConditionField());
        rule.setConditionOperator(request.getConditionOperator());
        rule.setConditionValue(request.getConditionValue());
        rule.setSetCategoryId(request.getSetCategoryId());
        rule.setSetAccountId(request.getSetAccountId());
        rule.setSetDescription(request.getSetDescription());
        rule.setSetTags(request.getSetTags());
        if (request.getSetAsTransfer() != null) rule.setSetAsTransfer(request.getSetAsTransfer());
        if (request.getPriority() != null) rule.setPriority(request.getPriority());
        if (request.getEnabled() != null) rule.setEnabled(request.getEnabled());

        rule = ruleRepo.save(rule);
        return toResponse(rule);
    }

    @Transactional
    public void deleteRule(UUID id, UUID userId) {
        AutomationRule rule = findByIdAndUser(id, userId);
        ruleRepo.delete(rule);
    }

    public AutomationRuleResponse getRule(UUID id, UUID userId) {
        return toResponse(findByIdAndUser(id, userId));
    }

    public List<AutomationRuleResponse> listRules(UUID userId) {
        return ruleRepo.findByUserIdOrderByPriorityAsc(userId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public AutomationRuleResponse toggleRule(UUID id, UUID userId) {
        AutomationRule rule = findByIdAndUser(id, userId);
        rule.setEnabled(!Boolean.TRUE.equals(rule.getEnabled()));
        rule = ruleRepo.save(rule);
        return toResponse(rule);
    }

    public void applyRulesToTransaction(Transaction transaction) {
        if (transaction == null || transaction.getUser() == null) return;

        List<AutomationRule> rules = ruleRepo
                .findByUserIdAndEnabledTrueOrderByPriorityAsc(transaction.getUser().getId());

        for (AutomationRule rule : rules) {
            if (evaluateCondition(rule, transaction)) {
                applyActions(rule, transaction);
                log.debug("Rule '{}' applied to transaction '{}'", rule.getName(), transaction.getDescription());
            }
        }
    }

    @Transactional
    public int applyRulesToExistingTransactions(UUID userId, LocalDate startDate, LocalDate endDate) {
        List<Transaction> transactions = transactionRepo.findByUserIdAndDateBetween(userId, startDate, endDate);
        List<AutomationRule> rules = ruleRepo.findByUserIdAndEnabledTrueOrderByPriorityAsc(userId);

        if (rules.isEmpty()) return 0;

        int modifiedCount = 0;
        for (Transaction tx : transactions) {
            boolean modified = false;
            for (AutomationRule rule : rules) {
                if (evaluateCondition(rule, tx)) {
                    applyActions(rule, tx);
                    modified = true;
                }
            }
            if (modified) {
                transactionRepo.save(tx);
                modifiedCount++;
            }
        }

        log.info("Applied rules to {} transactions for user {}", modifiedCount, userId);
        return modifiedCount;
    }

    private boolean evaluateCondition(AutomationRule rule, Transaction tx) {
        String fieldValue = getFieldValue(rule.getConditionField(), tx);
        if (fieldValue == null) return false;

        String conditionValue = rule.getConditionValue();
        if (conditionValue == null) return false;

        return switch (rule.getConditionOperator().toUpperCase()) {
            case "CONTAINS" -> fieldValue.toLowerCase().contains(conditionValue.toLowerCase());
            case "EQUALS" -> fieldValue.equalsIgnoreCase(conditionValue);
            case "STARTS_WITH" -> fieldValue.toLowerCase().startsWith(conditionValue.toLowerCase());
            case "ENDS_WITH" -> fieldValue.toLowerCase().endsWith(conditionValue.toLowerCase());
            case "GREATER_THAN" -> compareNumeric(fieldValue, conditionValue) > 0;
            case "LESS_THAN" -> compareNumeric(fieldValue, conditionValue) < 0;
            case "REGEX" -> fieldValue.matches(conditionValue);
            default -> false;
        };
    }

    private String getFieldValue(String field, Transaction tx) {
        if (field == null) return null;
        return switch (field.toUpperCase()) {
            case "DESCRIPTION" -> tx.getDescription();
            case "AMOUNT" -> tx.getAmount() != null ? tx.getAmount().toPlainString() : null;
            case "CATEGORY_NAME" -> tx.getCategory() != null ? tx.getCategory().getName() : "";
            case "CATEGORY_ID" -> tx.getCategory() != null ? tx.getCategory().getId().toString() : "";
            case "ACCOUNT_NAME" -> tx.getAccount() != null ? tx.getAccount().getName() : "";
            case "ACCOUNT_ID" -> tx.getAccount() != null ? tx.getAccount().getId().toString() : "";
            default -> null;
        };
    }

    private int compareNumeric(String a, String b) {
        try {
            BigDecimal numA = new BigDecimal(a.replaceAll("[^\\d.,-]", "").replace(",", "."));
            BigDecimal numB = new BigDecimal(b.replaceAll("[^\\d.,-]", "").replace(",", "."));
            return numA.compareTo(numB);
        } catch (NumberFormatException e) {
            return 0;
        }
    }

    private void applyActions(AutomationRule rule, Transaction tx) {
        if (rule.getSetCategoryId() != null) {
            categoryRepo.findById(rule.getSetCategoryId()).ifPresent(tx::setCategory);
        }
        if (rule.getSetAccountId() != null) {
            accountRepo.findById(rule.getSetAccountId()).ifPresent(tx::setAccount);
        }
        if (rule.getSetDescription() != null && !rule.getSetDescription().isBlank()) {
            tx.setDescription(rule.getSetDescription());
        }
        if (Boolean.TRUE.equals(rule.getSetAsTransfer())) {
            tx.setType(Category.TransactionType.TRANSFER);
        }
    }

    private AutomationRule findByIdAndUser(UUID id, UUID userId) {
        AutomationRule rule = ruleRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Automation rule not found"));
        if (!rule.getUserId().equals(userId)) {
            throw new ResourceNotFoundException("Automation rule not found");
        }
        return rule;
    }

    public AutomationRuleResponse toResponse(AutomationRule rule) {
        String categoryName = null;
        if (rule.getSetCategoryId() != null) {
            categoryName = categoryRepo.findById(rule.getSetCategoryId())
                    .map(Category::getName)
                    .orElse(null);
        }

        String accountName = null;
        if (rule.getSetAccountId() != null) {
            accountName = accountRepo.findById(rule.getSetAccountId())
                    .map(Account::getName)
                    .orElse(null);
        }

        return AutomationRuleResponse.builder()
                .id(rule.getId())
                .name(rule.getName())
                .description(rule.getDescription())
                .conditionField(rule.getConditionField())
                .conditionOperator(rule.getConditionOperator())
                .conditionValue(rule.getConditionValue())
                .setCategoryId(rule.getSetCategoryId())
                .setCategoryName(categoryName)
                .setAccountId(rule.getSetAccountId())
                .setAccountName(accountName)
                .setDescription(rule.getSetDescription())
                .setTags(rule.getSetTags())
                .setAsTransfer(rule.getSetAsTransfer())
                .priority(rule.getPriority())
                .enabled(rule.getEnabled())
                .createdAt(rule.getCreatedAt())
                .updatedAt(rule.getUpdatedAt())
                .build();
    }
}
