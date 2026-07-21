package com.financeflow.repository;

import com.financeflow.entity.Budget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, UUID> {

    List<Budget> findByUserIdAndMonthAndYear(UUID userId, int month, int year);

    Optional<Budget> findByCategoryIdAndMonthAndYear(UUID categoryId, int month, int year);

    @Query("SELECT b FROM Budget b WHERE b.user.id = :userId AND b.month = :month AND b.year = :year AND b.spentAmount >= b.limitAmount * 0.8")
    List<Budget> findBudgetsNearLimit(UUID userId, int month, int year);

    @Query("SELECT b FROM Budget b JOIN FETCH b.category WHERE b.user.id = :userId AND b.month = :month AND b.year = :year")
    List<Budget> findByUserIdAndMonthAndYearWithCategory(UUID userId, int month, int year);
}
