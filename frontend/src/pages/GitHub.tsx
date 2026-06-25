import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  GitPullRequest, Github, RefreshCw, Plus, ShieldSearch,
  Loader2, CheckCircle2, GitBranch, FileCode, Settings2,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { githubService, type ReviewResponse, type PullRequest } from '../services/apiServices'
import IssueCard from '../components/ui/IssueCard'
import { SeverityBadge, ScoreRing } from '../components/ui/index'

const MOCK_PRS: PullRequest[] = [
  { number:84, title:'feat: add OAuth2 authentication flow',    author:'sarah-k',  changedFiles:8,  branch:'feature/oauth2',    state:'open', createdAt:'2 hr ago' },
  { number:83, title:'fix: database connection pool leak',      author:'dev-mike',  changedFiles:3,  branch:'fix/db-pool',        state:'open', createdAt:'5 hr ago' },
  { number:82, title:'refactor: user service layer cleanup',    author:'j-chen',   changedFiles:12, branch:'refactor/users',     state:'open', createdAt:'1 day ago' },
  { number:81, title:'feat: payment gateway integration',       author:'emma-dev',  changedFiles:6,  branch:'feature/payments',   state:'open', createdAt:'2 days ago' },
]

const CONNECTED_REPOS = [
  { name:'api-service',    lang:'Java',       stars:24, issues:12 },
  { name:'frontend-app',   lang:'TypeScript', stars:18, issues: 3 },
  { name:'auth-module',    lang:'Python',     stars:11, issues: 8 },
]

