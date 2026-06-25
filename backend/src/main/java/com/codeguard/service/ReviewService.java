package com.codeguard.service;

import com.codeguard.dto.IssueDto;
import com.codeguard.dto.ReviewRequest;
import com.codeguard.dto.ReviewResponse;
import com.codeguard.dto.ReviewSummaryDto;
import com.codeguard.entity.Review;
import com.codeguard.entity.ReviewIssue;
import com.codeguard.entity.User;
import com.codeguard.exception.BadRequestException;
import com.codeguard.exception.ResourceNotFoundException;
import com.codeguard.repository.ReviewIssueRepository;
import com.codeguard.repository.ReviewRepository;
import com.codeguard.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ReviewIssueRepository issueRepository;
    private final UserRepository userRepository;
    private final AiReviewService aiReviewService;
    private final ActivityLogService activityLogService;

    @Transactional
    public ReviewResponse analyzeCode(ReviewRequest request, String username) {
        User user = getUser(username);

        Review review = Review.builder()
                .user(user)
                .sourceType(Review.SourceType.PASTE)
                .codeContent(request.getCode())
                .language(request.getLanguage())
                .fileName(request.getFileName() != null
                        ? request.getFileName()
                        : "snippet." + request.getLanguage())
                .status(Review.ReviewStatus.IN_PROGRESS)
                .build();
        review = reviewRepository.save(review);

        ReviewResponse aiResult = aiReviewService.analyzeCode(
                request.getCode(), request.getLanguage(), review.getFileName());

        return persistAndBuildResponse(review, aiResult);
    }

    @Transactional
    public ReviewResponse analyzeFile(MultipartFile file, String language, String username) {
        User user = getUser(username);

        if (file.isEmpty()) {
            throw new BadRequestException("Uploaded file is empty");
        }

        String code;
        try {
            code = new String(file.getBytes(), StandardCharsets.UTF_8);
        } catch (IOException e) {
            throw new RuntimeException("Failed to read uploaded file: " + e.getMessage());
        }

        Review review = Review.builder()
                .user(user)
                .sourceType(Review.SourceType.FILE_UPLOAD)
                .codeContent(code)
                .language(language)
                .fileName(file.getOriginalFilename())
                .status(Review.ReviewStatus.IN_PROGRESS)
                .build();
        review = reviewRepository.save(review);

        ReviewResponse aiResult = aiReviewService.analyzeCode(code, language, file.getOriginalFilename());
        return persistAndBuildResponse(review, aiResult);
    }

    private ReviewResponse persistAndBuildResponse(Review review, ReviewResponse aiResult) {
        review.setSummary(aiResult.getSummary());
        review.setSecurityScore(aiResult.getSecurityScore());
        review.setStatus(Review.ReviewStatus.COMPLETED);
        review = reviewRepository.save(review);

        if (aiResult.getIssues() != null && !aiResult.getIssues().isEmpty()) {
            Review savedReview = review;
            List<ReviewIssue> issues = aiResult.getIssues().stream()
                    .map(dto -> {
                        ReviewIssue.Severity sev;
                        try {
                            sev = ReviewIssue.Severity.valueOf(
                                    dto.getSeverity().toUpperCase());
                        } catch (IllegalArgumentException e) {
                            sev = ReviewIssue.Severity.LOW;
                        }
                        return ReviewIssue.builder()
                                .review(savedReview)
                                .title(dto.getTitle())
                                .severity(sev)
                                .issueType(dto.getIssueType())
                                .lineNumber(dto.getLineNumber())
                                .description(dto.getDescription())
                                .fixSuggestion(dto.getFixSuggestion())
                                .cweId(dto.getCweId())
                                .build();
                    })
                    .collect(Collectors.toList());
            issueRepository.saveAll(issues);
        }

        aiResult.setId(review.getId());
        aiResult.setCreatedAt(review.getCreatedAt());
        return aiResult;
    }

    public Page<ReviewSummaryDto> getUserReviews(String username, Pageable pageable) {
        User user = getUser(username);
        return reviewRepository.findByUser(user, pageable)
                .map(this::mapToSummaryDto);
    }

    public ReviewResponse getReview(Long id, String username) {
        User user = getUser(username);
        Review review = reviewRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));
        return mapToReviewResponse(review);
    }

    @Transactional
    public void deleteReview(Long id, String username) {
        User user = getUser(username);
        Review review = reviewRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));
        reviewRepository.delete(review);
    }

    // ── Helpers ─────────────────────────────────────────────────────────

    private User getUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private ReviewSummaryDto mapToSummaryDto(Review review) {
        long count = issueRepository.countByReview(review);
        String topSev = issueRepository.findTopSeverityByReview(review);
        return ReviewSummaryDto.builder()
                .id(review.getId())
                .fileName(review.getFileName())
                .language(review.getLanguage())
                .issueCount((int) count)
                .securityScore(review.getSecurityScore())
                .topSeverity(topSev)
                .createdAt(review.getCreatedAt())
                .status(review.getStatus().name())
                .build();
    }

    private ReviewResponse mapToReviewResponse(Review review) {
        List<IssueDto> issues = (review.getIssues() == null) ? Collections.emptyList() :
                review.getIssues().stream()
                        .map(i -> IssueDto.builder()
                                .id(i.getId())
                                .title(i.getTitle())
                                .severity(i.getSeverity().name())
                                .issueType(i.getIssueType())
                                .lineNumber(i.getLineNumber())
                                .description(i.getDescription())
                                .fixSuggestion(i.getFixSuggestion())
                                .cweId(i.getCweId())
                                .build())
                        .collect(Collectors.toList());

        return ReviewResponse.builder()
                .id(review.getId())
                .summary(review.getSummary())
                .securityScore(review.getSecurityScore())
                .language(review.getLanguage())
                .fileName(review.getFileName())
                .issues(issues)
                .createdAt(review.getCreatedAt())
                .status(review.getStatus().name())
                .build();
    }
}
