// ── Login ─────────────────────────────────────────────────────────────────
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { Shield, Loader2, Eye, EyeOff } from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { authService } from '../services/apiServices'
import { useAuthStore } from '../context/authStore'

export function Login() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  const [form, setForm] = useState({ username:'', password:'' })
  const [showPw, setShowPw] = useState(false)

  const mutation = useMutation({
    mutationFn: () => authService.login(form),
    onSuccess: (res) => {
      const { user, accessToken, refreshToken } = res.data.data
      setAuth(user, accessToken, refreshToken)
      toast.success(`Welcome back, ${user.fullName ?? user.username}!`)
      navigate('/dashboard')
    },
  })

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
               style={{ background:'linear-gradient(135deg,#388bfd,#bc8cff)' }}>
            <Shield size={22} className="text-white" />
          </div>
          <h1 className="text-xl font-bold">CodeGuard AI</h1>
          <p className="text-sm text-text-muted mt-1">Sign in to your account</p>
        </div>

        <div className="card p-6 space-y-4">
          <div>
            <label className="text-xs text-text-secondary block mb-1.5">Username</label>
            <input
              className="input"
              placeholder="your-username"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && mutation.mutate()}
            />
          </div>
          <div>
            <label className="text-xs text-text-secondary block mb-1.5">Password</label>
            <div className="relative">
              <input
                className="input pr-10"
                type={showPw ? 'text' : 'password'}
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && mutation.mutate()}
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
              >
                {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>
          <button
            className="btn btn-primary w-full"
            disabled={mutation.isPending || !form.username || !form.password}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending ? <><Loader2 size={14} className="animate-spin" /> Signing in…</> : 'Sign In'}
          </button>
        </div>

        <p className="text-center text-xs text-text-muted mt-4">
          Don't have an account?{' '}
          <Link to="/register" className="text-brand-blue hover:underline">Create one</Link>
        </p>
      </motion.div>
    </div>
  )
}

// ── Register ──────────────────────────────────────────────────────────────
export function Register() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  const [form, setForm] = useState({ username:'', email:'', password:'', fullName:'' })

  const mutation = useMutation({
    mutationFn: () => authService.register(form),
    onSuccess: (res) => {
      const { user, accessToken, refreshToken } = res.data.data
      setAuth(user, accessToken, refreshToken)
      toast.success('Account created!')
      navigate('/dashboard')
    },
  })

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
        className="w-full max-w-sm"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
               style={{ background:'linear-gradient(135deg,#388bfd,#bc8cff)' }}>
            <Shield size={22} className="text-white" />
          </div>
          <h1 className="text-xl font-bold">Create Account</h1>
          <p className="text-sm text-text-muted mt-1">Join CodeGuard AI</p>
        </div>
        <div className="card p-6 space-y-3">
          {[
            ['Full Name','text','Your name','fullName'],
            ['Username','text','username','username'],
            ['Email','email','you@company.com','email'],
            ['Password','password','Min 8 characters','password'],
          ].map(([label, type, placeholder, key]) => (
            <div key={key}>
              <label className="text-xs text-text-secondary block mb-1.5">{label}</label>
              <input
                className="input"
                type={type}
                placeholder={placeholder}
                value={(form as any)[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              />
            </div>
          ))}
          <button
            className="btn btn-primary w-full mt-1"
            disabled={mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending ? <><Loader2 size={14} className="animate-spin" />Creating…</> : 'Create Account'}
          </button>
        </div>
        <p className="text-center text-xs text-text-muted mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-blue hover:underline">Sign in</Link>
        </p>
      </motion.div>
    </div>
  )
}

