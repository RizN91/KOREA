import { useEffect, useMemo, useState } from 'react'
import Fuse from 'fuse.js'
import { db, Customer, Site, Job } from '../services/db'
import { Link, useSearchParams } from 'react-router-dom'

export default function SearchPage(){
  const [params] = useSearchParams()
  const [jobs, setJobs] = useState<Job[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [sites, setSites] = useState<Site[]>([])
  const [q, setQ] = useState(params.get('q') || '')

  useEffect(()=>{ db.jobs.list().then(setJobs); db.customers.list().then(setCustomers); db.sites.list().then(setSites) }, [])

  const fuse = useMemo(()=> new Fuse([ ...jobs.map(j=>({type:'Job', id:j.id, label:j.jobNo})), ...customers.map(c=>({type:'Customer', id:c.id, label:c.name})), ...sites.map(s=>({type:'Site', id:s.id, label:s.address.street + ' ' + s.address.suburb})) ], { keys:['label'], threshold:0.3 }), [jobs, customers, sites])

  const res = q? fuse.search(q).slice(0,50) : []

  return (
    <div className="space-y-3">
      <div className="text-xl font-semibold">Search</div>
      <input className="input" value={q} onChange={e=>setQ(e.target.value)} placeholder="Search Jobs, Customers, Sites" />
      <div className="card">
        <ul>
          {res.map(r=> (
            <li key={r.item.type+r.item.id} className="border-t p-2">{r.item.type}: {r.item.label} {r.item.type==='Job' && <Link className="text-indigo-600" to={`/jobs/${r.item.id}`}>Open</Link>}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}