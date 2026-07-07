package com.smartfinance.controller;

import com.smartfinance.entity.Budget;
import com.smartfinance.entity.Category;
import com.smartfinance.entity.User;
import com.smartfinance.payload.request.BudgetRequest;
import com.smartfinance.payload.response.BudgetResponse;
import com.smartfinance.payload.response.MessageResponse;
import com.smartfinance.repository.BudgetRepository;
import com.smartfinance.repository.CategoryRepository;
import com.smartfinance.repository.TransactionRepository;
import com.smartfinance.repository.UserRepository;
import com.smartfinance.security.services.UserDetailsImpl;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/budgets")
public class BudgetController {

    @Autowired
    BudgetRepository budgetRepository;

    @Autowired
    CategoryRepository categoryRepository;

    @Autowired
    TransactionRepository transactionRepository;

    @Autowired
    UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<BudgetResponse>> getBudgets(
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year,
            Authentication authentication) {

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        LocalDate now = LocalDate.now();
        int queryMonth = (month == null) ? now.getMonthValue() : month;
        int queryYear = (year == null) ? now.getYear() : year;

        List<Budget> budgets = budgetRepository.findByUserIdAndMonthAndYear(userDetails.getId(), queryMonth, queryYear);
        List<BudgetResponse> responses = new ArrayList<>();

        for (Budget budget : budgets) {
            responses.add(buildBudgetResponse(budget, queryMonth, queryYear));
        }

        return ResponseEntity.ok(responses);
    }

    @PostMapping
    public ResponseEntity<?> createOrUpdateBudget(@Valid @RequestBody BudgetRequest request, Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        User user = userRepository.findById(userDetails.getId()).orElse(null);

        if (user == null) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: User not found!"));
        }

        Category category = categoryRepository.findById(request.getCategoryId()).orElse(null);
        if (category == null || !category.getUser().getId().equals(user.getId())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Invalid category selected"));
        }

        // Check if budget already exists for this category, month, and year
        Budget budget = budgetRepository.findByUserIdAndCategoryIdAndMonthAndYear(
                user.getId(),
                category.getId(),
                request.getMonth(),
                request.getYear()
        ).orElse(null);

        if (budget != null) {
            // Update existing budget
            budget.setMonthlyLimit(request.getMonthlyLimit());
        } else {
            // Create new budget
            budget = Budget.builder()
                    .user(user)
                    .category(category)
                    .monthlyLimit(request.getMonthlyLimit())
                    .month(request.getMonth())
                    .year(request.getYear())
                    .build();
        }

        budgetRepository.save(budget);

        return ResponseEntity.ok(buildBudgetResponse(budget, request.getMonth(), request.getYear()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateBudget(
            @PathVariable Long id,
            @RequestParam BigDecimal monthlyLimit,
            Authentication authentication) {

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Budget budget = budgetRepository.findById(id).orElse(null);

        if (budget == null || !budget.getUser().getId().equals(userDetails.getId())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Budget not found or unauthorized"));
        }

        budget.setMonthlyLimit(monthlyLimit);
        budgetRepository.save(budget);

        return ResponseEntity.ok(buildBudgetResponse(budget, budget.getMonth(), budget.getYear()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBudget(@PathVariable Long id, Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Budget budget = budgetRepository.findById(id).orElse(null);

        if (budget == null || !budget.getUser().getId().equals(userDetails.getId())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Budget not found or unauthorized"));
        }

        budgetRepository.delete(budget);
        return ResponseEntity.ok(new MessageResponse("Budget deleted successfully!"));
    }

    private BudgetResponse buildBudgetResponse(Budget budget, int month, int year) {
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());

        BigDecimal usedAmount = transactionRepository.sumExpensesByCategoryAndMonth(
                budget.getUser().getId(),
                budget.getCategory().getId(),
                startDate,
                endDate
        );

        if (usedAmount == null) {
            usedAmount = BigDecimal.ZERO;
        }

        String riskStatus = "SAFE";
        if (budget.getMonthlyLimit().compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal ratio = usedAmount.divide(budget.getMonthlyLimit(), 2, RoundingMode.HALF_UP);
            if (ratio.compareTo(new BigDecimal("1.0")) > 0) {
                riskStatus = "OVERSPENDING";
            } else if (ratio.compareTo(new BigDecimal("0.7")) > 0) {
                riskStatus = "WATCHFUL";
            }
        }

        return BudgetResponse.builder()
                .id(budget.getId())
                .categoryId(budget.getCategory().getId())
                .categoryName(budget.getCategory().getName())
                .categoryColor(budget.getCategory().getColor())
                .categoryIcon(budget.getCategory().getIcon())
                .monthlyLimit(budget.getMonthlyLimit())
                .usedAmount(usedAmount)
                .month(month)
                .year(year)
                .riskStatus(riskStatus)
                .build();
    }
}
