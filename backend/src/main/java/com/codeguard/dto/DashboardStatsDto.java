package com.codeguard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDto {
    private long totalReviews;
    private long criticalIssues;
    private long issuesFixed;
    private long activePRs;
    private long totalRepositories;
    private List<ReviewSummaryDto> recentReviews;
}
