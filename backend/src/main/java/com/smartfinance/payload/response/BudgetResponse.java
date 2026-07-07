package com.smartfinance.payload.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class BudgetResponse {
    private Long id;
    private Long categoryId;
    private String categoryName;
    private String categoryColor;
    private String categoryIcon;
    private BigDecimal monthlyLimit;
    private BigDecimal usedAmount;
    private Integer month;
    private Integer year;
    private String riskStatus; // SAFE, WATCHFUL, OVERSPENDING
}
