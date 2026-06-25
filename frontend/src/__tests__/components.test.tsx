import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import '@testing-library/jest-dom'

// ── helpers ───────────────────────────────────────────────────────────────
function wrap(ui: React.ReactElement) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>
  )
}

// ── IssueCard ─────────────────────────────────────────────────────────────
import IssueCard from '../components/ui/IssueCard'

describe('IssueCard', () => {
  const baseIssue = {
    title: 'SQL Injection',
    severity: 'CRITICAL' as const,
    issueType: 'Security',
    lineNumber: 42,
    description: 'User input is concatenated directly into a SQL query.',
    fixSuggestion: 'Use parameterized queries or prepared statements.',
  }

  it('renders issue title and severity badge', () => {
    wrap(<IssueCard issue={baseIssue} />)
    expect(screen.getByText('SQL Injection')).toBeInTheDocument()
    expect(screen.getByText('CRITICAL')).toBeInTheDocument()
  })

  it('shows line number when provided', () => {
    wrap(<IssueCard issue={baseIssue} />)
    expect(screen.getByText('Line 42')).toBeInTheDocument()
  })

  it('body is hidden by default, expands on click', async () => {
    wrap(<IssueCard issue={baseIssue} />)
    expect(screen.queryByText(/User input is concatenated/)).not.toBeInTheDocument()
    await userEvent.click(screen.getByText('SQL Injection'))
    expect(screen.getByText(/User input is concatenated/)).toBeInTheDocument()
  })

  it('shows fix suggestion after expanding', async () => {
    wrap(<IssueCard issue={baseIssue} />)
    await userEvent.click(screen.getByText('SQL Injection'))
    expect(screen.getByText(/parameterized queries/)).toBeInTheDocument()
  })

  it('renders without optional fields', () => {
    const minimal = { title: 'Bug', severity: 'LOW' as const, issueType: 'Bug', description: 'desc', fixSuggestion: '' }
    wrap(<IssueCard issue={minimal} />)
    expect(screen.getByText('Bug')).toBeInTheDocument()
    expect(screen.queryByText(/Line/)).not.toBeInTheDocument()
  })
})

// ── SeverityBadge ─────────────────────────────────────────────────────────
import { SeverityBadge, StatCard, ScoreRing } from '../components/ui/index'
import { ShieldCheck } from 'lucide-react'

describe('SeverityBadge', () => {
  it.each(['CRITICAL','HIGH','MEDIUM','LOW'])('renders %s badge', (sev) => {
    wrap(<SeverityBadge severity={sev} />)
    expect(screen.getByText(sev)).toBeInTheDocument()
  })
})

// ── StatCard ──────────────────────────────────────────────────────────────
describe('StatCard', () => {
  it('renders label and value', () => {
    wrap(<StatCard label="Total Reviews" value={1247} icon={ShieldCheck} />)
    expect(screen.getByText('Total Reviews')).toBeInTheDocument()
    expect(screen.getByText('1247')).toBeInTheDocument()
  })

  it('renders change text when provided', () => {
    wrap(<StatCard label="Score" value="72/100" change="↑ 5% this month" changeType="up" icon={ShieldCheck} />)
    expect(screen.getByText('↑ 5% this month')).toBeInTheDocument()
  })
})

// ── ScoreRing ─────────────────────────────────────────────────────────────
describe('ScoreRing', () => {
  it('renders SVG with correct score text', () => {
    const { container } = wrap(<ScoreRing score={85} />)
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
    expect(screen.getByText('85')).toBeInTheDocument()
    expect(screen.getByText('Secure')).toBeInTheDocument()
  })

  it('shows "At Risk" label for low scores', () => {
    wrap(<ScoreRing score={30} />)
    expect(screen.getByText('At Risk')).toBeInTheDocument()
  })

  it('shows "Fair" label for mid-range scores', () => {
    wrap(<ScoreRing score={60} />)
    expect(screen.getByText('Fair')).toBeInTheDocument()
  })
})

// ── Review service (mocked) ───────────────────────────────────────────────
import { reviewService } from '../services/apiServices'
import api from '../services/api'

vi.mock('../services/api')

describe('reviewService', () => {
  beforeEach(() => vi.clearAllMocks())

  it('calls correct endpoint for analyze', async () => {
    const mockPost = vi.fn().mockResolvedValue({ data: { data: { issues: [], securityScore: 80, summary: 'ok', status: 'COMPLETED', language: 'js', fileName: 'test.js' } } })
    vi.mocked(api).post = mockPost

    await reviewService.analyze({ code: 'const x = 1', language: 'javascript' })
    expect(mockPost).toHaveBeenCalledWith('/reviews/analyze', expect.objectContaining({ language: 'javascript' }))
  })

  it('calls correct endpoint for list', async () => {
    const mockGet = vi.fn().mockResolvedValue({ data: { data: { content: [], totalElements: 0, totalPages: 1 } } })
    vi.mocked(api).get = mockGet

    await reviewService.list(0, 10)
    expect(mockGet).toHaveBeenCalledWith('/reviews?page=0&size=10&sort=createdAt,desc')
  })
})
