package com.codeguard.controller;

import com.codeguard.dto.ApiResponse;
import com.codeguard.dto.GithubConnectRequest;
import com.codeguard.dto.GithubRepoDto;
import com.codeguard.dto.PrReviewRequest;
import com.codeguard.dto.PullRequestDto;
import com.codeguard.dto.ReviewResponse;
import com.codeguard.service.GithubService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/github")
@RequiredArgsConstructor
public class GithubController {

    private final GithubService githubService;

    @PostMapping("/connect")
    public ResponseEntity<ApiResponse<Void>> connectGithub(
            @Valid @RequestBody GithubConnectRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        githubService.connectGithub(request, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("GitHub connected successfully", null));
    }

    @GetMapping("/repos")
    public ResponseEntity<ApiResponse<List<GithubRepoDto>>> getRepositories(
            @AuthenticationPrincipal UserDetails userDetails) {
        List<GithubRepoDto> repos = githubService.getUserRepositories(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Repositories fetched", repos));
    }

    @GetMapping("/repos/{owner}/{repo}/pulls")
    public ResponseEntity<ApiResponse<List<PullRequestDto>>> getPullRequests(
            @PathVariable String owner,
            @PathVariable String repo,
            @AuthenticationPrincipal UserDetails userDetails) {
        List<PullRequestDto> prs =
                githubService.getPullRequests(owner, repo, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Pull requests fetched", prs));
    }

    @PostMapping("/review-pr")
    public ResponseEntity<ApiResponse<ReviewResponse>> reviewPullRequest(
            @Valid @RequestBody PrReviewRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        ReviewResponse response =
                githubService.reviewPullRequest(request, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("PR review complete", response));
    }
}
