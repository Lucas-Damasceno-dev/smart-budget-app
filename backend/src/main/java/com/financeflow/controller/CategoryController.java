package com.financeflow.controller;

import com.financeflow.dto.category.CategoryRequest;
import com.financeflow.dto.category.CategoryResponse;
import com.financeflow.dto.common.ApiResponse;
import com.financeflow.entity.Category;
import com.financeflow.entity.User;
import com.financeflow.exception.ResourceNotFoundException;
import com.financeflow.repository.UserRepository;
import com.financeflow.service.CategoryService;
import com.financeflow.util.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/categories")
@RequiredArgsConstructor
@Tag(name = "Categories", description = "Transaction categories management")
@SecurityRequirement(name = "Bearer Authentication")
public class CategoryController {

    private final CategoryService categoryService;
    private final SecurityUtils securityUtils;
    private final UserRepository userRepository;

    @GetMapping
    @Operation(summary = "Get all categories")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getAllCategories() {
        UUID userId = securityUtils.getCurrentUserId();
        List<CategoryResponse> categories = categoryService.getAllCategories(userId);
        return ResponseEntity.ok(ApiResponse.success(categories));
    }

    @GetMapping("/by-type/{type}")
    @Operation(summary = "Get categories by type")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getCategoriesByType(
            @PathVariable Category.TransactionType type) {
        UUID userId = securityUtils.getCurrentUserId();
        List<CategoryResponse> categories = categoryService.getCategoriesByType(userId, type);
        return ResponseEntity.ok(ApiResponse.success(categories));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get category by ID")
    public ResponseEntity<ApiResponse<CategoryResponse>> getCategory(@PathVariable UUID id) {
        UUID userId = securityUtils.getCurrentUserId();
        CategoryResponse category = categoryService.getCategory(id, userId);
        return ResponseEntity.ok(ApiResponse.success(category));
    }

    @PostMapping
    @Operation(summary = "Create new category")
    public ResponseEntity<ApiResponse<CategoryResponse>> createCategory(
            @Valid @RequestBody CategoryRequest request) {
        UUID userId = securityUtils.getCurrentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        CategoryResponse category = categoryService.createCategory(request, userId, user);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(category, "Category created successfully"));
    }

    @PostMapping("/bulk")
    @Operation(summary = "Create multiple categories")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> createCategories(
            @Valid @RequestBody List<CategoryRequest> requests) {
        UUID userId = securityUtils.getCurrentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        List<CategoryResponse> categories = requests.stream()
                .map(request -> categoryService.createCategory(request, userId, user))
                .toList();
        
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(categories, "Categories created successfully"));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update category")
    public ResponseEntity<ApiResponse<CategoryResponse>> updateCategory(
            @PathVariable UUID id,
            @Valid @RequestBody CategoryRequest request) {
        UUID userId = securityUtils.getCurrentUserId();
        CategoryResponse category = categoryService.updateCategory(id, request, userId);
        return ResponseEntity.ok(ApiResponse.success(category, "Category updated successfully"));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete category")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable UUID id) {
        UUID userId = securityUtils.getCurrentUserId();
        categoryService.deleteCategory(id, userId);
        return ResponseEntity.ok(ApiResponse.success(null, "Category deleted successfully"));
    }
}
