import { useEffect, useState } from 'react'
import { db, Job, QuoteInvoice } from '../services/db'
import { Bar } from 'react-chartjs-2'
import { Chart, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js'
Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend)

export default function Dashboard() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [sales, setSales] = useState<QuoteInvoice[]>([])

  useEffect(() => { db.jobs.list().then(setJobs); db.sales.list().then(setSales) }, [])

  const active = jobs.filter(j=>!['Paid','Cancelled'].includes(j.status)).length
  const awaiting = jobs.filter(j=>j.status==='Waiting Approval').length
  const scheduledToday = jobs.filter(j=> j.scheduledAt && new Date(j.scheduledAt).toDateString() === new Date().toDateString()).length
  const overdue = jobs.filter(j=> j.status!=='Completed' && j.createdAt && (Date.now()-new Date(j.createdAt).getTime())/86400000>14).length
  const revenueThisMonth = sales.filter(s=> s.type==='invoice').reduce((sum,s)=>sum+s.total,0)

  const stageCounts = ['New','Need to Measure','Measured','Quoted','Waiting Approval','Approved','In Production','Ready for Install','Scheduled','In Progress','Completed','Invoiced','Paid'].map(s=> jobs.filter(j=>j.status===s).length)

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-5 gap-3">
        <KPI title="Active Jobs" value={active} />
        <KPI title="Awaiting Approval" value={awaiting} />
        <KPI title="Scheduled Today" value={scheduledToday} />
        <KPI title="Overdue" value={overdue} />
        <KPI title="Revenue This Month" value={`$${revenueThisMonth.toFixed(0)}`} />
      </div>
      <div className="card p-4">
        <div className="font-semibold mb-2">Jobs by Stage</div>
        <Bar height={80} data={{
          labels: ['New','Measure','Measured','Quoted','Approval','Approved','Production','Ready','Scheduled','Progress','Completed','Invoiced','Paid'],
          datasets: [{ label: 'Jobs', data: stageCounts, backgroundColor: 'rgba(99,102,241,0.5)' }]
        }} options={{ plugins: { legend: { display: false } }, responsive: true, maintainAspectRatio: false }} />
      </div>
      <div className="grid md:grid-cols-2 gap-3">
        <div className="card p-4">
          <div className="font-semibold mb-2">Quick Actions</div>
          <div className="flex gap-2 flex-wrap">
            <a className="btn" href="/jobs">New Job</a>
            <a className="btn-secondary" href="/kanban">Open Kanban</a>
            <a className="btn-secondary" href="/scheduler">Open Scheduler</a>
          </div>
        </div>
        <div className="card p-4">
          <div className="font-semibold mb-2">Tips</div>
          <div className="text-sm text-slate-600 dark:text-slate-300">Use keyboard: N new job, / search, Alt+J jobs.</div>
        </div>
      </div>
    </div>
  )
}

function KPI({ title, value }: { title: string; value: number | string }) {
  return (
    <div className="card p-4">
      <div className="text-slate-500 text-sm">{title}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  )
}