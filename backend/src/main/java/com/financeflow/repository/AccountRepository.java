package com.financeflow.repository;

import com.financeflow.entity.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Repository
public interface AccountRepository extends JpaRepository<Account, UUID> {

    List<Account> findByUserIdAndActiveTrue(UUID userId);

    List<Account> findByUserId(UUID userId);

    @Query("SELECT SUM(a.currentBalance) FROM Account a WHERE a.user.id = :userId AND a.active = true")
    BigDecimal getTotalBalance(UUID userId);

    @Query("SELECT a FROM Account a WHERE a.user.id = :userId AND a.type = :type AND a.active = true")
    List<Account> findByUserIdAndType(UUID userId, Account.AccountType type);

    boolean existsByIdAndUserId(UUID id, UUID userId);
}
