import { useEffect, useMemo, useState } from 'react'
import Fuse from 'fuse.js'
import { db, Job, JobStatus, Priority, Customer, Site } from '../services/db'
import JobStatusBadge from '../components/JobStatusBadge'
import { Link } from 'react-router-dom'
import { exportCsv, importCsv } from '../utils/csv'

export default function JobsList() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [selected, setSelected] = useState<Record<string, boolean>>({})
  const [q, setQ] = useState('')
  const [status, setStatus] = useState<JobStatus | 'All'>('All')
  const [priority, setPriority] = useState<Priority | 'All'>('All')

  useEffect(() => { db.jobs.list().then(setJobs) }, [])

  const fuse = useMemo(()=> new Fuse(jobs, { keys: ['jobNo','notes'], threshold: 0.3 }), [jobs])
  const filtered = useMemo(() => {
    let list = jobs
    if (status !== 'All') list = list.filter(j=>j.status===status)
    if (priority !== 'All') list = list.filter(j=>j.priority===priority)
    if (q) list = fuse.search(q).map(r=>r.item)
    return list
  }, [jobs, status, priority, q, fuse])

  function toggle(id: string) { setSelected(s=>({ ...s, [id]: !s[id] })) }

  function bulkStatus(to: JobStatus) {
    const ids = Object.keys(selected).filter(id => selected[id])
    if (!ids.length) return
    db.jobs.bulkUpdate(ids, { status: to }).then(()=> db.jobs.list().then(setJobs))
  }

  async function importFile(file: File){
    const rows = await importCsv(file)
    const customers = await db.customers.list()
    const sites = await db.sites.list()
    for (const r of rows) {
      if (!r.customerName) continue
      let cust = customers.find(c=>c.name===r.customerName)
      if (!cust) {
        const id = await db.customers.create({ name: r.customerName, contactName: r.contactName||'Manager', phone: r.phone||'03 9000 0000', email: r.email||`${r.customerName.toLowerCase().replace(/\s+/g,'')}@example.com`, notes: '', addresses: [{ street: r.street||'1 Import St', suburb: r.suburb||'Melbourne', state: r.state||'VIC', postcode: r.postcode||'3000', type:'Site' }] })
        cust = (await db.customers.get(id)) || cust
      }
      let site = sites.find(s=> s.customerId===cust!.id)
      if (!site) { site = { id: crypto.randomUUID(), customerId: cust!.id, address: cust!.addresses[0] }; }
      await db.jobs.create({ customerId: cust!.id, siteId: site.id, status: (r.status as JobStatus)||'New', priority: (r.priority as Priority)||'Normal', createdAt: new Date().toISOString(), assigneeId: undefined, scheduledAt: undefined, notes: r.notes, photos: [], parts: [], checklists: [] } as any)
    }
    db.jobs.list().then(setJobs)
  }

  return (
    <div className="space-y-3">
      <div className="card p-3 flex gap-2 flex-wrap items-center">
        <input placeholder="Search jobs…" className="input" value={q} onChange={e=>setQ(e.target.value)} />
        <select className="select w-auto" value={status} onChange={e=>setStatus(e.target.value as any)}>
          <option>All</option>
          {['New','Need to Measure','Measured','Quoted','Waiting Approval','Approved','In Production','Ready for Install','Scheduled','In Progress','Completed','Invoiced','Paid','On Hold','Cancelled'].map(s=> <option key={s}>{s}</option>)}
        </select>
        <select className="select w-auto" value={priority} onChange={e=>setPriority(e.target.value as any)}>
          <option>All</option>
          {['Low','Normal','High','Urgent'].map(s=> <option key={s}>{s}</option>)}
        </select>
        <div className="ml-auto flex gap-2 items-center">
          <button className="btn-secondary" onClick={()=>exportCsv(filtered, 'jobs.csv')}>Export CSV</button>
          <label className="btn-secondary cursor-pointer">Import CSV<input type="file" accept=".csv" className="hidden" onChange={e=> e.target.files && importFile(e.target.files[0])} /></label>
          <Link className="btn" to="/kanban">Kanban</Link>
        </div>
      </div>

      <div className="card">
        <table className="w-full text-left">
          <thead>
            <tr>
              <th className="p-2"></th>
              <th className="p-2">Job</th>
              <th className="p-2">Status</th>
              <th className="p-2">Priority</th>
              <th className="p-2">Scheduled</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(j => (
              <tr key={j.id} className="border-t">
                <td className="p-2"><input type="checkbox" checked={!!selected[j.id]} onChange={()=>toggle(j.id)} /></td>
                <td className="p-2"><Link to={`/jobs/${j.id}`} className="font-medium hover:underline">{j.jobNo}</Link></td>
                <td className="p-2"><JobStatusBadge status={j.status} /></td>
                <td className="p-2">{j.priority}</td>
                <td className="p-2">{j.scheduledAt ? new Date(j.scheduledAt).toLocaleString() : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card p-3 flex gap-2">
        <span className="text-sm text-slate-500">Bulk actions:</span>
        {['Need to Measure','Measured','Quoted','Waiting Approval','Approved','Scheduled','In Progress','Completed','Invoiced','Paid','Cancelled'].map(s=> (
          <button key={s} className="btn-secondary" onClick={()=>bulkStatus(s as JobStatus)}>{s}</button>
        ))}
      </div>
    </div>
  )
}