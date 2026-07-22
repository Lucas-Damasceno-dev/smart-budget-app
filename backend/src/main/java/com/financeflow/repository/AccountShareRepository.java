package com.financeflow.repository;

import com.financeflow.entity.AccountShare;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AccountShareRepository extends JpaRepository<AccountShare, UUID> {
    List<AccountShare> findByOwnerUserId(UUID ownerUserId);
    List<AccountShare> findBySharedWithUserId(UUID sharedWithUserId);
    List<AccountShare> findBySharedWithEmail(String email);
    Optional<AccountShare> findByAccountIdAndSharedWithEmail(UUID accountId, String email);
}
