package com.codeguard.service;

import com.codeguard.dto.*;
import com.codeguard.entity.*;
import com.codeguard.repository.*;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.*;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReviewServiceTest {

    @Mock private ReviewRepository reviewRepository;
    @Mock private ReviewIssueRepository issueRepository;
    @Mock private UserRepository userRepository;
    @Mock private AiReviewService aiReviewService;
    @Mock private ActivityLogService activityLogService;

    @InjectMocks private ReviewService reviewService;

    private User testUser;
    private Review testReview;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
            .id(1L).username("testuser").email("test@example.com")
            .role(User.Role.USER).build();

        testReview = Review.builder()
            .id(1L).user(testUser).language("javascript")
            .fileName("test.js").status(Review.ReviewStatus.COMPLETED)
            .securityScore(72).summary("Review complete").build();
    }

    @Test
    void analyzeCode_Success() {
        ReviewRequest request = new ReviewRequest();
        request.setCode("function test() { var x = 1; }");
        request.setLanguage("javascript");
        request.setFileName("test.js");

        ReviewResponse aiResult = ReviewResponse.builder()
            .summary("No critical issues").securityScore(85)
            .issues(List.of()).status("COMPLETED").build();

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(reviewRepository.save(any())).thenReturn(testReview);
        when(aiReviewService.analyzeCode(any(), any(), any())).thenReturn(aiResult);

        ReviewResponse response = reviewService.analyzeCode(request, "testuser");

        assertNotNull(response);
        verify(aiReviewService).analyzeCode(anyString(), eq("javascript"), anyString());
        verify(reviewRepository, times(2)).save(any());
    }

    @Test
    void analyzeCode_UserNotFound_Throws() {
        when(userRepository.findByUsername("unknown")).thenReturn(Optional.empty());
        ReviewRequest request = new ReviewRequest();
        request.setCode("code"); request.setLanguage("java");

        assertThrows(RuntimeException.class,
            () -> reviewService.analyzeCode(request, "unknown"));
    }

    @Test
    void getUserReviews_ReturnsPaged() {
        Page<Review> page = new PageImpl<>(List.of(testReview));
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(reviewRepository.findByUser(eq(testUser), any())).thenReturn(page);
        when(issueRepository.countByReview(any())).thenReturn(2L);
        when(issueRepository.findTopSeverityByReview(any())).thenReturn("HIGH");

        Page<ReviewSummaryDto> result = reviewService.getUserReviews("testuser",
            PageRequest.of(0, 10));

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
    }

    @Test
    void deleteReview_Success() {
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(reviewRepository.findByIdAndUser(1L, testUser)).thenReturn(Optional.of(testReview));

        assertDoesNotThrow(() -> reviewService.deleteReview(1L, "testuser"));
        verify(reviewRepository).delete(testReview);
    }

    @Test
    void deleteReview_NotOwned_Throws() {
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(reviewRepository.findByIdAndUser(99L, testUser)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> reviewService.deleteReview(99L, "testuser"));
    }
}
