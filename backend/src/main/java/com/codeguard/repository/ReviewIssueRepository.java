package com.codeguard.repository;

import com.codeguard.entity.Review;
import com.codeguard.entity.ReviewIssue;
import com.codeguard.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewIssueRepository extends JpaRepository<ReviewIssue, Long> {

    List<ReviewIssue> findByReview(Review review);

    long countByReview(Review review);

    // Count issues of a given severity across all reviews owned by a user
    @Query("SELECT COUNT(i) FROM ReviewIssue i WHERE i.review.user = :user AND i.severity = :severity")
    long countByReviewUserAndSeverity(@Param("user") User user,
                                      @Param("severity") ReviewIssue.Severity severity);

    // Return severities for a given review ordered Critical -> Low
    @Query("SELECT CASE i.severity " +
           "WHEN 'CRITICAL' THEN 'CRITICAL' " +
           "WHEN 'HIGH'     THEN 'HIGH' " +
           "WHEN 'MEDIUM'   THEN 'MEDIUM' " +
           "ELSE 'LOW' END " +
           "FROM ReviewIssue i WHERE i.review = :review " +
           "ORDER BY CASE i.severity " +
           "WHEN 'CRITICAL' THEN 0 WHEN 'HIGH' THEN 1 WHEN 'MEDIUM' THEN 2 ELSE 3 END ASC")
    List<String> findSeveritiesByReviewOrdered(@Param("review") Review review);

    default String findTopSeverityByReview(Review review) {
        List<String> sevs = findSeveritiesByReviewOrdered(review);
        return sevs.isEmpty() ? "LOW" : sevs.get(0);
    }
}
