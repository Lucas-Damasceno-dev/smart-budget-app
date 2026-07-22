package com.financeflow.repository;

import com.financeflow.entity.Subscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, UUID> {
    List<Subscription> findByUserId(UUID userId);
    List<Subscription> findByUserIdAndStatus(UUID userId, Subscription.SubscriptionStatus status);

    @Query("SELECT s FROM Subscription s WHERE s.status = :status AND s.nextBillingDate <= :date")
    List<Subscription> findByStatusAndNextBillingDateLessThanOrEqual(Subscription.SubscriptionStatus status, LocalDate date);
}
