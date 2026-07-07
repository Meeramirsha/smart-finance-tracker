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
public class CategoryBreakdownResponse {
    private String categoryName;
    private String color;
    private String icon;
    private BigDecimal amount;
    private double percentage;
}
