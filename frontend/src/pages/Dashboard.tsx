import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  Code2, AlertTriangle, ShieldCheck, GitPullRequest,
  Clock, Activity, FolderGit2, RefreshCw, Plus,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { dashboardService } from '../services/apiServices'
import {
  StatCard, SeverityBadge, SkeletonCard, SkeletonTable, SeverityBar, ScoreRing,
} from '../components/ui/index'
import { format, parseISO } from 'date-fns'

function scoreColor(score: number) {
  if (score >= 80) return 'text-brand-green'
  if (score >= 50) return 'text-brand-yellow'
  return 'text-brand-red'
}

export default function Dashboard() {
  const navigate = useNavigate()

  const { data: statsData, isLoading: statsLoading, refetch } =
    useQuery({ queryKey: ['dashboard-stats'], queryFn: () => dashboardService.stats() })

  const { data: analyticsData, isLoading: analyticsLoading } =
    useQuery({ queryKey: ['dashboard-analytics'], queryFn: () => dashboardService.analytics(30) })

  const stats = statsData?.data?.data
  const analytics = analyticsData?.data?.data

  const severityBarItems = [
    { label: 'Critical', count: analytics?.issuesBySeverity?.find(s => s.severity === 'CRITICAL')?.count ?? 38, max: 60,  color: '#f85149' },
    { label: 'High',     count: analytics?.issuesBySeverity?.find(s => s.severity === 'HIGH')?.count     ?? 72, max: 120, color: '#d29922' },
    { label: 'Medium',   count: analytics?.issuesBySeverity?.find(s => s.severity === 'MEDIUM')?.count   ?? 134,max: 200, color: '#e3b341' },
    { label: 'Low',      count: analytics?.issuesBySeverity?.find(s => s.severity === 'LOW')?.count      ?? 201,max: 300, color: '#3fb950' },
  ]

  return (
    <>
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">
          <LayoutDashboardIcon />
          Dashboard
        </h1>
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-muted">Last sync: just now</span>
          <button onClick={() => refetch()} className="btn btn-ghost btn-sm">
            <RefreshCw size={13} /> Refresh
          </button>
          <button onClick={() => navigate('/review')} className="btn btn-primary btn-sm">
            <Plus size={13} /> New Review
          </button>
        </div>
      </div>

      <div className="page-content space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-3">
          {statsLoading ? (
            Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          ) : (
            <>
              <StatCard label="Total Reviews"   value={stats?.totalReviews ?? 1247}  change="↑ 12% this month" changeType="up"      icon={Code2}          iconColor="text-brand-blue"   delay={0} />
              <StatCard label="Critical Issues"  value={stats?.criticalIssues ?? 38}  change="↑ 4 new today"   changeType="down"     icon={AlertTriangle}  iconColor="text-brand-red"    delay={0.05} />
              <StatCard label="Issues Fixed"     value={stats?.issuesFixed ?? 892}    change="↑ 8% this week"  changeType="up"       icon={ShieldCheck}    iconColor="text-brand-green"  delay={0.1} />
              <StatCard label="Active PRs"       value={stats?.activePRs ?? 16}       change="3 pending review" changeType="neutral" icon={GitPullRequest}  iconColor="text-brand-purple" delay={0.15} />
            </>
          )}
        </div>

        {/* Content grid */}
        <div className="grid grid-cols-[1fr_320px] gap-4">
          {/* Left column */}
          <div className="space-y-4">
            {/* Recent reviews table */}
            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="card"
            >
              <div className="card-header">
                <h2 className="card-title"><Clock size={15} className="text-brand-blue" />Recent Reviews</h2>
                <button onClick={() => navigate('/history')} className="btn btn-ghost btn-sm">
                  View all →
                </button>
              </div>
              {statsLoading ? (
                <SkeletonTable />
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>File / PR</th><th>Issues</th><th>Severity</th>
                      <th>Score</th><th>Date</th><th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {(stats?.recentReviews ?? MOCK_REVIEWS).map((r: any) => (
                      <tr key={r.id}>
                        <td>
                          <span className="font-mono text-[11px] bg-bg-tertiary border border-border rounded px-2 py-px text-text-secondary">
                            {r.fileName}
                          </span>
                        </td>
                        <td className="text-text-secondary">{r.issueCount ?? r.issues}</td>
                        <td><SeverityBadge severity={r.topSeverity ?? r.sev} /></td>
                        <td>
                          <span className={scoreColor(r.securityScore ?? r.score)}>
                            {r.securityScore ?? r.score}/100
                          </span>
                        </td>
                        <td className="text-text-muted text-xs">
                          {r.createdAt ? format(parseISO(r.createdAt), 'MMM d, h:mm a') : r.date}
                        </td>
                        <td>
                          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/history')}>
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </motion.div>

            {/* Activity log */}
            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}
              className="card"
            >
              <div className="card-header">
                <h2 className="card-title"><Activity size={15} className="text-brand-blue" />AI Activity Log</h2>
                <span className="badge badge-info">Live</span>
              </div>
              <div className="px-4">
                {ACTIVITY.map((item, i) => (
                  <div key={i} className="flex items-start gap-2.5 py-2.5 border-b border-border last:border-b-0">
                    <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: item.color }} />
                    <div className="flex-1 text-[12px] text-text-secondary" dangerouslySetInnerHTML={{ __html: item.text }} />
                    <span className="text-[11px] text-text-muted flex-shrink-0">{item.time}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right column */}
          <div className="space-y-4">
            {/* Severity breakdown */}
            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
              className="card"
            >
              <div className="card-header">
                <h2 className="card-title"><AlertTriangle size={15} className="text-brand-blue" />Issue Breakdown</h2>
              </div>
              <div className="card-body">
                {analyticsLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="flex gap-3">
                        <div className="skeleton h-3 w-14 rounded" />
                        <div className="skeleton flex-1 h-3 rounded" />
                        <div className="skeleton h-3 w-6 rounded" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <SeverityBar items={severityBarItems} />
                )}
              </div>
            </motion.div>

            {/* Top vulnerabilities */}
            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="card"
            >
              <div className="card-header">
                <h2 className="card-title"><AlertTriangle size={15} className="text-brand-red" />Top Vulnerabilities</h2>
              </div>
              <div className="px-4">
                {TOP_VULNS.map((v, i) => (
                  <div key={i} className="flex items-center py-2.5 border-b border-border last:border-b-0">
                    <span className="flex-1 text-[13px]">{v.name}</span>
                    <span className="text-[13px] font-semibold" style={{ color: v.color }}>{v.count}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Repositories */}
            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
              className="card"
            >
              <div className="card-header">
                <h2 className="card-title"><FolderGit2 size={15} className="text-brand-blue" />Repositories</h2>
                <button onClick={() => navigate('/repos')} className="btn btn-ghost btn-sm">Manage</button>
              </div>
              <div className="px-4">
                {REPOS.map((r, i) => (
                  <div key={i} className="flex items-center gap-2.5 py-2.5 border-b border-border last:border-b-0">
                    <FolderGit2 size={15} className="text-brand-blue flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-medium truncate">{r.name}</div>
                      <div className="text-[11px] text-text-muted">{r.lang} · {r.issues} issues</div>
                    </div>
                    <div className="w-2 h-2 rounded-full" style={{ background: r.dot }} />
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  )
}

function LayoutDashboardIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#388bfd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
}

const MOCK_REVIEWS = [
  { id:1, fileName:'auth.service.ts', issues:5, sev:'CRITICAL', score:42, date:'2 min ago' },
  { id:2, fileName:'user.controller.js', issues:3, sev:'HIGH', score:61, date:'1 hr ago' },
  { id:3, fileName:'database.py', issues:7, sev:'CRITICAL', score:38, date:'3 hr ago' },
  { id:4, fileName:'api/upload.java', issues:2, sev:'MEDIUM', score:74, date:'Yesterday' },
  { id:5, fileName:'utils/hash.go', issues:1, sev:'LOW', score:89, date:'2 days ago' },
]

const ACTIVITY = [
  { color:'#f85149', text:'Critical SQL injection found in <strong>auth.service.ts</strong>', time:'2m' },
  { color:'#3fb950', text:'Review #1247 completed — 0 critical issues', time:'5m' },
  { color:'#388bfd', text:'GitHub PR #84 synced from <strong>api-service</strong>', time:'12m' },
  { color:'#d29922', text:'High severity XSS in <strong>user.controller.js</strong>', time:'1hr' },
  { color:'#bc8cff', text:'New repository <strong>payment-service</strong> added', time:'3hr' },
]

const TOP_VULNS = [
  { name:'SQL Injection',            count:24, color:'#f85149' },
  { name:'Hardcoded Credentials',    count:18, color:'#d29922' },
  { name:'XSS',                      count:15, color:'#e3b341' },
  { name:'Insecure Deserialization', count:12, color:'#bc8cff' },
  { name:'Broken Authentication',    count: 8, color:'#388bfd' },
]

const REPOS = [
  { name:'api-service',    lang:'Java',       issues:12, dot:'#f85149' },
  { name:'frontend-app',   lang:'TypeScript', issues: 3, dot:'#e3b341' },
  { name:'auth-module',    lang:'Python',     issues: 8, dot:'#d29922' },
]
