package com.codeguard.controller;

import com.codeguard.dto.ApiResponse;
import com.codeguard.dto.ReviewRequest;
import com.codeguard.dto.ReviewResponse;
import com.codeguard.dto.ReviewSummaryDto;
import com.codeguard.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping("/analyze")
    public ResponseEntity<ApiResponse<ReviewResponse>> analyzeCode(
            @Valid @RequestBody ReviewRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        ReviewResponse response = reviewService.analyzeCode(request, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Analysis complete", response));
    }

    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<ReviewResponse>> analyzeFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("language") String language,
            @AuthenticationPrincipal UserDetails userDetails) {
        ReviewResponse response = reviewService.analyzeFile(file, language, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("File analysis complete", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<ReviewSummaryDto>>> getUserReviews(
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC)
            Pageable pageable,
            @AuthenticationPrincipal UserDetails userDetails) {
        Page<ReviewSummaryDto> reviews =
                reviewService.getUserReviews(userDetails.getUsername(), pageable);
        return ResponseEntity.ok(ApiResponse.success("Reviews fetched", reviews));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ReviewResponse>> getReview(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        ReviewResponse response = reviewService.getReview(id, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Review fetched", response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteReview(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        reviewService.deleteReview(id, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Review deleted", null));
    }
}
