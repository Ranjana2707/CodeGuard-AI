import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './context/authStore'
import AppLayout from './components/layout/AppLayout'
import { lazy, Suspense } from 'react'
import PageLoader from './components/ui/index'

const Landing   = lazy(() => import('./pages/Pages').then(m => ({ default: m.Landing })))
const Login     = lazy(() => import('./pages/Pages').then(m => ({ default: m.Login })))
const Register  = lazy(() => import('./pages/Pages').then(m => ({ default: m.Register })))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Review    = lazy(() => import('./pages/Review'))
const History   = lazy(() => import('./pages/History'))
const GitHub    = lazy(() => import('./pages/GitHub'))
const Analytics = lazy(() => import('./pages/Analytics'))
const Repos     = lazy(() => import('./pages/Pages').then(m => ({ default: m.Repos })))
const Settings  = lazy(() => import('./pages/Pages').then(m => ({ default: m.Settings })))
const Admin     = lazy(() => import('./pages/Pages').then(m => ({ default: m.Admin })))
const NotFound  = lazy(() => import('./pages/Pages').then(m => ({ default: m.NotFound })))

function RequireAuth({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

function RequireAdmin({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user)
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'ADMIN') return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

function GuestOnly({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/"         element={<Landing />} />
          <Route path="/login"    element={<GuestOnly><Login /></GuestOnly>} />
          <Route path="/register" element={<GuestOnly><Register /></GuestOnly>} />

          <Route element={<RequireAuth><AppLayout /></RequireAuth>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/review"    element={<Review />} />
            <Route path="/history"   element={<History />} />
            <Route path="/github"    element={<GitHub />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/repos"     element={<Repos />} />
            <Route path="/settings"  element={<Settings />} />
            <Route path="/admin"     element={<RequireAdmin><Admin /></RequireAdmin>} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
