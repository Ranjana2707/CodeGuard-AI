import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { History as HistoryIcon, Search, Filter, Trash2, Eye, FileCode } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { reviewService, type ReviewSummary } from '../services/apiServices'
import { SeverityBadge, SkeletonTable, EmptyState } from '../components/ui/index'
import clsx from 'clsx'

const SEV_FILTERS = ['All','CRITICAL','HIGH','MEDIUM','LOW'] as const
const LANG_FILTERS = ['All','javascript','typescript','python','java','go','php'] as const

function scoreColor(n: number) {
  if (n >= 80) return 'text-brand-green'
  if (n >= 50) return 'text-brand-yellow'
  return 'text-brand-red'
}

export default function History() {
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')
  const [sevFilter, setSevFilter] = useState<string>('All')
  const [langFilter, setLangFilter] = useState<string>('All')

  const { data, isLoading } = useQuery({
    queryKey: ['reviews', page],
    queryFn: () => reviewService.list(page, 10),
  })

  const reviews: ReviewSummary[] = data?.data?.data?.content ?? MOCK_HISTORY
  const totalPages: number = data?.data?.data?.totalPages ?? 1

  const filtered = reviews.filter((r) => {
    const matchSearch = !search || r.fileName.toLowerCase().includes(search.toLowerCase())
    const matchSev    = sevFilter  === 'All' || r.topSeverity === sevFilter
    const matchLang   = langFilter === 'All' || r.language    === langFilter
    return matchSearch && matchSev && matchLang
  })

  return (
    <>
      <div className="page-header">
        <h1 className="page-title"><HistoryIcon size={18} className="text-brand-blue" />Review History</h1>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search files…"
              className="input pl-8 w-48 text-xs"
            />
          </div>
          <div className="flex items-center gap-1">
            <Filter size={13} className="text-text-muted" />
            <select className="select text-xs" value={sevFilter} onChange={(e) => setSevFilter(e.target.value)}>
              {SEV_FILTERS.map((f) => <option key={f}>{f}</option>)}
            </select>
            <select className="select text-xs" value={langFilter} onChange={(e) => setLangFilter(e.target.value)}>
              {LANG_FILTERS.map((f) => <option key={f}>{f}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="page-content">
        <motion.div initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} className="card">
          {isLoading ? (
            <SkeletonTable rows={8} />
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={HistoryIcon}
              title="No reviews yet"
              description="Run your first AI code review to see results here."
            />
          ) : (
            <>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Review ID</th>
                    <th>File</th>
                    <th>Language</th>
                    <th>Issues</th>
                    <th>Top Severity</th>
                    <th>Score</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r, i) => (
                    <motion.tr
                      key={r.id}
                      initial={{ opacity:0 }}
                      animate={{ opacity:1 }}
                      transition={{ delay: i * 0.03 }}
                    >
                      <td>
                        <span className="font-mono text-[11px] text-brand-blue">
                          #{r.id}
                        </span>
                      </td>
                      <td>
                        <span className="font-mono text-[11px] bg-bg-tertiary border border-border rounded px-2 py-px text-text-secondary inline-flex items-center gap-1">
                          <FileCode size={11} /> {r.fileName}
                        </span>
                      </td>
                      <td className="text-text-secondary capitalize">{r.language}</td>
                      <td className="text-text-secondary">{r.issueCount}</td>
                      <td><SeverityBadge severity={r.topSeverity} /></td>
                      <td>
                        <span className={scoreColor(r.securityScore)}>
                          {r.securityScore}/100
                        </span>
                      </td>
                      <td className="text-xs text-text-muted">
                        {r.createdAt ? format(parseISO(r.createdAt), 'MMM d, yyyy') : '—'}
                      </td>
                      <td>
                        <span className={clsx('badge', r.status === 'COMPLETED' ? 'badge-info' : 'badge-neutral')}>
                          {r.status}
                        </span>
                      </td>
                      <td>
                        <div className="flex gap-1">
                          <button className="btn btn-ghost btn-sm" title="View">
                            <Eye size={12} />
                          </button>
                          <button className="btn btn-danger btn-sm" title="Delete">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                  <span className="text-xs text-text-muted">
                    Page {page + 1} of {totalPages}
                  </span>
                  <div className="flex gap-2">
                    <button
                      className="btn btn-ghost btn-sm"
                      disabled={page === 0}
                      onClick={() => setPage((p) => p - 1)}
                    >← Previous</button>
                    <button
                      className="btn btn-ghost btn-sm"
                      disabled={page >= totalPages - 1}
                      onClick={() => setPage((p) => p + 1)}
                    >Next →</button>
                  </div>
                </div>
              )}
            </>
          )}
        </motion.div>
      </div>
    </>
  )
}

const MOCK_HISTORY: ReviewSummary[] = [
  { id:1247, fileName:'auth.service.ts',      language:'typescript', issueCount:5, securityScore:42, topSeverity:'CRITICAL', createdAt:'2026-06-09T14:22:00Z', status:'COMPLETED' },
  { id:1246, fileName:'user.controller.js',   language:'javascript', issueCount:3, securityScore:61, topSeverity:'HIGH',     createdAt:'2026-06-09T11:05:00Z', status:'COMPLETED' },
  { id:1245, fileName:'database.py',          language:'python',     issueCount:7, securityScore:38, topSeverity:'CRITICAL', createdAt:'2026-06-08T17:30:00Z', status:'COMPLETED' },
  { id:1244, fileName:'UserService.java',     language:'java',       issueCount:4, securityScore:55, topSeverity:'HIGH',     createdAt:'2026-06-08T09:15:00Z', status:'COMPLETED' },
  { id:1243, fileName:'payment.go',           language:'go',         issueCount:1, securityScore:91, topSeverity:'LOW',      createdAt:'2026-06-07T16:00:00Z', status:'COMPLETED' },
  { id:1242, fileName:'api/routes.php',       language:'php',        issueCount:9, securityScore:29, topSeverity:'CRITICAL', createdAt:'2026-06-07T10:20:00Z', status:'COMPLETED' },
  { id:1241, fileName:'auth/middleware.ts',   language:'typescript', issueCount:2, securityScore:78, topSeverity:'MEDIUM',   createdAt:'2026-06-06T14:10:00Z', status:'COMPLETED' },
  { id:1240, fileName:'models/user.java',     language:'java',       issueCount:6, securityScore:44, topSeverity:'HIGH',     createdAt:'2026-06-06T08:45:00Z', status:'COMPLETED' },
]
