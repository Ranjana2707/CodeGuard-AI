package com.codeguard.repository;

import com.codeguard.entity.Review;
import com.codeguard.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    Page<Review> findByUser(User user, Pageable pageable);

    Optional<Review> findByIdAndUser(Long id, User user);

    long countByUser(User user);

    @Query("SELECT r FROM Review r WHERE r.user = :user ORDER BY r.createdAt DESC")
    List<Review> findTop10ByUserOrderByCreatedAtDesc(@Param("user") User user, Pageable pageable);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.user = :user AND r.createdAt >= :since")
    long countByUserAndCreatedAtAfter(@Param("user") User user, @Param("since") LocalDateTime since);
}