export default function GitHub() {
  const [selectedPR, setSelectedPR] = useState<PullRequest | null>(null)
  const [prResult, setPRResult] = useState<ReviewResponse | null>(null)

  const reviewMutation = useMutation({
    mutationFn: (pr: PullRequest) =>
      githubService.reviewPR('myorg', 'api-service', pr.number),
    onSuccess: (res) => {
      setPRResult(res.data.data)
      toast.success('PR review complete')
    },
    onError: () => toast.error('PR review failed'),
  })

  const handleReviewPR = (pr: PullRequest) => {
    setSelectedPR(pr)
    setPRResult(null)
    reviewMutation.mutate(pr)
  }

  return (
    <>
      <div className="page-header">
        <h1 className="page-title"><Github size={18} className="text-brand-blue" />GitHub Integration</h1>
        <div className="flex gap-2">
          <button className="btn btn-ghost btn-sm"><RefreshCw size={13} />Sync</button>
          <button className="btn btn-primary btn-sm"><Plus size={13} />Connect Repository</button>
        </div>
      </div>

      <div className="page-content grid grid-cols-[1fr_280px] gap-4">
        {/* Left: PRs */}
        <div className="space-y-4">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title"><GitPullRequest size={15} className="text-brand-blue" />Open Pull Requests</h2>
              <span className="badge badge-info">{MOCK_PRS.length} open</span>
            </div>
            <div className="p-3 space-y-2">
              {MOCK_PRS.map((pr) => (
                <motion.div
                  key={pr.number}
                  initial={{ opacity:0, x:-4 }}
                  animate={{ opacity:1, x:0 }}
                  className={`border rounded-xl p-3.5 cursor-pointer transition-colors ${
                    selectedPR?.number === pr.number
                      ? 'border-brand-blue bg-blue-950/20'
                      : 'border-border hover:border-border-subtle bg-bg-secondary'
                  }`}
                  onClick={() => setSelectedPR(pr)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium mb-1.5 flex items-center gap-1.5">
                        <GitPullRequest size={13} className="text-brand-green flex-shrink-0" />
                        <span className="text-brand-blue font-mono text-xs">#{pr.number}</span>
                        <span className="truncate">{pr.title}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-text-muted flex-wrap">
                        <span>@{pr.author}</span>
                        <span>{pr.changedFiles} files</span>
                        <span className="font-mono bg-bg-tertiary border border-border rounded px-1.5 py-px flex items-center gap-1">
                          <GitBranch size={10} />{pr.branch}
                        </span>
                        <span className="ml-auto">{pr.createdAt}</span>
                      </div>
                    </div>
                    <button
                      className="btn btn-primary btn-sm flex-shrink-0"
                      onClick={(e) => { e.stopPropagation(); handleReviewPR(pr) }}
                      disabled={reviewMutation.isPending && selectedPR?.number === pr.number}
                    >
                      {reviewMutation.isPending && selectedPR?.number === pr.number ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <ShieldSearch size={12} />
                      )}
                      Review
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* PR Review output */}
          <AnimatePresence>
            {reviewMutation.isPending && (
              <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="card p-8 flex flex-col items-center gap-3 text-text-secondary">
                <Loader2 size={28} className="animate-spin text-brand-blue" />
                <div className="text-sm">AI reviewing PR #{selectedPR?.number} diff…</div>
              </motion.div>
            )}
            {prResult && !reviewMutation.isPending && (
              <motion.div initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} className="space-y-3">
                <div className="card">
                  <div className="card-header">
                    <div className="card-title">
                      <CheckCircle2 size={15} className="text-brand-green" />
                      PR #{selectedPR?.number} Review Complete
                    </div>
                    <ScoreRing score={prResult.securityScore} size={52} />
                  </div>
                  <div className="card-body">
                    <p className="text-[13px] text-text-secondary mb-3">{prResult.summary}</p>
                    <div className="flex gap-2 flex-wrap">
                      {prResult.issues.reduce((acc, i) => {
                        acc[i.severity] = (acc[i.severity] ?? 0) + 1; return acc
                      }, {} as Record<string,number>) &&
                        Object.entries(prResult.issues.reduce((acc, i) => {
                          acc[i.severity] = (acc[i.severity] ?? 0) + 1; return acc
                        }, {} as Record<string,number>)).map(([sev, count]) => (
                          <SeverityBadge key={sev} severity={sev} />
                        ))
                      }
                    </div>
                  </div>
                </div>
                {prResult.issues.map((issue, i) => (
                  <IssueCard key={i} issue={issue} index={i} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          {/* Connected repos */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title text-xs"><FileCode size={14} className="text-brand-blue" />Connected Repos</h3>
            </div>
            <div className="px-4">
              {CONNECTED_REPOS.map((r, i) => (
                <div key={i} className="flex items-center gap-2.5 py-2.5 border-b border-border last:border-b-0">
                  <CheckCircle2 size={14} className="text-brand-green flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium truncate">{r.name}</div>
                    <div className="text-[11px] text-text-muted">{r.lang} · {r.issues} issues</div>
                  </div>
                  <button className="btn btn-danger btn-sm text-[11px]">Disconnect</button>
                </div>
              ))}
            </div>
          </div>

          {/* Auto-review rules */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title text-xs"><Settings2 size={14} className="text-brand-blue" />Auto-Review Rules</h3>
            </div>
            <div className="card-body space-y-2.5 text-[12px] text-text-secondary">
              {[
                ['Auto-review on PR open', true],
                ['Block merge on Critical', true],
                ['Notify on High severity', false],
                ['Post inline comments', true],
              ].map(([label, checked]) => (
                <label key={label as string} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked={checked as boolean} className="accent-brand-blue" />
                  {label}
                </label>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="card">
            <div className="card-header"><h3 className="card-title text-xs">This Week</h3></div>
            <div className="card-body space-y-2">
              {[
                ['PRs Reviewed',  '14', '#388bfd'],
                ['Issues Blocked','6',  '#f85149'],
                ['Auto-approved', '8',  '#3fb950'],
              ].map(([label, val, color]) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-xs text-text-secondary">{label}</span>
                  <span className="text-sm font-semibold" style={{ color }}>{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
