package com.codeguard.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewRequest {

    @NotBlank(message = "Code is required")
    @Size(max = 100000, message = "Code must not exceed 100,000 characters")
    private String code;

    @NotBlank(message = "Language is required")
    private String language;

    private String fileName;
}
