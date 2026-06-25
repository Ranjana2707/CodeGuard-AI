import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Flame, AlertTriangle, AlertCircle, Info, Wand2 } from 'lucide-react'
import { SeverityBadge } from './index'
import type { IssueDto } from '../../services/apiServices'
import clsx from 'clsx'

const SEV_CONFIG = {
  CRITICAL: { icon: Flame,         bg: 'bg-red-950',    text: 'text-brand-red',    border: 'border-red-900' },
  HIGH:     { icon: AlertTriangle, bg: 'bg-orange-950', text: 'text-brand-orange', border: 'border-orange-900' },
  MEDIUM:   { icon: AlertCircle,   bg: 'bg-yellow-950', text: 'text-brand-yellow', border: 'border-yellow-900' },
  LOW:      { icon: Info,          bg: 'bg-green-950',  text: 'text-brand-green',  border: 'border-green-900' },
}

interface IssueCardProps {
  issue: IssueDto
  index?: number
  defaultOpen?: boolean
}

export default function IssueCard({ issue, index = 0, defaultOpen = false }: IssueCardProps) {
  const [open, setOpen] = useState(defaultOpen)
  const sev = (issue.severity?.toUpperCase() as keyof typeof SEV_CONFIG) ?? 'LOW'
  const cfg = SEV_CONFIG[sev] ?? SEV_CONFIG.LOW
  const Icon = cfg.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.2 }}
      className={clsx('border rounded-xl overflow-hidden transition-colors', cfg.border, 'hover:border-opacity-80')}
    >
      {/* Header */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-start gap-3 p-3.5 bg-bg-secondary hover:bg-bg-tertiary transition-colors text-left"
      >
        <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5', cfg.bg)}>
          <Icon size={16} className={cfg.text} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium mb-1.5 leading-snug">{issue.title}</div>
          <div className="flex items-center gap-2 flex-wrap">
            <SeverityBadge severity={issue.severity} />
            {issue.issueType && (
              <span className="text-[11px]" style={{ color: typeColor(issue.issueType) }}>
                {issue.issueType}
              </span>
            )}
            {issue.lineNumber && (
              <span className="font-mono text-[11px] bg-bg-tertiary border border-border rounded px-1.5 py-px text-text-muted">
                Line {issue.lineNumber}
              </span>
            )}
            {issue.cweId && (
              <span className="text-[11px] text-text-muted">{issue.cweId}</span>
            )}
          </div>
        </div>
        <ChevronDown
          size={16}
          className={clsx('text-text-muted flex-shrink-0 mt-1 transition-transform duration-200', open && 'rotate-180')}
        />
      </button>

      {/* Body */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 border-t border-border bg-bg-primary">
              <p className="text-[13px] text-text-secondary leading-relaxed mb-4">
                {issue.description}
              </p>

              {issue.fixSuggestion && (
                <div className="bg-bg-secondary border border-green-900 rounded-lg p-3">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-brand-green uppercase tracking-wider mb-2">
                    <Wand2 size={12} />
                    AI Fix Suggestion
                  </div>
                  <pre className="font-mono text-[12px] text-brand-cyan leading-relaxed whitespace-pre-wrap break-words">
                    {issue.fixSuggestion}
                  </pre>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function typeColor(type: string): string {
  const map: Record<string, string> = {
    Security:      '#f85149',
    Bug:           '#d29922',
    Performance:   '#e3b341',
    'Best Practice': '#388bfd',
  }
  return map[type] ?? '#8b949e'
}
