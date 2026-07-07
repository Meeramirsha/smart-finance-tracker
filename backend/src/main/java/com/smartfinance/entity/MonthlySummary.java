package com.smartfinance.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "monthly_summaries")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MonthlySummary {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private Integer month;

    @Column(nullable = false)
    private Integer year;

    @Column(name = "total_income", nullable = false)
    private BigDecimal totalIncome;

    @Column(name = "total_expense", nullable = false)
    private BigDecimal totalExpense;

    @Column(nullable = false)
    private BigDecimal balance;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
