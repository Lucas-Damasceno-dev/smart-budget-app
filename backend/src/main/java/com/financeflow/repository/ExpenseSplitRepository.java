package com.financeflow.repository;

import com.financeflow.entity.ExpenseSplit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ExpenseSplitRepository extends JpaRepository<ExpenseSplit, UUID> {
    List<ExpenseSplit> findByPayerUserId(UUID payerUserId);
    List<ExpenseSplit> findByDebtorUserId(UUID debtorUserId);
    List<ExpenseSplit> findByDebtorEmail(String email);
    List<ExpenseSplit> findByPayerUserIdOrDebtorUserId(UUID payerId, UUID debtorId);
}
