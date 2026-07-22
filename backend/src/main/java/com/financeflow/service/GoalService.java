package com.financeflow.service;

import com.financeflow.dto.goal.GoalDepositRequest;
import com.financeflow.dto.goal.GoalRequest;
import com.financeflow.dto.goal.GoalResponse;
import com.financeflow.entity.Goal;
import com.financeflow.entity.User;
import com.financeflow.exception.ResourceNotFoundException;
import com.financeflow.repository.GoalRepository;
import com.financeflow.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GoalService {

    private final GoalRepository goalRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    @Cacheable(value = "goals", key = "#userId")
    public List<GoalResponse> getGoals(UUID userId) {
        return goalRepository.findByUserId(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public GoalResponse getGoal(UUID id, UUID userId) {
        Goal goal = findGoalByIdAndUser(id, userId);
        return mapToResponse(goal);
    }

    @Transactional
    @CacheEvict(value = "goals", key = "#userId")
    public GoalResponse createGoal(GoalRequest request, UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        BigDecimal currentAmount = request.getCurrentAmount() != null ? request.getCurrentAmount() : BigDecimal.ZERO;
        Goal.GoalStatus status = request.getStatus() != null ? request.getStatus() : Goal.GoalStatus.IN_PROGRESS;

        if (currentAmount.compareTo(request.getTargetAmount()) >= 0) {
            status = Goal.GoalStatus.COMPLETED;
        }

        Goal goal = Goal.builder()
                .name(request.getName())
                .targetAmount(request.getTargetAmount())
                .currentAmount(currentAmount)
                .targetDate(request.getTargetDate())
                .color(request.getColor() != null ? request.getColor() : "#2563eb")
                .icon(request.getIcon() != null ? request.getIcon() : "flag")
                .status(status)
                .user(user)
                .build();

        goal = goalRepository.save(goal);
        return mapToResponse(goal);
    }

    @Transactional
    @CacheEvict(value = "goals", key = "#userId")
    public GoalResponse updateGoal(UUID id, GoalRequest request, UUID userId) {
        Goal goal = findGoalByIdAndUser(id, userId);

        goal.setName(request.getName());
        goal.setTargetAmount(request.getTargetAmount());
        if (request.getCurrentAmount() != null) {
            goal.setCurrentAmount(request.getCurrentAmount());
        }
        goal.setTargetDate(request.getTargetDate());
        if (request.getColor() != null) goal.setColor(request.getColor());
        if (request.getIcon() != null) goal.setIcon(request.getIcon());
        if (request.getStatus() != null) goal.setStatus(request.getStatus());

        if (goal.getCurrentAmount().compareTo(goal.getTargetAmount()) >= 0) {
            goal.setStatus(Goal.GoalStatus.COMPLETED);
        }

        goal = goalRepository.save(goal);
        return mapToResponse(goal);
    }

    @Transactional
    @CacheEvict(value = "goals", key = "#userId")
    public GoalResponse depositToGoal(UUID id, GoalDepositRequest request, UUID userId) {
        Goal goal = findGoalByIdAndUser(id, userId);
        BigDecimal newAmount = goal.getCurrentAmount().add(request.getAmount());
        goal.setCurrentAmount(newAmount);

        if (newAmount.compareTo(goal.getTargetAmount()) >= 0) {
            goal.setStatus(Goal.GoalStatus.COMPLETED);
        }

        goal = goalRepository.save(goal);
        return mapToResponse(goal);
    }

    @Transactional
    @CacheEvict(value = "goals", key = "#userId")
    public void deleteGoal(UUID id, UUID userId) {
        Goal goal = findGoalByIdAndUser(id, userId);
        goalRepository.delete(goal);
    }

    private Goal findGoalByIdAndUser(UUID id, UUID userId) {
        Goal goal = goalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found"));

        if (!goal.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Goal not found");
        }

        return goal;
    }

    private GoalResponse mapToResponse(Goal g) {
        return GoalResponse.builder()
                .id(g.getId())
                .name(g.getName())
                .targetAmount(g.getTargetAmount())
                .currentAmount(g.getCurrentAmount())
                .remainingAmount(g.getRemainingAmount())
                .progressPercentage(g.getProgressPercentage())
                .targetDate(g.getTargetDate())
                .color(g.getColor())
                .icon(g.getIcon())
                .status(g.getStatus())
                .createdAt(g.getCreatedAt())
                .updatedAt(g.getUpdatedAt())
                .build();
    }
}
