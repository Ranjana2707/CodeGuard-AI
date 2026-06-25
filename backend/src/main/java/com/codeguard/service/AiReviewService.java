package com.codeguard.service;

import com.codeguard.dto.IssueDto;
import com.codeguard.dto.ReviewResponse;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiReviewService {

    @Value("${app.ai.api-key}")
    private String apiKey;

    @Value("${app.ai.model:claude-sonnet-4-20250514}")
    private String model;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    private static final String ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
    private static final int MAX_CODE_LENGTH = 4000;
    private static final int MAX_RETRIES = 3;

    public ReviewResponse analyzeCode(String code, String language, String fileName) {
        String prompt = buildSecurityPrompt(code, language);
        Exception lastException = null;

        for (int attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                String rawResponse = callAnthropicApi(prompt);
                return parseAiResponse(rawResponse, language, fileName);
            } catch (Exception e) {
                lastException = e;
                log.warn("AI analysis attempt {}/{} failed for {}: {}",
                        attempt, MAX_RETRIES, fileName, e.getMessage());
                if (attempt < MAX_RETRIES) {
                    try {
                        Thread.sleep(1000L * attempt); // exponential backoff
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        break;
                    }
                }
            }
        }

        log.error("AI analysis failed for {} after {} attempts", fileName, MAX_RETRIES, lastException);
        return ReviewResponse.builder()
                .summary("Analysis failed after " + MAX_RETRIES + " attempts. Please try again.")
                .securityScore(0)
                .language(language)
                .fileName(fileName)
                .issues(Collections.emptyList())
                .status("FAILED")
                .build();
    }

    private String callAnthropicApi(String prompt) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("x-api-key", apiKey);
        headers.set("anthropic-version", "2023-06-01");

        Map<String, Object> message = new HashMap<>();
        message.put("role", "user");
        message.put("content", prompt);

        Map<String, Object> body = new HashMap<>();
        body.put("model", model);
        body.put("max_tokens", 2048);
        body.put("messages", List.of(message));

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        ResponseEntity<JsonNode> response = restTemplate.exchange(
                ANTHROPIC_API_URL, HttpMethod.POST, entity, JsonNode.class);

        if (response.getStatusCode() != HttpStatus.OK || response.getBody() == null) {
            throw new RuntimeException("Anthropic API returned non-200 status: " + response.getStatusCode());
        }

        JsonNode content = response.getBody().path("content");
        if (!content.isArray() || content.isEmpty()) {
            throw new RuntimeException("Empty content array in Anthropic API response");
        }

        return content.get(0).path("text").asText("");
    }

    private ReviewResponse parseAiResponse(String rawText, String language, String fileName) {
        try {
            // Strip markdown fences if present
            String cleaned = rawText.replaceAll("```json", "").replaceAll("```", "").trim();

            // Extract the first JSON object
            int start = cleaned.indexOf('{');
            int end   = cleaned.lastIndexOf('}');
            if (start < 0 || end <= start) {
                throw new IllegalArgumentException("No JSON object found in AI response");
            }
            cleaned = cleaned.substring(start, end + 1);

            JsonNode root = objectMapper.readTree(cleaned);

            List<IssueDto> issues = new ArrayList<>();
            JsonNode issuesNode = root.path("issues");
            if (issuesNode.isArray()) {
                for (JsonNode issue : issuesNode) {
                    Integer lineNumber = null;
                    JsonNode lineNode = issue.path("line");
                    if (!lineNode.isNull() && lineNode.isNumber()) {
                        lineNumber = lineNode.asInt();
                    }

                    issues.add(IssueDto.builder()
                            .title(issue.path("title").asText("Security Issue"))
                            .severity(normaliseSeverity(issue.path("severity").asText("MEDIUM")))
                            .issueType(issue.path("type").asText("Security"))
                            .lineNumber(lineNumber)
                            .description(issue.path("description").asText())
                            .fixSuggestion(issue.path("fix").asText())
                            .build());
                }
            }

            int score = root.path("score").asInt(50);
            score = Math.max(0, Math.min(100, score));

            return ReviewResponse.builder()
                    .summary(root.path("summary").asText("Code analysis complete."))
                    .securityScore(score)
                    .language(language)
                    .fileName(fileName)
                    .issues(issues)
                    .status("COMPLETED")
                    .build();

        } catch (Exception e) {
            log.error("Failed to parse AI response: {}", e.getMessage());
            return ReviewResponse.builder()
                    .summary("Analysis completed but result parsing failed.")
                    .securityScore(0)
                    .language(language)
                    .fileName(fileName)
                    .issues(Collections.emptyList())
                    .status("FAILED")
                    .build();
        }
    }

    private String normaliseSeverity(String raw) {
        return switch (raw.toUpperCase()) {
            case "CRITICAL" -> "CRITICAL";
            case "HIGH"     -> "HIGH";
            case "MEDIUM"   -> "MEDIUM";
            default         -> "LOW";
        };
    }

    private String buildSecurityPrompt(String code, String language) {
        String truncatedCode = code.length() > MAX_CODE_LENGTH
                ? code.substring(0, MAX_CODE_LENGTH) + "\n// ... (truncated)"
                : code;

        return """
                You are a senior application security engineer performing a thorough code review.
                Analyze the following %s code for:
                - Security vulnerabilities (SQL injection, XSS, CSRF, hardcoded credentials,
                  unsafe deserialization, command injection, path traversal, broken authentication,
                  sensitive data exposure, insecure direct object reference, OWASP Top 10)
                - Bugs and logic errors
                - Performance issues
                - Bad coding practices and code quality problems

                Return ONLY a valid JSON object — no markdown, no extra text:
                {
                  "summary": "1–2 sentence overall security assessment",
                  "score": <integer 0-100, where 100 means perfectly secure>,
                  "issues": [
                    {
                      "title": "concise issue name",
                      "severity": "Critical|High|Medium|Low",
                      "line": <integer line number or null>,
                      "type": "Security|Bug|Performance|Best Practice",
                      "description": "clear explanation of the problem and its security/business impact",
                      "fix": "concrete, actionable fix with example code where possible"
                    }
                  ]
                }

                Code to analyze:
                ```%s
                %s
                ```
                """.formatted(language, language, truncatedCode);
    }
}
