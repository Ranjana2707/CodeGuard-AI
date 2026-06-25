package com.codeguard.service;

import com.codeguard.dto.ActivityLogDto;
import com.codeguard.dto.AnalyticsDto;
import com.codeguard.dto.DailyCountDto;
import com.codeguard.dto.DashboardStatsDto;
import com.codeguard.dto.ReviewSummaryDto;
import com.codeguard.dto.SeverityCountDto;
import com.codeguard.dto.VulnTypeDto;
import com.codeguard.entity.ReviewIssue;
import com.codeguard.entity.User;
import com.codeguard.exception.ResourceNotFoundException;
import com.codeguard.repository.ActivityLogRepository;
import com.codeguard.repository.ReviewIssueRepository;
import com.codeguard.repository.ReviewRepository;
import com.codeguard.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final UserRepository userRepository;
    private final ReviewRepository reviewRepository;
    private final ReviewIssueRepository issueRepository;
    private final ActivityLogRepository activityLogRepository;

    public DashboardStatsDto getStats(String username) {
        User user = getUser(username);

        long totalReviews   = reviewRepository.countByUser(user);
        long criticalIssues = issueRepository.countByReviewUserAndSeverity(user, ReviewIssue.Severity.CRITICAL);

        List<ReviewSummaryDto> recentReviews = reviewRepository
                .findTop10ByUserOrderByCreatedAtDesc(user, PageRequest.of(0, 10))
                .stream()
                .map(r -> ReviewSummaryDto.builder()
                        .id(r.getId())
                        .fileName(r.getFileName())
                        .language(r.getLanguage())
                        .securityScore(r.getSecurityScore())
                        .issueCount(0)
                        .createdAt(r.getCreatedAt())
                        .status(r.getStatus().name())
                        .build())
                .collect(Collectors.toList());

        return DashboardStatsDto.builder()
                .totalReviews(totalReviews)
                .criticalIssues(criticalIssues)
                .issuesFixed(Math.round(totalReviews * 0.72))
                .activePRs(3L)
                .totalRepositories(4L)
                .recentReviews(recentReviews)
                .build();
    }

    public AnalyticsDto getAnalytics(String username, int days) {
        User user = getUser(username);
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("MMM dd");

        // Build daily counts for the last N days
        List<DailyCountDto> reviewsOverTime = IntStream.range(0, Math.min(days, 30))
                .mapToObj(i -> {
                    LocalDateTime dayStart = LocalDateTime.now()
                            .minusDays(days - i - 1L)
                            .toLocalDate()
                            .atStartOfDay();
                    long count = reviewRepository.countByUserAndCreatedAtAfter(user, dayStart);
                    return DailyCountDto.builder()
                            .date(dayStart.format(fmt))
                            .count(count)
                            .build();
                })
                .collect(Collectors.toList());

        // Issues by severity
        List<SeverityCountDto> bySeverity = Arrays.stream(ReviewIssue.Severity.values())
                .map(sev -> SeverityCountDto.builder()
                        .severity(sev.name())
                        .count(issueRepository.countByReviewUserAndSeverity(user, sev))
                        .build())
                .collect(Collectors.toList());

        // Top vulnerability types (aggregated static data for demo; replace with real DB query as needed)
        List<VulnTypeDto> topVulns = List.of(
                new VulnTypeDto("SQL Injection", 24),
                new VulnTypeDto("Hardcoded Credentials", 18),
                new VulnTypeDto("XSS", 15),
                new VulnTypeDto("Insecure Deserialization", 12),
                new VulnTypeDto("Broken Authentication", 10)
        );

        return AnalyticsDto.builder()
                .reviewsOverTime(reviewsOverTime)
                .issuesBySeverity(bySeverity)
                .topVulnerabilities(topVulns)
                .build();
    }

    public List<ActivityLogDto> getActivityLog(String username) {
        User user = getUser(username);
        return activityLogRepository
                .findByUserOrderByCreatedAtDesc(user, PageRequest.of(0, 20))
                .stream()
                .map(log -> ActivityLogDto.builder()
                        .id(log.getId())
                        .action(log.getAction())
                        .details(log.getDetails())
                        .createdAt(log.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    private User getUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
