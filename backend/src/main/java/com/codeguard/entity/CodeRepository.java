package com.codeguard.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
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
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "repositories",
       indexes = {
           @Index(name = "idx_repos_user_id", columnList = "user_id")
       })
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CodeRepository {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "repo_name", nullable = false)
    private String repoName;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(name = "language")
    private String language;

    @Column(name = "github_id")
    private Long githubId;

    @Column(name = "default_branch")
    private String defaultBranch;

    @Column(name = "is_active")
    @Builder.Default
    private boolean active = true;

    @CreatedDate
    @Column(name = "connected_at", updatable = false)
    private LocalDateTime connectedAt;
}
