package com.codeguard.entity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "reviews",
       indexes = {
           @Index(name = "idx_reviews_user_id",    columnList = "user_id"),
           @Index(name = "idx_reviews_created_at", columnList = "created_at")
       })
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "source_type", nullable = false)
    @Enumerated(EnumType.STRING)
    private SourceType sourceType;

    @Column(name = "file_name")
    private String fileName;

    @Column(name = "language", length = 50)
    private String language;

    @Column(name = "code_content", columnDefinition = "TEXT")
    private String codeContent;

    @Column(name = "summary", columnDefinition = "TEXT")
    private String summary;

    @Column(name = "security_score")
    private Integer securityScore;

    @Column(name = "pr_number")
    private String prNumber;

    @Column(name = "repository_name")
    private String repositoryName;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    @Builder.Default
    private ReviewStatus status = ReviewStatus.PENDING;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "review", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ReviewIssue> issues;

    public enum SourceType {
        PASTE, FILE_UPLOAD, GITHUB_PR
    }

    public enum ReviewStatus {
        PENDING, IN_PROGRESS, COMPLETED, FAILED
    }
}
