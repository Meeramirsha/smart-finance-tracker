package com.smartfinance.payload.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class TransactionRequest {
    @NotNull(message = "Amount is required")
    private BigDecimal amount;

    @NotBlank(message = "Type is required")
    @Pattern(regexp = "^(INCOME|EXPENSE)$", message = "Type must be either INCOME or EXPENSE")
    private String type;

    private Long categoryId;

    private String note;

    @NotNull(message = "Transaction date is required")
    private LocalDate transactionDate;
}
