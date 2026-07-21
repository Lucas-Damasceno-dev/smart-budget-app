package com.financeflow.service;

import com.financeflow.dto.category.CategoryRequest;
import com.financeflow.dto.category.CategoryResponse;
import com.financeflow.entity.Category;
import com.financeflow.entity.User;
import com.financeflow.exception.ResourceNotFoundException;
import com.financeflow.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    @Cacheable(value = "categories", key = "#userId")
    public List<CategoryResponse> getAllCategories(UUID userId) {
        return categoryRepository.findByUserIdAndActiveTrue(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<CategoryResponse> getCategoriesByType(UUID userId, Category.TransactionType type) {
        return categoryRepository.findByUserIdAndTypeAndActiveTrue(userId, type).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public CategoryResponse getCategory(UUID categoryId, UUID userId) {
        Category category = findCategoryByIdAndUser(categoryId, userId);
        return mapToResponse(category);
    }

    @Transactional
    @CacheEvict(value = "categories", key = "#userId")
    public CategoryResponse createCategory(CategoryRequest request, UUID userId, User user) {
        Category parent = null;
        if (request.getParentId() != null) {
            parent = categoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Parent category not found"));
        }

        Category category = Category.builder()
                .name(request.getName())
                .description(request.getDescription())
                .type(request.getType())
                .color(request.getColor())
                .icon(request.getIcon())
                .parent(parent)
                .monthlyBudget(request.getMonthlyBudget())
                .user(user)
                .active(true)
                .build();

        category = categoryRepository.save(category);
        return mapToResponse(category);
    }

    @Transactional
    @CacheEvict(value = "categories", key = "#userId")
    public CategoryResponse updateCategory(UUID categoryId, CategoryRequest request, UUID userId) {
        Category category = findCategoryByIdAndUser(categoryId, userId);

        category.setName(request.getName());
        category.setDescription(request.getDescription());
        category.setType(request.getType());
        category.setColor(request.getColor());
        category.setIcon(request.getIcon());
        category.setMonthlyBudget(request.getMonthlyBudget());

        if (request.getParentId() != null) {
            Category parent = categoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Parent category not found"));
            category.setParent(parent);
        } else {
            category.setParent(null);
        }

        category = categoryRepository.save(category);
        return mapToResponse(category);
    }

    @Transactional
    @CacheEvict(value = "categories", key = "#userId")
    public void deleteCategory(UUID categoryId, UUID userId) {
        Category category = findCategoryByIdAndUser(categoryId, userId);
        category.setActive(false);
        categoryRepository.save(category);
    }

    @Transactional
    public void createDefaultCategories(User user) {
        List<DefaultCategory> expenseCategories = Arrays.asList(
                new DefaultCategory("Alimentação", "#E74C3C", "restaurant", Category.TransactionType.EXPENSE),
                new DefaultCategory("Transporte", "#3498DB", "directions_car", Category.TransactionType.EXPENSE),
                new DefaultCategory("Moradia", "#9B59B6", "home", Category.TransactionType.EXPENSE),
                new DefaultCategory("Saúde", "#1ABC9C", "local_hospital", Category.TransactionType.EXPENSE),
                new DefaultCategory("Educação", "#F39C12", "school", Category.TransactionType.EXPENSE),
                new DefaultCategory("Lazer", "#E91E63", "sports_esports", Category.TransactionType.EXPENSE),
                new DefaultCategory("Vestuário", "#00BCD4", "checkroom", Category.TransactionType.EXPENSE),
                new DefaultCategory("Contas", "#FF5722", "receipt", Category.TransactionType.EXPENSE),
                new DefaultCategory("Outros", "#607D8B", "more_horiz", Category.TransactionType.EXPENSE)
        );

        List<DefaultCategory> incomeCategories = Arrays.asList(
                new DefaultCategory("Salário", "#27AE60", "payments", Category.TransactionType.INCOME),
                new DefaultCategory("Freelance", "#2ECC71", "work", Category.TransactionType.INCOME),
                new DefaultCategory("Investimentos", "#16A085", "trending_up", Category.TransactionType.INCOME),
                new DefaultCategory("Outros", "#1ABC9C", "attach_money", Category.TransactionType.INCOME)
        );

        for (DefaultCategory dc : expenseCategories) {
            Category category = Category.builder()
                    .name(dc.name)
                    .color(dc.color)
                    .icon(dc.icon)
                    .type(dc.type)
                    .user(user)
                    .isDefault(true)
                    .active(true)
                    .build();
            categoryRepository.save(category);
        }

        for (DefaultCategory dc : incomeCategories) {
            Category category = Category.builder()
                    .name(dc.name)
                    .color(dc.color)
                    .icon(dc.icon)
                    .type(dc.type)
                    .user(user)
                    .isDefault(true)
                    .active(true)
                    .build();
            categoryRepository.save(category);
        }

        // Transfer category
        Category transferCategory = Category.builder()
                .name("Transferência")
                .color("#2196F3")
                .icon("swap_horiz")
                .type(Category.TransactionType.TRANSFER)
                .user(user)
                .isDefault(true)
                .active(true)
                .build();
        categoryRepository.save(transferCategory);
    }

    private Category findCategoryByIdAndUser(UUID categoryId, UUID userId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        if (category.getUser() != null && !category.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Category not found");
        }

        return category;
    }

    private CategoryResponse mapToResponse(Category category) {
        List<CategoryResponse> subcategories = null;
        if (category.getSubcategories() != null && !category.getSubcategories().isEmpty()) {
            subcategories = category.getSubcategories().stream()
                    .filter(Category::isActive)
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());
        }

        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .type(category.getType())
                .color(category.getColor())
                .icon(category.getIcon())
                .active(category.isActive())
                .isDefault(category.isDefault())
                .monthlyBudget(category.getMonthlyBudget())
                .parentId(category.getParent() != null ? category.getParent().getId() : null)
                .parentName(category.getParent() != null ? category.getParent().getName() : null)
                .subcategories(subcategories)
                .createdAt(category.getCreatedAt())
                .updatedAt(category.getUpdatedAt())
                .build();
    }

    private record DefaultCategory(String name, String color, String icon, Category.TransactionType type) {}
}
