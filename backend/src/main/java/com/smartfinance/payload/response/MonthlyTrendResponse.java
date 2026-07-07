package com.smartfinance.payload.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MonthlyTrendResponse {
    private String monthName;
    private Integer month;
    private Integer year;
    private BigDecimal totalIncome;
    private BigDecimal totalExpense;
}
