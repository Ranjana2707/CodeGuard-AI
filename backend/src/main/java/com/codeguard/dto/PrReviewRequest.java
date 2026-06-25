package com.codeguard.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PrReviewRequest {

    @NotBlank(message = "Owner is required")
    private String owner;

    @NotBlank(message = "Repository name is required")
    private String repo;

    @NotNull(message = "PR number is required")
    private Integer prNumber;
}
