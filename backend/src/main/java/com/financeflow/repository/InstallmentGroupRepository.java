package com.financeflow.repository;

import com.financeflow.entity.InstallmentGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface InstallmentGroupRepository extends JpaRepository<InstallmentGroup, UUID> {
    List<InstallmentGroup> findByUserIdAndStatus(UUID userId, InstallmentGroup.InstallmentStatus status);
    List<InstallmentGroup> findByUserIdOrderByCreatedAtDesc(UUID userId);
}
