package com.codeguard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewResponse {
    private Long id;
    private String summary;
    private Integer securityScore;
    private String language;
    private String fileName;
    private List<IssueDto> issues;
    private LocalDateTime createdAt;
    private String status;
}
