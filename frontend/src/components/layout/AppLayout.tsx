import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, Code2, GitPullRequest, History, BarChart3,
  FolderGit2, Settings, ShieldAlert, LogOut, Shield, ChevronRight,
} from 'lucide-react'
import { useAuthStore } from '../../context/authStore'
import clsx from 'clsx'

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  badge?: number
  adminOnly?: boolean
}

const NAV: { section: string; items: NavItem[] }[] = [
  {
    section: 'Overview',
    items: [
      { label: 'Dashboard',    href: '/dashboard',  icon: LayoutDashboard },
      { label: 'Code Review',  href: '/review',     icon: Code2 },
      { label: 'GitHub PRs',   href: '/github',     icon: GitPullRequest },
      { label: 'History',      href: '/history',    icon: History },
    ],
  },
  {
    section: 'Analytics',
    items: [
      { label: 'Analytics',    href: '/analytics',  icon: BarChart3 },
      { label: 'Repositories', href: '/repos',      icon: FolderGit2 },
    ],
  },
  {
    section: 'System',
    items: [
      { label: 'Settings',     href: '/settings',   icon: Settings },
      { label: 'Admin',        href: '/admin',      icon: ShieldAlert, badge: 3, adminOnly: true },
    ],
  },
]

function Avatar({ name, size = 32 }: { name: string; size?: number }) {
  const initials = name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
  return (
    <div
      className="rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0"
      style={{
        width: size, height: size, fontSize: size * 0.38,
        background: 'linear-gradient(135deg, #388bfd, #bc8cff)',
      }}
    >
      {initials}
    </div>
  )
}

export default function AppLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, clearAuth } = useAuthStore()

  const handleLogout = () => {
    clearAuth()
    navigate('/login')
  }

  return (
    <div className="flex h-screen overflow-hidden bg-bg-primary">
      {/* Sidebar */}
      <aside className="w-[240px] bg-bg-secondary border-r border-border flex flex-col flex-shrink-0">
        {/* Logo */}
        <div className="p-4 border-b border-border flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
               style={{ background: 'linear-gradient(135deg, #388bfd, #bc8cff)' }}>
            <Shield size={16} className="text-white" />
          </div>
          <div>
            <div className="text-sm font-semibold tracking-tight">CodeGuard AI</div>
            <div className="text-[10px] text-text-muted">Secure Code Reviewer</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-2 overflow-y-auto">
          {NAV.map(({ section, items }) => (
            <div key={section} className="mb-4">
              <div className="text-[10px] font-semibold text-text-muted uppercase tracking-widest px-2 mb-1">
                {section}
              </div>
              {items
                .filter((item) => !item.adminOnly || user?.role === 'ADMIN')
                .map((item) => {
                  const Icon = item.icon
                  const active = location.pathname === item.href
                  return (
                    <button
                      key={item.href}
                      onClick={() => navigate(item.href)}
                      className={clsx('nav-item', active && 'active')}
                    >
                      <Icon size={16} className="flex-shrink-0" />
                      <span className="flex-1">{item.label}</span>
                      {item.badge && (
                        <span className="bg-brand-red text-white text-[10px] font-bold px-1.5 py-px rounded-full">
                          {item.badge}
                        </span>
                      )}
                      {active && <ChevronRight size={12} className="text-brand-blue" />}
                    </button>
                  )
                })}
            </div>
          ))}
        </nav>

        {/* User footer */}
        <div className="p-3 border-t border-border flex items-center gap-2">
          <Avatar name={user?.fullName ?? user?.username ?? 'U'} />
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-medium truncate">
              {user?.fullName ?? user?.username}
            </div>
            <div className="text-[11px] text-brand-blue">
              {user?.role === 'ADMIN' ? 'Admin' : 'Pro Plan'}
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out"
            className="p-1.5 rounded-md text-text-muted hover:text-brand-red hover:bg-red-950 transition-colors"
          >
            <LogOut size={15} />
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto flex flex-col">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18 }}
          className="flex-1 flex flex-col"
        >
          <Outlet />
        </motion.div>
      </main>
    </div>
  )
}
