import { useEffect, useState } from 'react'
import { db, Job, JobStatus } from '../services/db'
import JobStatusBadge from './JobStatusBadge'
import { STATUS_FLOW, canTransition } from '../utils/statusMachine'
import { Link } from 'react-router-dom'

export default function Kanban() {
  const [columns, setColumns] = useState<Record<JobStatus, Job[]>>({} as any)

  useEffect(() => {
    db.jobs.list().then(jobs => {
      const grouped = jobs.reduce((acc, j) => { (acc[j.status] ||= []).push(j); return acc }, {} as Record<JobStatus, Job[]>)
      setColumns(grouped)
    })
  }, [])

  async function onDrop(target: JobStatus, jobId: string) {
    const currentCol = Object.keys(columns).find(k => columns[k as JobStatus]?.some(j=>j.id===jobId)) as JobStatus | undefined
    if (!currentCol || !canTransition(currentCol, target)) return
    const job = columns[currentCol].find(j=>j.id===jobId)!
    await db.jobs.update(job.id, { status: target })
    await db.activities.log(job.id, 'system', `Status: ${currentCol} → ${target}`)
    setColumns(prev => {
      const next = { ...prev }
      next[currentCol] = next[currentCol].filter(j=>j.id!==jobId)
      next[target] = [...(next[target]||[]), { ...job, status: target }]
      return next
    })
  }

  return (
    <div className="grid md:grid-cols-4 xl:grid-cols-6 gap-4">
      {STATUS_FLOW.map(status => (
        <div key={status} className="card p-3" onDragOver={(e)=>e.preventDefault()} onDrop={(e)=>{ const id = e.dataTransfer.getData('text/plain'); onDrop(status as JobStatus, id) }}>
          <div className="flex items-center justify-between mb-2">
            <div className="font-semibold">{status}</div>
            <JobStatusBadge status={status} />
          </div>
          <div className="space-y-2 min-h-[80px]">
            {(columns[status as JobStatus]||[]).map(job => (
              <KanbanCard key={job.id} job={job} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function KanbanCard({ job }: { job: Job }) {
  return (
    <div draggable onDragStart={(e)=> e.dataTransfer.setData('text/plain', job.id)} className="card p-3 border-dashed cursor-move">
      <div className="text-sm text-slate-600 dark:text-slate-300">{job.jobNo}</div>
      <Link to={`/jobs/${job.id}`} className="font-medium">{job.jobNo} – {job.priority}</Link>
    </div>
  )
}