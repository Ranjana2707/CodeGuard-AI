-- ============================================================
-- CodeGuard AI — PostgreSQL Schema
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── users ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id              BIGSERIAL PRIMARY KEY,
    username        VARCHAR(50)  UNIQUE NOT NULL,
    email           VARCHAR(100) UNIQUE NOT NULL,
    password        VARCHAR(255) NOT NULL,
    full_name       VARCHAR(100),
    role            VARCHAR(20)  NOT NULL DEFAULT 'USER'
                        CHECK (role IN ('USER','ADMIN')),
    github_token    TEXT,
    github_username VARCHAR(100),
    is_active       BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email    ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_active   ON users(is_active);

-- ── repositories ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS repositories (
    id             BIGSERIAL PRIMARY KEY,
    user_id        BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    repo_name      VARCHAR(200) NOT NULL,
    full_name      VARCHAR(300) NOT NULL,
    language       VARCHAR(50),
    github_id      BIGINT,
    default_branch VARCHAR(100) DEFAULT 'main',
    is_active      BOOLEAN      NOT NULL DEFAULT TRUE,
    connected_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_repos_user_id ON repositories(user_id);

-- ── reviews ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
    id               BIGSERIAL PRIMARY KEY,
    user_id          BIGINT      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    source_type      VARCHAR(20) NOT NULL
                         CHECK (source_type IN ('PASTE','FILE_UPLOAD','GITHUB_PR')),
    file_name        VARCHAR(300),
    language         VARCHAR(50),
    code_content     TEXT,
    summary          TEXT,
    security_score   SMALLINT    CHECK (security_score BETWEEN 0 AND 100),
    pr_number        VARCHAR(20),
    repository_name  VARCHAR(300),
    status           VARCHAR(20) NOT NULL DEFAULT 'PENDING'
                         CHECK (status IN ('PENDING','IN_PROGRESS','COMPLETED','FAILED')),
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reviews_user_id    ON reviews(user_id);
CREATE INDEX idx_reviews_created_at ON reviews(created_at DESC);
CREATE INDEX idx_reviews_status     ON reviews(status);

-- ── review_issues ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS review_issues (
    id             BIGSERIAL PRIMARY KEY,
    review_id      BIGINT       NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
    title          VARCHAR(200) NOT NULL,
    severity       VARCHAR(10)  NOT NULL
                       CHECK (severity IN ('CRITICAL','HIGH','MEDIUM','LOW')),
    issue_type     VARCHAR(50),
    line_number    INT,
    description    TEXT,
    fix_suggestion TEXT,
    cwe_id         VARCHAR(20)
);

CREATE INDEX idx_issues_review_id ON review_issues(review_id);
CREATE INDEX idx_issues_severity  ON review_issues(severity);

-- ── activity_logs ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS activity_logs (
    id         BIGSERIAL PRIMARY KEY,
    user_id    BIGINT      REFERENCES users(id) ON DELETE SET NULL,
    action     VARCHAR(200) NOT NULL,
    details    TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_activity_user_id    ON activity_logs(user_id);
CREATE INDEX idx_activity_created_at ON activity_logs(created_at DESC);

-- ── Seed admin user (password: Admin@123!) ─────────────────
INSERT INTO users (username, email, password, full_name, role)
VALUES (
    'admin',
    'admin@codeguard.ai',
    -- BCrypt hash of 'Admin@123!'
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQyCAgDLT3NVEcZWXHf/GkbHi',
    'CodeGuard Admin',
    'ADMIN'
) ON CONFLICT (username) DO NOTHING;
