package com.financeflow.repository;

import com.financeflow.entity.Goal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Repository
public interface GoalRepository extends JpaRepository<Goal, UUID> {

    List<Goal> findByUserId(UUID userId);

    List<Goal> findByUserIdAndStatus(UUID userId, Goal.GoalStatus status);

    @Query("SELECT SUM(g.targetAmount) FROM Goal g WHERE g.user.id = :userId")
    BigDecimal getTotalTargetAmount(UUID userId);

    @Query("SELECT SUM(g.currentAmount) FROM Goal g WHERE g.user.id = :userId")
    BigDecimal getTotalCurrentAmount(UUID userId);
}
