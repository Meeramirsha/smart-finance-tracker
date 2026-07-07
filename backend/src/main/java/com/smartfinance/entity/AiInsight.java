package com.smartfinance.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "ai_insights")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiInsight {
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

    @Column(name = "insight_text", nullable = false, columnDefinition = "TEXT")
    private String insightText;
    
    @Column(name = "mood_status")
    private String moodStatus; // stable, warning, strong

    @CreationTimestamp
    private LocalDateTime createdAt;
}
