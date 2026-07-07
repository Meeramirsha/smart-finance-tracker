package com.smartfinance.controller;

import com.smartfinance.entity.Category;
import com.smartfinance.entity.Transaction;
import com.smartfinance.payload.response.CategoryBreakdownResponse;
import com.smartfinance.payload.response.DashboardSummaryResponse;
import com.smartfinance.payload.response.MonthlyTrendResponse;
import com.smartfinance.repository.TransactionRepository;
import com.smartfinance.security.services.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    TransactionRepository transactionRepository;

    @GetMapping("/summary")
    public ResponseEntity<DashboardSummaryResponse> getSummary(
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year,
            Authentication authentication) {

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        LocalDate now = LocalDate.now();
        int queryMonth = (month == null) ? now.getMonthValue() : month;
        int queryYear = (year == null) ? now.getYear() : year;

        LocalDate startDate = LocalDate.of(queryYear, queryMonth, 1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());

        List<Transaction> transactions = transactionRepository.findByUserIdAndTransactionDateBetween(
                userDetails.getId(), startDate, endDate);

        BigDecimal totalIncome = BigDecimal.ZERO;
        BigDecimal totalExpense = BigDecimal.ZERO;

        for (Transaction t : transactions) {
            if ("INCOME".equals(t.getType())) {
                totalIncome = totalIncome.add(t.getAmount());
            } else if ("EXPENSE".equals(t.getType())) {
                totalExpense = totalExpense.add(t.getAmount());
            }
        }

        BigDecimal balance = totalIncome.subtract(totalExpense);
        BigDecimal savingsRate = BigDecimal.ZERO;
        if (totalIncome.compareTo(BigDecimal.ZERO) > 0) {
            savingsRate = balance.multiply(new BigDecimal("100"))
                    .divide(totalIncome, 2, RoundingMode.HALF_UP);
        }

        return ResponseEntity.ok(DashboardSummaryResponse.builder()
                .totalIncome(totalIncome)
                .totalExpense(totalExpense)
                .balance(balance)
                .savingsRate(savingsRate)
                .build());
    }

    @GetMapping("/category-breakdown")
    public ResponseEntity<List<CategoryBreakdownResponse>> getCategoryBreakdown(
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year,
            Authentication authentication) {

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        LocalDate now = LocalDate.now();
        int queryMonth = (month == null) ? now.getMonthValue() : month;
        int queryYear = (year == null) ? now.getYear() : year;

        LocalDate startDate = LocalDate.of(queryYear, queryMonth, 1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());

        List<Transaction> expenses = transactionRepository.findByUserIdAndTransactionDateBetween(
                userDetails.getId(), startDate, endDate)
                .stream()
                .filter(t -> "EXPENSE".equals(t.getType()))
                .collect(Collectors.toList());

        BigDecimal totalExpense = expenses.stream()
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<Category, BigDecimal> categorySumMap = new HashMap<>();
        for (Transaction t : expenses) {
            Category category = t.getCategory();
            BigDecimal amount = t.getAmount();
            categorySumMap.put(category, categorySumMap.getOrDefault(category, BigDecimal.ZERO).add(amount));
        }

        List<CategoryBreakdownResponse> breakdown = new ArrayList<>();
        for (Map.Entry<Category, BigDecimal> entry : categorySumMap.entrySet()) {
            Category cat = entry.getKey();
            BigDecimal sum = entry.getValue();
            double percentage = 0.0;
            if (totalExpense.compareTo(BigDecimal.ZERO) > 0) {
                percentage = sum.multiply(new BigDecimal("100"))
                        .divide(totalExpense, 2, RoundingMode.HALF_UP).doubleValue();
            }

            breakdown.add(CategoryBreakdownResponse.builder()
                    .categoryName(cat != null ? cat.getName() : "Uncategorized")
                    .color(cat != null ? cat.getColor() : "#A0AEC0")
                    .icon(cat != null ? cat.getIcon() : "folder")
                    .amount(sum)
                    .percentage(percentage)
                    .build());
        }

        // Sort descending by amount
        breakdown.sort((a, b) -> b.getAmount().compareTo(a.getAmount()));

        return ResponseEntity.ok(breakdown);
    }

    @GetMapping("/monthly-trend")
    public ResponseEntity<List<MonthlyTrendResponse>> getMonthlyTrend(Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        // Fetch last 6 months
        LocalDate now = LocalDate.now();
        LocalDate startDate = now.minusMonths(5).withDayOfMonth(1);
        LocalDate endDate = now.withDayOfMonth(now.lengthOfMonth());

        List<Transaction> transactions = transactionRepository.findByUserIdAndTransactionDateBetween(
                userDetails.getId(), startDate, endDate);

        List<MonthlyTrendResponse> trend = new ArrayList<>();

        // Group by month and year
        for (int i = 5; i >= 0; i--) {
            LocalDate targetDate = now.minusMonths(i);
            int targetMonth = targetDate.getMonthValue();
            int targetYear = targetDate.getYear();

            BigDecimal totalIncome = BigDecimal.ZERO;
            BigDecimal totalExpense = BigDecimal.ZERO;

            for (Transaction t : transactions) {
                if (t.getTransactionDate().getMonthValue() == targetMonth && t.getTransactionDate().getYear() == targetYear) {
                    if ("INCOME".equals(t.getType())) {
                        totalIncome = totalIncome.add(t.getAmount());
                    } else if ("EXPENSE".equals(t.getType())) {
                        totalExpense = totalExpense.add(t.getAmount());
                    }
                }
            }

            String monthName = targetDate.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH);

            trend.add(MonthlyTrendResponse.builder()
                    .monthName(monthName)
                    .month(targetMonth)
                    .year(targetYear)
                    .totalIncome(totalIncome)
                    .totalExpense(totalExpense)
                    .build());
        }

        return ResponseEntity.ok(trend);
    }

    @GetMapping("/recent-transactions")
    public ResponseEntity<List<Transaction>> getRecentTransactions(Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Pageable pageable = PageRequest.of(0, 5, Sort.by("transactionDate").descending().and(Sort.by("id").descending()));
        
        Page<Transaction> page = transactionRepository.findFilteredTransactions(
                userDetails.getId(),
                null, null, null, null, null,
                pageable
        );

        return ResponseEntity.ok(page.getContent());
    }
}
