package com.financeflow.repository;

import com.financeflow.entity.Category;
import com.financeflow.entity.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, UUID>, JpaSpecificationExecutor<Transaction> {

    Page<Transaction> findByUserId(UUID userId, Pageable pageable);

    Page<Transaction> findByAccountId(UUID accountId, Pageable pageable);

    @Query("SELECT t FROM Transaction t WHERE t.user.id = :userId AND t.date BETWEEN :startDate AND :endDate")
    List<Transaction> findByUserIdAndDateBetween(UUID userId, LocalDate startDate, LocalDate endDate);

    @Query("SELECT t FROM Transaction t WHERE t.account.id = :accountId AND t.date BETWEEN :startDate AND :endDate")
    List<Transaction> findByAccountIdAndDateBetween(UUID accountId, LocalDate startDate, LocalDate endDate);

    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.user.id = :userId AND t.type = :type AND t.date BETWEEN :startDate AND :endDate")
    BigDecimal sumByUserIdAndTypeAndDateBetween(UUID userId, Category.TransactionType type, LocalDate startDate, LocalDate endDate);

    @Query("SELECT t.category.id, t.category.name, SUM(t.amount) as total " +
           "FROM Transaction t WHERE t.user.id = :userId AND t.type = :type AND t.date BETWEEN :startDate AND :endDate " +
           "GROUP BY t.category.id, t.category.name ORDER BY total DESC")
    List<Object[]> getTopCategoriesByUserAndType(UUID userId, Category.TransactionType type, LocalDate startDate, LocalDate endDate, Pageable pageable);

    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.category.id = :categoryId AND t.date BETWEEN :startDate AND :endDate")
    BigDecimal sumByCategoryIdAndDateBetween(UUID categoryId, LocalDate startDate, LocalDate endDate);

    List<Transaction> findByIsRecurringTrueAndRecurrenceEndDateGreaterThanEqual(LocalDate date);

    @Query("SELECT t FROM Transaction t WHERE t.user.id = :userId AND t.isRecurring = true")
    List<Transaction> findRecurringByUserId(UUID userId);

    @Query("SELECT COUNT(t) FROM Transaction t WHERE t.user.id = :userId AND t.date BETWEEN :startDate AND :endDate")
    long countByUserIdAndDateBetween(UUID userId, LocalDate startDate, LocalDate endDate);
}
