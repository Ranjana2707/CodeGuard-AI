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
public class AnalyticsDto {
    private List<DailyCountDto> reviewsOverTime;
    private List<SeverityCountDto> issuesBySeverity;
    private List<LanguageCountDto> reviewsByLanguage;
    private List<VulnTypeDto> topVulnerabilities;
}
