import api from './api'

// ── Types ──────────────────────────────────────────────────────────────────
export interface LoginRequest   { username: string; password: string }
export interface RegisterRequest {
  username: string; email: string; password: string; fullName?: string
}
export interface AuthResponse {
  accessToken: string; refreshToken: string; tokenType: string
  user: import('../context/authStore').User
}
export interface ReviewRequest  { code: string; language: string; fileName?: string }
export interface IssueDto {
  id?: number; title: string; severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  issueType: string; lineNumber?: number; description: string; fixSuggestion: string; cweId?: string
}
export interface ReviewResponse {
  id?: number; summary: string; securityScore: number; language: string
  fileName: string; issues: IssueDto[]; createdAt?: string; status: string
}
export interface ReviewSummary {
  id: number; fileName: string; language: string; issueCount: number
  securityScore: number; topSeverity: string; createdAt: string; status: string
}
export interface DashboardStats {
  totalReviews: number; criticalIssues: number; issuesFixed: number
  activePRs: number; totalRepositories: number; recentReviews: ReviewSummary[]
}
export interface AnalyticsData {
  reviewsOverTime: { date: string; count: number }[]
  issuesBySeverity: { severity: string; count: number }[]
  topVulnerabilities: { type: string; count: number }[]
  reviewsByLanguage: { language: string; count: number }[]
}
export interface PullRequest {
  number: number; title: string; state: string; author: string
  changedFiles: number; branch: string; createdAt: string
}

// ── Auth ──────────────────────────────────────────────────────────────────
export const authService = {
  login:    (data: LoginRequest)    => api.post<{ data: AuthResponse }>('/auth/login', data),
  register: (data: RegisterRequest) => api.post<{ data: AuthResponse }>('/auth/register', data),
  refresh:  (token: string)         => api.post<{ data: AuthResponse }>('/auth/refresh', { refreshToken: token }),
  me:       ()                      => api.get('/auth/me'),
}

// ── Reviews ───────────────────────────────────────────────────────────────
export const reviewService = {
  analyze: (data: ReviewRequest) =>
    api.post<{ data: ReviewResponse }>('/reviews/analyze', data),

  upload: (file: File, language: string) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('language', language)
    return api.post<{ data: ReviewResponse }>('/reviews/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  list: (page = 0, size = 10) =>
    api.get<{ data: { content: ReviewSummary[]; totalElements: number; totalPages: number } }>(
      `/reviews?page=${page}&size=${size}&sort=createdAt,desc`
    ),

  getById: (id: number) =>
    api.get<{ data: ReviewResponse }>(`/reviews/${id}`),

  delete: (id: number) =>
    api.delete(`/reviews/${id}`),
}

// ── GitHub ────────────────────────────────────────────────────────────────
export const githubService = {
  connect: (token: string) =>
    api.post('/github/connect', { token }),

  repos: () =>
    api.get('/github/repos'),

  pullRequests: (owner: string, repo: string) =>
    api.get<{ data: PullRequest[] }>(`/github/repos/${owner}/${repo}/pulls`),

  reviewPR: (owner: string, repo: string, prNumber: number) =>
    api.post<{ data: ReviewResponse }>('/github/review-pr', { owner, repo, prNumber }),
}

// ── Dashboard ─────────────────────────────────────────────────────────────
export const dashboardService = {
  stats:     ()           => api.get<{ data: DashboardStats }>('/dashboard/stats'),
  analytics: (days = 30)  => api.get<{ data: AnalyticsData }>(`/dashboard/analytics?days=${days}`),
  activity:  ()           => api.get('/dashboard/activity'),
}
