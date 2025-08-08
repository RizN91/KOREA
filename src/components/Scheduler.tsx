import { useEffect, useMemo, useState } from 'react'
import { db, Job, User } from '../services/db'
import { format } from 'date-fns'

export default function Scheduler() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0,10))

  useEffect(() => { db.jobs.list().then(setJobs); db.users.list().then(setUsers) }, [])

  const hours = useMemo(()=>Array.from({length:10}, (_,i)=>8+i),[])

  function assign(job: Job, user: User, hour: number) {
    const scheduledAt = new Date(`${date}T${String(hour).padStart(2,'0')}:00:00`).toISOString()
    db.jobs.update(job.id, { scheduledAt, assigneeId: user.id, status: 'Scheduled' }).then(()=>{
      setJobs(js=>js.map(j=>j.id===job.id?{...j, scheduledAt, assigneeId: user.id, status: 'Scheduled'}:j))
    })
  }

  return (
    <div className="card p-4">
      <div className="flex gap-3 items-center mb-3">
        <input type="date" className="input w-auto" value={date} onChange={e=>setDate(e.target.value)} />
        <div className="text-sm text-slate-500">Drag a job card into a cell to schedule</div>
      </div>
      <div className="overflow-auto">
        <table className="w-full min-w-[800px] border-collapse">
          <thead>
            <tr>
              <th className="text-left p-2">Tech/Hour</th>
              {hours.map(h=> <th key={h} className="p-2 text-left">{h}:00</th>)}
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-t">
                <td className="p-2 font-medium">{u.name}</td>
                {hours.map(h => (
                  <td key={h} className="p-2 align-top">
                    <DropZone onDrop={(job)=>assign(job, u, h)}>
                      {(jobs.filter(j=> j.assigneeId===u.id && j.scheduledAt && new Date(j.scheduledAt).getHours()===h && new Date(j.scheduledAt).toISOString().slice(0,10)===date)).map(j => (
                        <div key={j.id} className="card p-2 mb-2 text-xs">{j.jobNo}</div>
                      ))}
                    </DropZone>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4">
        <div className="font-semibold mb-2">Unscheduled</div>
        <div className="grid md:grid-cols-3 gap-2">
          {jobs.filter(j=>!j.scheduledAt).map(j => (
            <DraggableJob key={j.id} job={j} />
          ))}
        </div>
      </div>
    </div>
  )
}

function DraggableJob({ job }: { job: Job }) {
  return (
    <div draggable onDragStart={(e)=>{ e.dataTransfer.setData('text/plain', job.id) }} className="card p-2 cursor-move text-sm">
      {job.jobNo} – {job.priority}
    </div>
  )
}

function DropZone({ children, onDrop }: { children: React.ReactNode; onDrop: (job: Job)=>void }) {
  const [over, setOver] = useState(false)
  return (
    <div onDragOver={(e)=>{e.preventDefault(); setOver(true)}} onDragLeave={()=>setOver(false)} onDrop={async (e)=>{ setOver(false); const id = e.dataTransfer.getData('text/plain'); const job = await db.jobs.get(id); if(job) onDrop(job) }} className={`min-h-[80px] rounded border ${over?'border-indigo-500 bg-indigo-500/5':'border-dashed'}`}>
      {children}
    </div>
  )
}