# 🛡️ CodeGuard AI — Enterprise AI-Powered Secure Code Reviewer

<div align="center">

![CodeGuard AI Banner](https://img.shields.io/badge/CodeGuard%20AI-Enterprise%20Security-388bfd?style=for-the-badge&logo=shield&logoColor=white)

[![Java](https://img.shields.io/badge/Java-21-orange?style=flat-square&logo=openjdk)](https://openjdk.org/projects/jdk/21/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2-brightgreen?style=flat-square&logo=spring)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat-square&logo=postgresql)](https://www.postgresql.org)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=flat-square&logo=docker)](https://www.docker.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

**Production-grade AI code review platform — detect vulnerabilities, bugs, and bad practices before they ship.**

[Live Demo](#) · [API Docs](#api-documentation) · [Deployment Guide](#deployment)

</div>

---

## ✨ Features

### 🔐 Security Analysis
- **OWASP Top 10** detection — SQL Injection, XSS, CSRF, Broken Auth, and more
- **Hardcoded credentials** and secret scanning
- **Unsafe deserialization**, command injection, path traversal detection
- **CWE mapping** for each finding
- Severity scoring: **Critical · High · Medium · Low**

### 🤖 AI-Powered Review Engine
- Powered by **Claude (Anthropic)** via structured prompting
- Per-issue AI explanations with business impact
- **Concrete fix suggestions** in the same language
- Executive summary with overall security score (0–100)
- Supports: JavaScript, TypeScript, Python, Java, Go, PHP, C#, SQL, Ruby, Rust

### 🔗 GitHub Integration
- Connect repositories via Personal Access Token
- Fetch and review **open Pull Requests**
- Parse git diffs for changed-file analysis
- Auto-review rules: block merge on Critical, post inline comments

### 📊 Analytics Dashboard
- Interactive charts (Recharts) — reviews over time, issues by severity
- Top vulnerability types ranked by frequency
- Per-language breakdown
- Security score trends

### 🏗️ Enterprise Architecture
- **JWT** authentication with refresh token rotation
- **Role-based access control** (USER / ADMIN)
- Audit logging for all sensitive actions
- Rate limiting, input sanitization, CORS/CSRF hardened
- Async AI processing, retry with exponential backoff
- Paginated history with search and filters
- Downloadable Markdown review reports

---

## 🖥️ Tech Stack

| Layer       | Technology                                              |
|-------------|---------------------------------------------------------|
| Frontend    | React 18, TypeScript, Vite, Tailwind CSS, Framer Motion |
| UI          | Monaco Editor, Recharts, Lucide Icons, react-hot-toast  |
| State       | Zustand, TanStack Query v5                              |
| Backend     | Java 21, Spring Boot 3.2, Spring Security, Spring Data  |
| Auth        | JWT (jjwt), BCrypt password hashing                     |
| Database    | PostgreSQL 16, Hibernate, JPA with auditing             |
| AI          | Anthropic Claude API (structured JSON prompting)        |
| Testing     | JUnit 5, Mockito, React Testing Library, Vitest         |
| DevOps      | Docker, Docker Compose, Nginx, GitHub Actions ready     |

---

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose ≥ 2.x
- An [Anthropic API key](https://console.anthropic.com/)

### 1. Clone and configure

```bash
git clone https://github.com/yourusername/codeguard-ai.git
cd codeguard-ai

cp .env.example .env
# Edit .env — set AI_API_KEY, JWT_SECRET, and POSTGRES_PASSWORD
```

### 2. Run with Docker Compose

```bash
docker compose up --build
```

| Service   | URL                        |
|-----------|----------------------------|
| Frontend  | http://localhost            |
| Backend   | http://localhost:8080       |
| Postgres  | localhost:5432              |

### 3. Default credentials
```
Username: admin
Password: Admin@123!
```

---

## 🛠️ Local Development (without Docker)

### Backend

```bash
cd backend

# Start PostgreSQL (or use Docker for just the DB)
docker compose up postgres -d

# Set environment variables
export DATABASE_URL=jdbc:postgresql://localhost:5432/codeguard
export DB_USERNAME=codeguard
export DB_PASSWORD=codeguard_secret
export JWT_SECRET=your-local-dev-secret-key-minimum-256-bits
export AI_API_KEY=sk-ant-api03-your-key-here

# Run
mvn spring-boot:run
```

### Frontend

```bash
cd frontend
npm install

# Create local env
echo "VITE_API_URL=http://localhost:8080/api" > .env.local

npm run dev
# Visit http://localhost:5173
```

---

## 📁 Project Structure

```
codeguard-ai/
├── backend/
│   ├── src/main/java/com/codeguard/
│   │   ├── config/           # SecurityConfig, AppConfig (CORS, beans)
│   │   ├── controller/       # AuthController, ReviewController, GithubController, DashboardController
│   │   ├── dto/              # Request/Response DTOs, ApiResponse wrapper
│   │   ├── entity/           # User, Review, ReviewIssue, Repository, ActivityLog
│   │   ├── exception/        # GlobalExceptionHandler, custom exceptions
│   │   ├── repository/       # Spring Data JPA interfaces
│   │   ├── security/         # JwtUtils, JwtAuthFilter, UserDetailsServiceImpl
│   │   └── service/          # AiReviewService, AuthService, ReviewService, GithubService, DashboardService
│   ├── src/test/             # JUnit + Mockito unit & integration tests
│   ├── Dockerfile
│   └── pom.xml
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/       # AppLayout (sidebar, nav)
│   │   │   └── ui/           # StatCard, IssueCard, ScoreRing, SeverityBadge, Skeleton, EmptyState
│   │   ├── context/          # authStore (Zustand + persist)
│   │   ├── pages/            # Dashboard, Review, History, GitHub, Analytics, Settings, Admin, …
│   │   ├── services/         # api.ts (Axios + interceptors), apiServices.ts
│   │   └── __tests__/        # Vitest + React Testing Library
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
│
├── docker/
│   └── init.sql              # PostgreSQL schema + seed data
│
├── docker-compose.yml
├── docker-compose.dev.yml
├── .env.example
└── README.md
```

---

## 🔌 API Documentation

All endpoints return a consistent envelope:

```json
{
  "success": true,
  "message": "...",
  "data": { ... },
  "timestamp": "2026-06-10T12:00:00"
}
```

### Authentication

| Method | Endpoint             | Body                                | Description              |
|--------|----------------------|-------------------------------------|--------------------------|
| POST   | `/api/auth/register` | `{username, email, password}`       | Register new user        |
| POST   | `/api/auth/login`    | `{username, password}`              | Login, get JWT pair      |
| POST   | `/api/auth/refresh`  | `{refreshToken}`                    | Rotate access token      |
| GET    | `/api/auth/me`       | —                                   | Get current user         |

### Reviews

| Method | Endpoint                | Description                    |
|--------|-------------------------|--------------------------------|
| POST   | `/api/reviews/analyze`  | Analyze pasted code with AI    |
| POST   | `/api/reviews/upload`   | Analyze uploaded file          |
| GET    | `/api/reviews`          | List user's reviews (paginated)|
| GET    | `/api/reviews/{id}`     | Get single review              |
| DELETE | `/api/reviews/{id}`     | Delete review                  |

### GitHub

| Method | Endpoint                             | Description           |
|--------|--------------------------------------|-----------------------|
| POST   | `/api/github/connect`                | Connect GitHub token  |
| GET    | `/api/github/repos`                  | List user's repos     |
| GET    | `/api/github/repos/{owner}/{repo}/pulls` | Fetch open PRs   |
| POST   | `/api/github/review-pr`              | AI review a PR diff   |

### Dashboard

| Method | Endpoint                    | Description              |
|--------|-----------------------------|--------------------------|
| GET    | `/api/dashboard/stats`      | Stats for dashboard cards|
| GET    | `/api/dashboard/analytics`  | Charts data              |
| GET    | `/api/dashboard/activity`   | Activity log             |

---

## 🧪 Testing

### Backend

```bash
cd backend

# Unit tests
mvn test

# Integration tests
mvn verify

# Test coverage report (target/site/jacoco/index.html)
mvn verify -Pjacoco
```

### Frontend

```bash
cd frontend

# Run all tests
npm test

# Watch mode
npm run test:watch

# UI test runner
npx vitest --ui
```

---

## 🐳 Deployment

### Render

1. Create a **PostgreSQL** database on Render
2. Create a **Web Service** for the backend:
   - Build: `cd backend && mvn package -DskipTests`
   - Start: `java -jar backend/target/codeguard-ai-1.0.0.jar`
   - Set all env vars from `.env.example`
3. Create a **Static Site** for the frontend:
   - Build: `cd frontend && npm ci && npm run build`
   - Publish dir: `frontend/dist`
   - Set `VITE_API_URL` to your backend URL

### Railway

```bash
# Install Railway CLI
npm i -g @railway/cli
railway login

# Deploy
railway up
```

Set environment variables in the Railway dashboard.

### AWS EC2

```bash
# On your EC2 instance (Ubuntu 22.04)
sudo apt update && sudo apt install -y docker.io docker-compose-plugin git

git clone https://github.com/yourusername/codeguard-ai.git
cd codeguard-ai
cp .env.example .env
# Edit .env with your values

# Run
sudo docker compose up -d --build

# View logs
sudo docker compose logs -f
```

---

## 🔒 Security Considerations

- All passwords hashed with **BCrypt** (cost factor 12)
- JWT tokens expire in 24 hours; refresh tokens in 7 days
- SQL queries use **parameterized statements** (Spring Data JPA)
- Input sanitized and validated at the DTO layer
- CORS locked to configured origins in production
- HTTP security headers set via Nginx in production
- Non-root Docker user for backend container
- Secrets managed via environment variables only — never hardcoded

---

## 📸 Screenshots

| Dashboard | Code Review | Issue Detail |
|-----------|-------------|--------------|
| *(dark SaaS dashboard with stats, charts, activity feed)* | *(Monaco editor + AI analysis panel)* | *(Expandable issue cards with fix suggestions)* |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit: `git commit -m 'feat: add your feature'`
4. Push: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

MIT © 2026 CodeGuard AI

---

<div align="center">
Built with ❤️ using React, Spring Boot, and Claude AI
</div>
