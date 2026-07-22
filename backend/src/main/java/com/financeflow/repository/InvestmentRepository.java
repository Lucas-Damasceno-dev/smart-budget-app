package com.financeflow.repository;

import com.financeflow.entity.Investment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Repository
public interface InvestmentRepository extends JpaRepository<Investment, UUID> {

    @Query("SELECT i FROM Investment i LEFT JOIN FETCH i.account WHERE i.user.id = :userId")
    List<Investment> findByUserId(UUID userId);

    List<Investment> findByUserIdAndType(UUID userId, Investment.InvestmentType type);

    List<Investment> findByAccountId(UUID accountId);

    @Query("SELECT SUM(i.currentValue) FROM Investment i WHERE i.user.id = :userId")
    BigDecimal getTotalInvestmentValue(UUID userId);

    @Query("SELECT SUM(i.totalInvested) FROM Investment i WHERE i.user.id = :userId")
    BigDecimal getTotalInvested(UUID userId);

    @Query("SELECT SUM(i.dividendsReceived) FROM Investment i WHERE i.user.id = :userId")
    BigDecimal getTotalDividends(UUID userId);

    @Query("SELECT i.type, SUM(i.currentValue) FROM Investment i WHERE i.user.id = :userId GROUP BY i.type")
    List<Object[]> getPortfolioDistribution(UUID userId);
}
