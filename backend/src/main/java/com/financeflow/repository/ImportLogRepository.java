package com.financeflow.repository;

import com.financeflow.entity.ImportLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ImportLogRepository extends JpaRepository<ImportLog, UUID> {
    List<ImportLog> findByUserIdOrderByCreatedAtDesc(UUID userId);
    List<ImportLog> findByUserIdAndStatus(UUID userId, String status);
    Optional<ImportLog> findByIdAndUserId(UUID id, UUID userId);
}
