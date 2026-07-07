package com.smartfinance.payload.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class BudgetRequest {
    @NotNull(message = "Category is required")
    private Long categoryId;

    @NotNull(message = "Monthly limit is required")
    private BigDecimal monthlyLimit;

    @NotNull(message = "Month is required")
    private Integer month;

    @NotNull(message = "Year is required")
    private Integer year;
}
