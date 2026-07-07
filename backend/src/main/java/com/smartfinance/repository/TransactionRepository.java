package com.smartfinance.repository;

import com.smartfinance.entity.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    Page<Transaction> findByUserId(Long userId, Pageable pageable);
    
    // For dashboard & summaries
    List<Transaction> findByUserIdAndTransactionDateBetween(Long userId, java.time.LocalDate startDate, java.time.LocalDate endDate);

    @org.springframework.data.jpa.repository.Query("SELECT t FROM Transaction t WHERE t.user.id = :userId " +
           "AND (:type IS NULL OR t.type = :type) " +
           "AND (:categoryId IS NULL OR t.category.id = :categoryId) " +
           "AND (:startDate IS NULL OR t.transactionDate >= :startDate) " +
           "AND (:endDate IS NULL OR t.transactionDate <= :endDate) " +
           "AND (:note IS NULL OR LOWER(t.note) LIKE :note)")
    Page<Transaction> findFilteredTransactions(
           @org.springframework.data.repository.query.Param("userId") Long userId,
           @org.springframework.data.repository.query.Param("type") String type,
           @org.springframework.data.repository.query.Param("categoryId") Long categoryId,
           @org.springframework.data.repository.query.Param("startDate") java.time.LocalDate startDate,
           @org.springframework.data.repository.query.Param("endDate") java.time.LocalDate endDate,
           @org.springframework.data.repository.query.Param("note") String note,
           Pageable pageable);

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.user.id = :userId " +
           "AND t.category.id = :categoryId AND t.type = 'EXPENSE' " +
           "AND t.transactionDate >= :startDate AND t.transactionDate <= :endDate")
    java.math.BigDecimal sumExpensesByCategoryAndMonth(
           @org.springframework.data.repository.query.Param("userId") Long userId,
           @org.springframework.data.repository.query.Param("categoryId") Long categoryId,
           @org.springframework.data.repository.query.Param("startDate") java.time.LocalDate startDate,
           @org.springframework.data.repository.query.Param("endDate") java.time.LocalDate endDate);
}
