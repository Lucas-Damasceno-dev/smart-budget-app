package com.financeflow.repository;

import com.financeflow.entity.Family;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface FamilyRepository extends JpaRepository<Family, UUID> {

    Optional<Family> findByOwnerId(UUID ownerId);
}
