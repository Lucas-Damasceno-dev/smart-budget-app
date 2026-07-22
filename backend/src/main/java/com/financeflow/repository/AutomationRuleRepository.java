package com.financeflow.repository;

import com.financeflow.entity.AutomationRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AutomationRuleRepository extends JpaRepository<AutomationRule, UUID> {
    List<AutomationRule> findByUserIdOrderByPriorityAsc(UUID userId);
    List<AutomationRule> findByUserIdAndEnabledTrueOrderByPriorityAsc(UUID userId);
}
