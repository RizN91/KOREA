import { Route, Routes, Navigate, useNavigate } from 'react-router-dom'
import { Toaster, toast } from 'sonner'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import JobsList from './pages/JobsList'
import KanbanPage from './pages/KanbanPage'
import JobDetail from './pages/JobDetail'
import SchedulerPage from './pages/SchedulerPage'
import CustomersPage from './pages/CustomersPage'
import PartsPage from './pages/PartsPage'
import QuotesInvoicesPage from './pages/QuotesInvoicesPage'
import MobilePage from './pages/MobilePage'
import SearchPage from './pages/SearchPage'
import ScanPage from './pages/ScanPage'
import { useEffect } from 'react'
import { useAppStore } from './store/appStore'

export default function App() {
  const navigate = useNavigate()
  const initialize = useAppStore(s => s.initialize)
  const theme = useAppStore(s => s.theme)

  useEffect(() => {
    initialize()
  }, [initialize])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'N' || e.key === 'n') {
        if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') return
        toast('New job modal coming soon. Use Jobs > New Job')
      }
      if (e.key === '/') {
        e.preventDefault(); navigate('/search')
      }
      if (e.key.toLowerCase() === 'j' && e.ctrlKey === false && e.metaKey === false && e.shiftKey === false && e.altKey === true) {
        navigate('/jobs')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [navigate])

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') root.classList.add('dark')
    else root.classList.remove('dark')
    localStorage.setItem('fsp_theme', theme)
  }, [theme])

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/jobs" element={<JobsList />} />
        <Route path="/kanban" element={<KanbanPage />} />
        <Route path="/scheduler" element={<SchedulerPage />} />
        <Route path="/jobs/:id" element={<JobDetail />} />
        <Route path="/customers" element={<CustomersPage />} />
        <Route path="/parts" element={<PartsPage />} />
        <Route path="/sales" element={<QuotesInvoicesPage />} />
        <Route path="/mobile" element={<MobilePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/scan" element={<ScanPage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <Toaster richColors position="top-right" />
    </Layout>
  )
}