// ── Landing ───────────────────────────────────────────────────────────────
export function Landing() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-bg-primary">
      <nav className="flex items-center justify-between px-8 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
               style={{ background:'linear-gradient(135deg,#388bfd,#bc8cff)' }}>
            <Shield size={15} className="text-white" />
          </div>
          <span className="font-bold text-sm">CodeGuard AI</span>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/login')}>Sign In</button>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/register')}>Get Started</button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-8 py-24 text-center">
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}>
          <div className="inline-flex items-center gap-2 bg-blue-950 border border-blue-900 rounded-full px-4 py-1.5 text-xs text-brand-blue mb-6">
            <Shield size={12} /> AI-Powered · Enterprise Security · OWASP Top 10
          </div>
          <h1 className="text-5xl font-bold leading-tight mb-6">
            Detect Security Vulnerabilities<br />
            <span style={{ background:'linear-gradient(135deg,#388bfd,#bc8cff)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
              Before They Ship
            </span>
          </h1>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed">
            CodeGuard AI scans your code for SQL injection, XSS, hardcoded credentials,
            insecure deserialization, and 50+ vulnerability types — with AI-generated fixes in seconds.
          </p>
          <div className="flex gap-3 justify-center">
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/register')}>
              Start Free Review →
            </button>
            <button className="btn btn-ghost btn-lg" onClick={() => navigate('/login')}>
              Sign In
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-3 gap-6 mt-20">
          {[
            { icon:'🛡️', title:'Security Analysis', desc:'Detects OWASP Top 10, CWE vulnerabilities, and secrets with severity scoring' },
            { icon:'🤖', title:'AI Fix Suggestions', desc:'Claude AI generates contextual, language-specific fix recommendations instantly' },
            { icon:'🔗', title:'GitHub Integration', desc:'Auto-review PRs, post inline comments, and block merges on critical findings' },
          ].map((f) => (
            <motion.div
              key={f.title}
              initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
              className="card p-6 text-left"
            >
              <div className="text-3xl mb-3">{f.icon}</div>
              <div className="font-semibold mb-2">{f.title}</div>
              <div className="text-sm text-text-secondary leading-relaxed">{f.desc}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Settings ──────────────────────────────────────────────────────────────
export function Settings() {
  const user = useAuthStore((s) => s.user)
  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
      </div>
      <div className="page-content max-w-xl space-y-4">
        <div className="card">
          <div className="card-header"><h2 className="card-title">Profile</h2></div>
          <div className="card-body space-y-3">
            {[['Full Name', user?.fullName ?? ''],['Email', user?.email ?? ''],['Username', user?.username ?? '']].map(
              ([label, val]) => (
                <div key={label}>
                  <label className="text-xs text-text-secondary block mb-1.5">{label}</label>
                  <input className="input" defaultValue={val} />
                </div>
              )
            )}
            <button className="btn btn-primary btn-sm" onClick={() => toast.success('Profile saved')}>
              Save Changes
            </button>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h2 className="card-title">API & Integrations</h2></div>
          <div className="card-body space-y-3">
            <div>
              <label className="text-xs text-text-secondary block mb-1.5">GitHub Token</label>
              <input className="input font-mono text-xs" type="password" defaultValue="ghp_****************************" />
            </div>
            <div>
              <label className="text-xs text-text-secondary block mb-1.5">AI Provider</label>
              <select className="select w-full">
                <option>Claude (Anthropic) — Active</option>
                <option>OpenAI GPT-4</option>
                <option>Gemini Pro</option>
              </select>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => toast.success('API settings saved')}>
              Update
            </button>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h2 className="card-title">Notifications</h2></div>
          <div className="card-body space-y-2 text-[13px] text-text-secondary">
            {['Email on critical findings','Slack notifications','Weekly digest'].map((opt) => (
              <label key={opt} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="accent-brand-blue" /> {opt}
              </label>
            ))}
          </div>
        </div>

        <div className="card border-red-900">
          <div className="card-header"><h2 className="card-title text-brand-red">Danger Zone</h2></div>
          <div className="card-body">
            <p className="text-sm text-text-secondary mb-3">Permanently delete your account and all data.</p>
            <button className="btn btn-danger btn-sm">Delete Account</button>
          </div>
        </div>
      </div>
    </>
  )
}

// ── Admin ─────────────────────────────────────────────────────────────────
const ADMIN_USERS = [
  { name:'Alex Kumar',  email:'alex@example.com',  role:'ADMIN', reviews:89, last:'Just now',  status:'Active' },
  { name:'Sarah Chen',  email:'sarah@example.com', role:'USER',  reviews:45, last:'1 hr ago',  status:'Active' },
  { name:'Mike Davis',  email:'mike@example.com',  role:'USER',  reviews:23, last:'Yesterday', status:'Active' },
  { name:'Emma Wilson', email:'emma@example.com',  role:'USER',  reviews:12, last:'3 days ago',status:'Suspended' },
]
export function Admin() {
  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Admin Panel</h1>
        <span className="badge badge-critical">3 alerts</span>
      </div>
      <div className="page-content space-y-4">
        <div className="grid grid-cols-3 gap-3">
          {[['Total Users','248','text-brand-blue'],['API Req/hr','4,829','text-brand-green'],['Rate Limited','12','text-brand-orange']].map(
            ([label, val, color]) => (
              <div key={label} className="card p-4">
                <div className="text-xs text-text-secondary mb-1">{label}</div>
                <div className={`text-2xl font-bold ${color}`}>{val}</div>
              </div>
            )
          )}
        </div>
        <div className="card">
          <div className="card-header"><h2 className="card-title">User Management</h2></div>
          <table className="data-table">
            <thead><tr><th>User</th><th>Role</th><th>Reviews</th><th>Last Active</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {ADMIN_USERS.map((u) => (
                <tr key={u.email}>
                  <td>
                    <div>
                      <div className="text-sm font-medium">{u.name}</div>
                      <div className="text-xs text-text-muted">{u.email}</div>
                    </div>
                  </td>
                  <td><span className={`badge ${u.role==='ADMIN'?'badge-info':'badge-neutral'}`}>{u.role}</span></td>
                  <td className="text-text-secondary">{u.reviews}</td>
                  <td className="text-text-muted text-xs">{u.last}</td>
                  <td><span className={`badge ${u.status==='Active'?'badge-low':'badge-critical'}`}>{u.status}</span></td>
                  <td><button className="btn btn-ghost btn-sm">Edit</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

// ── Repos ─────────────────────────────────────────────────────────────────
const ALL_REPOS = [
  { name:'api-service',    lang:'Java',       desc:'Core REST API backend',      issues:12, stars:24, branch:'main' },
  { name:'frontend-app',   lang:'TypeScript', desc:'React SPA frontend',         issues: 3, stars:18, branch:'main' },
  { name:'auth-module',    lang:'Python',     desc:'Authentication microservice', issues: 8, stars:11, branch:'main' },
  { name:'payment-service',lang:'Go',         desc:'Payment processing service',  issues: 2, stars: 9, branch:'main' },
]
export function Repos() {
  const navigate = useNavigate()
  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Repositories</h1>
        <button className="btn btn-primary btn-sm"><span>+ Add Repository</span></button>
      </div>
      <div className="page-content">
        <div className="grid grid-cols-2 gap-3">
          {ALL_REPOS.map((r) => (
            <motion.div
              key={r.name}
              initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }}
              className="card cursor-pointer hover:border-brand-blue transition-colors"
              onClick={() => navigate('/review')}
            >
              <div className="card-body">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-semibold text-sm">{r.name}</div>
                    <div className="text-xs text-text-muted mt-0.5">{r.desc}</div>
                  </div>
                  <span className="badge badge-info">{r.lang}</span>
                </div>
                <div className="flex gap-4 text-xs text-text-muted mt-3">
                  <span>⚠ {r.issues} issues</span>
                  <span>★ {r.stars}</span>
                  <span>⎇ {r.branch}</span>
                  <button
                    className="btn btn-primary btn-sm ml-auto"
                    onClick={(e) => { e.stopPropagation(); navigate('/review'); toast('Starting review…') }}
                  >Review</button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </>
  )
}

// ── NotFound ──────────────────────────────────────────────────────────────
export function NotFound() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center gap-4 text-center">
      <div className="text-6xl font-bold text-text-muted">404</div>
      <h1 className="text-xl font-semibold">Page not found</h1>
      <p className="text-sm text-text-secondary">The page you're looking for doesn't exist.</p>
      <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
        Go to Dashboard
      </button>
    </div>
  )
}

export default Login
