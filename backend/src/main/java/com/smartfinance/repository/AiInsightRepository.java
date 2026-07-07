package com.smartfinance.repository;

import com.smartfinance.entity.AiInsight;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AiInsightRepository extends JpaRepository<AiInsight, Long> {
    Optional<AiInsight> findByUserIdAndMonthAndYear(Long userId, Integer month, Integer year);
}
