package com.financeflow.repository;

import com.financeflow.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CategoryRepository extends JpaRepository<Category, UUID> {

    List<Category> findByUserIdAndActiveTrue(UUID userId);

    List<Category> findByUserIdAndTypeAndActiveTrue(UUID userId, Category.TransactionType type);

    List<Category> findByUserIdIsNullAndIsDefaultTrue();

    @Query("SELECT c FROM Category c WHERE c.user.id = :userId AND c.parent IS NULL AND c.active = true")
    List<Category> findRootCategoriesByUserId(UUID userId);

    @Query("SELECT c FROM Category c LEFT JOIN FETCH c.subcategories WHERE c.id = :id")
    Optional<Category> findByIdWithSubcategories(UUID id);

    boolean existsByIdAndUserId(UUID id, UUID userId);
}
