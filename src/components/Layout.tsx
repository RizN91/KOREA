import { Link, NavLink, useLocation } from 'react-router-dom'
import { useAppStore } from '../store/appStore'
import { useEffect, useState } from 'react'

export default function Layout({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useAppStore()
  const [q, setQ] = useState('')
  const loc = useLocation()
  useEffect(()=>setQ(''),[loc])

  return (
    <div className="min-h-screen grid grid-cols-[260px_1fr]">
      <aside className="hidden md:flex flex-col gap-2 p-4 border-r bg-white/50 dark:bg-slate-900/40">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-xl font-bold">FridgeSeal Pro</Link>
          <button className="btn-secondary px-2 py-1" onClick={()=>setTheme(theme==='dark'?'light':'dark')}>{theme==='dark'?'🌙':'☀️'}</button>
        </div>
        <nav className="mt-4 flex flex-col gap-2">
          <NavItem to="/" label="Dashboard" />
          <NavItem to="/jobs" label="Jobs" />
          <NavItem to="/kanban" label="Kanban" />
          <NavItem to="/scheduler" label="Scheduler" />
          <NavItem to="/customers" label="Customers" />
          <NavItem to="/parts" label="Parts" />
          <NavItem to="/sales" label="Quotes & Invoices" />
          <NavItem to="/mobile" label="Mobile" />
        </nav>
        <div className="mt-auto text-xs text-slate-500">Made for fridge-seal techs</div>
      </aside>
      <main className="p-4 md:p-8 space-y-6">
        <div className="flex items-center gap-2 sticky top-0 z-10 bg-slate-50/60 dark:bg-slate-900/60 backdrop-blur-xs py-2">
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search… (/ to focus)" className="input max-w-lg" onKeyDown={e=>{ if(e.key==='Enter'){ (window.location as any).href = '/search?q='+encodeURIComponent(q) } }} aria-label="Global search" />
          <Link className="btn-secondary" to={'/search?q='+encodeURIComponent(q)}>Search</Link>
          <div className="ml-auto flex items-center gap-2">
            <Link to="/jobs" className="btn-secondary">New Job</Link>
          </div>
        </div>
        {children}
      </main>
    </div>
  )
}

function NavItem({ to, label }: { to: string; label: string }) {
  return (
    <NavLink to={to} className={({isActive})=>`px-3 py-2 rounded-lg ${isActive?'bg-indigo-600 text-white':'hover:bg-slate-100 dark:hover:bg-slate-800'}`}>{label}</NavLink>
  )
}