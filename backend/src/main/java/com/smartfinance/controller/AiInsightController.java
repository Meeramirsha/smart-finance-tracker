package com.smartfinance.controller;

import com.smartfinance.entity.AiInsight;
import com.smartfinance.entity.Transaction;
import com.smartfinance.payload.response.MessageResponse;
import com.smartfinance.repository.AiInsightRepository;
import com.smartfinance.repository.TransactionRepository;
import com.smartfinance.security.services.UserDetailsImpl;
import com.smartfinance.service.GeminiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/ai")
public class AiInsightController {

    @Autowired
    AiInsightRepository aiInsightRepository;

    @Autowired
    TransactionRepository transactionRepository;

    @Autowired
    GeminiService geminiService;

    @GetMapping("/insights")
    public ResponseEntity<?> getInsights(
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year,
            Authentication authentication) {

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        LocalDate now = LocalDate.now();
        int queryMonth = (month == null) ? now.getMonthValue() : month;
        int queryYear = (year == null) ? now.getYear() : year;

        // Check if insight already exists
        AiInsight insight = aiInsightRepository.findByUserIdAndMonthAndYear(
                userDetails.getId(), queryMonth, queryYear).orElse(null);

        if (insight == null) {
            // Generate new one
            insight = generateAndSaveInsight(userDetails, queryMonth, queryYear);
        }

        return ResponseEntity.ok(insight);
    }

    @PostMapping("/generate-insight")
    public ResponseEntity<?> forceGenerateInsight(
            @RequestParam Integer month,
            @RequestParam Integer year,
            Authentication authentication) {

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        AiInsight insight = generateAndSaveInsight(userDetails, month, year);
        return ResponseEntity.ok(insight);
    }

    private AiInsight generateAndSaveInsight(UserDetailsImpl userDetails, int month, int year) {
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());

        List<Transaction> transactions = transactionRepository.findByUserIdAndTransactionDateBetween(
                userDetails.getId(), startDate, endDate);

        BigDecimal totalIncome = BigDecimal.ZERO;
        BigDecimal totalExpense = BigDecimal.ZERO;
        StringBuilder transactionSummary = new StringBuilder();

        for (Transaction t : transactions) {
            BigDecimal amt = t.getAmount();
            String catName = t.getCategory() != null ? t.getCategory().getName() : "Uncategorized";
            if ("INCOME".equals(t.getType())) {
                totalIncome = totalIncome.add(amt);
            } else {
                totalExpense = totalExpense.add(amt);
            }
            transactionSummary.append(String.format("- %s: $%s for '%s' on %s\n",
                    t.getType(), amt, t.getNote() != null ? t.getNote() : "", t.getTransactionDate()));
        }

        String prompt = "You are an expert financial assistant. Analyze this user's monthly budget and spending data:\n" +
                "Month: " + month + "/" + year + "\n" +
                "Total Income: $" + totalIncome + "\n" +
                "Total Expenses: $" + totalExpense + "\n" +
                "Transactions Log:\n" + transactionSummary.toString() + "\n" +
                "Please construct a plain-English money story (mood-based spending summary) explaining overspending, savings opportunities, and leaks (especially repeated small spends like snacks, delivery, subscriptions).\n" +
                "You MUST return ONLY a valid, single-line or clean raw JSON block conforming strictly to this format:\n" +
                "{\n" +
                "  \"mood\": \"stable\" or \"warning\" or \"strong\",\n" +
                "  \"moneyStory\": \"Write a friendly paragraph summarizing the month's spending behavior and what they did well or poorly.\",\n" +
                "  \"leaks\": [\"list repeated small expenses or leaks detected\"],\n" +
                "  \"savingsChallenge\": \"A tiny, micro-actionable challenge for next week to save money in an invisible way (e.g. brew coffee at home, cook on Sunday).\",\n" +
                "  \"recommendations\": [\"List 2 actionable steps the user should take next\"]\n" +
                "}\n" +
                "Do not wrap the JSON output in any markdown block (like ```json). Respond with the raw JSON string only.";

        String insightJson = geminiService.generateInsight(prompt);

        // Simple parse to extract mood Status from the generated JSON
        String moodStatus = "stable";
        if (insightJson.contains("\"mood\": \"warning\"")) {
            moodStatus = "warning";
        } else if (insightJson.contains("\"mood\": \"strong\"")) {
            moodStatus = "strong";
        }

        // Save to DB
        AiInsight insight = aiInsightRepository.findByUserIdAndMonthAndYear(
                userDetails.getId(), month, year).orElse(null);

        if (insight == null) {
            insight = AiInsight.builder()
                    .user(com.smartfinance.entity.User.builder().id(userDetails.getId()).build())
                    .month(month)
                    .year(year)
                    .insightText(insightJson)
                    .moodStatus(moodStatus)
                    .build();
        } else {
            insight.setInsightText(insightJson);
            insight.setMoodStatus(moodStatus);
        }

        return aiInsightRepository.save(insight);
    }
}
