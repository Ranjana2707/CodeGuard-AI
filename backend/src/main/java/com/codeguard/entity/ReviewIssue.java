package com.codeguard.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "review_issues",
       indexes = {
           @Index(name = "idx_review_issues_review_id", columnList = "review_id"),
           @Index(name = "idx_review_issues_severity",  columnList = "severity")
       })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewIssue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "review_id", nullable = false)
    private Review review;

    @Column(nullable = false, length = 200)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Severity severity;

    @Column(name = "issue_type", length = 50)
    private String issueType;

    @Column(name = "line_number")
    private Integer lineNumber;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "fix_suggestion", columnDefinition = "TEXT")
    private String fixSuggestion;

    @Column(name = "cwe_id", length = 20)
    private String cweId;

    public enum Severity {
        CRITICAL, HIGH, MEDIUM, LOW
    }
}
