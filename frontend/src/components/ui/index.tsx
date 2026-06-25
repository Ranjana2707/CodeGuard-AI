import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'
import clsx from 'clsx'

// ── StatCard ──────────────────────────────────────────────────────────────
interface StatCardProps {
  label: string
  value: string | number
  change?: string
  changeType?: 'up' | 'down' | 'neutral'
  icon: LucideIcon
  iconColor?: string
  delay?: number
}
export function StatCard({ label, value, change, changeType = 'neutral', icon: Icon, iconColor = 'text-brand-blue', delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.25 }}
      className="card p-4"
    >
      <div className={clsx('flex items-center gap-1.5 text-[12px] text-text-secondary mb-2')}>
        <Icon size={14} className={iconColor} />
        {label}
      </div>
      <div className="text-2xl font-bold tracking-tight">{value}</div>
      {change && (
        <div className={clsx('text-[12px] mt-1', {
          'text-brand-green': changeType === 'up',
          'text-brand-red':   changeType === 'down',
          'text-text-muted':  changeType === 'neutral',
        })}>
          {change}
        </div>
      )}
    </motion.div>
  )
}

// ── SeverityBadge ─────────────────────────────────────────────────────────
type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
export function SeverityBadge({ severity }: { severity: Severity | string }) {
  const map: Record<string, string> = {
    CRITICAL: 'badge-critical',
    HIGH:     'badge-high',
    MEDIUM:   'badge-medium',
    LOW:      'badge-low',
  }
  return (
    <span className={clsx('badge', map[severity?.toUpperCase()] ?? 'badge-neutral')}>
      {severity}
    </span>
  )
}

// ── ScoreRing ─────────────────────────────────────────────────────────────
export function ScoreRing({ score, size = 80 }: { score: number; size?: number }) {
  const r = size * 0.35
  const circ = 2 * Math.PI * r
  const dash = (score / 100) * circ
  const color = score >= 80 ? '#3fb950' : score >= 50 ? '#e3b341' : '#f85149'
  const label = score >= 80 ? 'Secure' : score >= 50 ? 'Fair' : 'At Risk'

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="flex-shrink-0">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#21262d" strokeWidth={size*0.08} />
      <circle
        cx={size/2} cy={size/2} r={r} fill="none"
        stroke={color} strokeWidth={size*0.08}
        strokeDasharray={`${dash.toFixed(1)} ${circ.toFixed(1)}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{ transition: 'stroke-dasharray 0.6s ease' }}
      />
      <text x={size/2} y={size/2 - 3} textAnchor="middle" fill={color}
            fontSize={size*0.22} fontWeight="700" fontFamily="sans-serif">{score}</text>
      <text x={size/2} y={size/2 + size*0.14} textAnchor="middle" fill="#6e7681"
            fontSize={size*0.11} fontFamily="sans-serif">{label}</text>
    </svg>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────────
export function Skeleton({ className }: { className?: string }) {
  return <div className={clsx('skeleton', className)} />
}

export function SkeletonCard() {
  return (
    <div className="card p-4 space-y-3">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-8 w-1/2" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  )
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2 p-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/6" />
          <Skeleton className="h-4 w-1/8" />
          <Skeleton className="h-4 w-1/6" />
        </div>
      ))}
    </div>
  )
}

// ── PageLoader ────────────────────────────────────────────────────────────
export default function PageLoader() {
  return (
    <div className="flex items-center justify-center h-screen bg-bg-primary">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-bg-elevated border-t-brand-blue rounded-full animate-spin" />
        <div className="text-sm text-text-muted">Loading CodeGuard AI…</div>
      </div>
    </div>
  )
}

// ── EmptyState ────────────────────────────────────────────────────────────
interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: React.ReactNode
}
export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-6">
      <Icon size={48} className="text-text-muted mb-4" />
      <h3 className="text-[15px] font-semibold text-text-primary mb-2">{title}</h3>
      <p className="text-sm text-text-secondary leading-relaxed max-w-xs mb-4">{description}</p>
      {action}
    </div>
  )
}

// ── BarChart (severity breakdown) ─────────────────────────────────────────
interface BarItem { label: string; count: number; max: number; color: string }
export function SeverityBar({ items }: { items: BarItem[] }) {
  return (
    <div className="space-y-2.5">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-3 text-xs">
          <span className="w-16 text-right text-text-secondary">{item.label}</span>
          <div className="flex-1 h-2 bg-bg-tertiary rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: item.color }}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, Math.round((item.count / item.max) * 100))}%` }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
            />
          </div>
          <span className="w-6 text-right text-text-muted">{item.count}</span>
        </div>
      ))}
    </div>
  )
}
