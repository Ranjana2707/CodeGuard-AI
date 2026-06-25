package com.codeguard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewSummaryDto {
    private Long id;
    private String fileName;
    private String language;
    private Integer issueCount;
    private Integer securityScore;
    private String topSeverity;
    private LocalDateTime createdAt;
    private String status;
}
