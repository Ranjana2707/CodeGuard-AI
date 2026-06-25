package com.codeguard.service;

import com.codeguard.dto.GithubConnectRequest;
import com.codeguard.dto.GithubRepoDto;
import com.codeguard.dto.PrReviewRequest;
import com.codeguard.dto.PullRequestDto;
import com.codeguard.dto.ReviewResponse;
import com.codeguard.entity.User;
import com.codeguard.exception.BadRequestException;
import com.codeguard.exception.ResourceNotFoundException;
import com.codeguard.repository.UserRepository;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class GithubService {

    private final UserRepository userRepository;
    private final AiReviewService aiReviewService;
    private final RestTemplate restTemplate;

    private static final String GITHUB_API = "https://api.github.com";

    @Transactional
    public void connectGithub(GithubConnectRequest request, String username) {
        User user = getUser(username);

        // Validate token against GitHub API
        try {
            HttpHeaders headers = buildGithubHeaders(request.getToken());
            ResponseEntity<JsonNode> response = restTemplate.exchange(
                    GITHUB_API + "/user",
                    HttpMethod.GET,
                    new HttpEntity<>(headers),
                    JsonNode.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                String githubUsername = response.getBody().path("login").asText();
                user.setGithubToken(request.getToken());
                user.setGithubUsername(githubUsername);
                userRepository.save(user);
            }
        } catch (Exception e) {
            log.warn("GitHub token validation failed: {}", e.getMessage());
            throw new BadRequestException("Invalid GitHub token: " + e.getMessage());
        }
    }

    public List<GithubRepoDto> getUserRepositories(String username) {
        User user = getUser(username);

        if (user.getGithubToken() == null) {
            throw new BadRequestException("GitHub not connected. Please connect your GitHub account first.");
        }

        try {
            HttpHeaders headers = buildGithubHeaders(user.getGithubToken());
            ResponseEntity<JsonNode[]> response = restTemplate.exchange(
                    GITHUB_API + "/user/repos?per_page=50&sort=updated",
                    HttpMethod.GET,
                    new HttpEntity<>(headers),
                    JsonNode[].class);

            if (response.getBody() == null) {
                return Collections.emptyList();
            }

            return Arrays.stream(response.getBody())
                    .map(repo -> GithubRepoDto.builder()
                            .id(repo.path("id").asLong())
                            .name(repo.path("name").asText())
                            .fullName(repo.path("full_name").asText())
                            .language(repo.path("language").asText("Unknown"))
                            .defaultBranch(repo.path("default_branch").asText("main"))
                            .connected(false)
                            .build())
                    .collect(Collectors.toList());

        } catch (Exception e) {
            log.error("Failed to fetch GitHub repos for {}: {}", username, e.getMessage());
            return Collections.emptyList();
        }
    }

    public List<PullRequestDto> getPullRequests(String owner, String repo, String username) {
        User user = getUser(username);

        if (user.getGithubToken() == null) {
            throw new BadRequestException("GitHub not connected");
        }

        try {
            HttpHeaders headers = buildGithubHeaders(user.getGithubToken());
            String url = String.format("%s/repos/%s/%s/pulls?state=open", GITHUB_API, owner, repo);
            ResponseEntity<JsonNode[]> response = restTemplate.exchange(
                    url, HttpMethod.GET, new HttpEntity<>(headers), JsonNode[].class);

            if (response.getBody() == null) {
                return Collections.emptyList();
            }

            return Arrays.stream(response.getBody())
                    .map(pr -> PullRequestDto.builder()
                            .number(pr.path("number").asInt())
                            .title(pr.path("title").asText())
                            .state(pr.path("state").asText())
                            .author(pr.path("user").path("login").asText())
                            .branch(pr.path("head").path("ref").asText())
                            .changedFiles(pr.path("changed_files").asInt())
                            .createdAt(pr.path("created_at").asText())
                            .build())
                    .collect(Collectors.toList());

        } catch (Exception e) {
            log.error("Failed to fetch PRs for {}/{}: {}", owner, repo, e.getMessage());
            return Collections.emptyList();
        }
    }

    public ReviewResponse reviewPullRequest(PrReviewRequest request, String username) {
        User user = getUser(username);

        if (user.getGithubToken() == null) {
            throw new BadRequestException("GitHub not connected");
        }

        String diff = fetchPrDiff(
                request.getOwner(), request.getRepo(),
                request.getPrNumber(), user.getGithubToken());

        String reviewFileName = String.format("PR #%d — %s/%s",
                request.getPrNumber(), request.getOwner(), request.getRepo());

        return aiReviewService.analyzeCode(diff, "diff", reviewFileName);
    }

    // ── Helpers ─────────────────────────────────────────────────────────

    private String fetchPrDiff(String owner, String repo, int prNumber, String token) {
        HttpHeaders headers = buildGithubHeaders(token);
        headers.set("Accept", "application/vnd.github.v3.diff");
        String url = String.format("%s/repos/%s/%s/pulls/%d", GITHUB_API, owner, repo, prNumber);
        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    url, HttpMethod.GET, new HttpEntity<>(headers), String.class);
            return response.getBody() != null ? response.getBody() : "";
        } catch (Exception e) {
            log.error("Failed to fetch PR diff for PR #{}: {}", prNumber, e.getMessage());
            return "# PR diff unavailable\n";
        }
    }

    private HttpHeaders buildGithubHeaders(String token) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + token);
        headers.set("Accept", "application/vnd.github+json");
        headers.set("X-GitHub-Api-Version", "2022-11-28");
        return headers;
    }

    private User getUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
