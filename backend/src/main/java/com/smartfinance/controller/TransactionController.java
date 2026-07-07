package com.smartfinance.controller;

import com.smartfinance.entity.Category;
import com.smartfinance.entity.Transaction;
import com.smartfinance.entity.User;
import com.smartfinance.payload.request.TransactionRequest;
import com.smartfinance.payload.response.MessageResponse;
import com.smartfinance.repository.CategoryRepository;
import com.smartfinance.repository.TransactionRepository;
import com.smartfinance.repository.UserRepository;
import com.smartfinance.security.services.UserDetailsImpl;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    @Autowired
    TransactionRepository transactionRepository;

    @Autowired
    CategoryRepository categoryRepository;

    @Autowired
    UserRepository userRepository;

    @GetMapping
    public ResponseEntity<Page<Transaction>> getTransactions(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "transactionDate") String sortBy,
            @RequestParam(defaultValue = "desc") String direction,
            Authentication authentication) {

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        Sort sort = direction.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        // Map empty string filters to null
        String typeFilter = (type == null || type.trim().isEmpty()) ? null : type;
        String noteFilter = (search == null || search.trim().isEmpty()) ? null : "%" + search.trim().toLowerCase() + "%";

        Page<Transaction> transactions = transactionRepository.findFilteredTransactions(
                userDetails.getId(),
                typeFilter,
                categoryId,
                startDate,
                endDate,
                noteFilter,
                pageable
        );

        return ResponseEntity.ok(transactions);
    }

    @PostMapping
    public ResponseEntity<?> createTransaction(@Valid @RequestBody TransactionRequest request, Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        User user = userRepository.findById(userDetails.getId()).orElse(null);

        if (user == null) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: User not found!"));
        }

        Category category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId()).orElse(null);
            if (category == null || !category.getUser().getId().equals(user.getId())) {
                return ResponseEntity.badRequest().body(new MessageResponse("Error: Invalid category selected"));
            }
        }

        Transaction transaction = Transaction.builder()
                .amount(request.getAmount())
                .type(request.getType())
                .category(category)
                .note(request.getNote())
                .transactionDate(request.getTransactionDate())
                .user(user)
                .build();

        transactionRepository.save(transaction);
        return ResponseEntity.ok(transaction);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateTransaction(
            @PathVariable Long id,
            @Valid @RequestBody TransactionRequest request,
            Authentication authentication) {

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Transaction transaction = transactionRepository.findById(id).orElse(null);

        if (transaction == null || !transaction.getUser().getId().equals(userDetails.getId())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Transaction not found or unauthorized"));
        }

        Category category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId()).orElse(null);
            if (category == null || !category.getUser().getId().equals(userDetails.getId())) {
                return ResponseEntity.badRequest().body(new MessageResponse("Error: Invalid category selected"));
            }
        }

        transaction.setAmount(request.getAmount());
        transaction.setType(request.getType());
        transaction.setCategory(category);
        transaction.setNote(request.getNote());
        transaction.setTransactionDate(request.getTransactionDate());

        transactionRepository.save(transaction);
        return ResponseEntity.ok(transaction);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTransaction(@PathVariable Long id, Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Transaction transaction = transactionRepository.findById(id).orElse(null);

        if (transaction == null || !transaction.getUser().getId().equals(userDetails.getId())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Transaction not found or unauthorized"));
        }

        transactionRepository.delete(transaction);
        return ResponseEntity.ok(new MessageResponse("Transaction deleted successfully!"));
    }
}
