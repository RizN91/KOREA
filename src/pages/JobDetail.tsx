import { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { db, Job, JobStatus, Part, QuoteInvoiceLine, Customer, Site } from '../services/db'
import JobStatusBadge from '../components/JobStatusBadge'
import PhotoUploader from '../components/PhotoUploader'
import { nextStatuses } from '../utils/statusMachine'
import { pdfLabel } from '../utils/pdf'
import QR from '../components/QR'

export default function JobDetail(){
  const { id } = useParams()
  const [job, setJob] = useState<Job | null>(null)
  const [parts, setParts] = useState<Part[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [sites, setSites] = useState<Site[]>([])

  useEffect(()=>{ if(id) db.jobs.get(id).then(setJob); db.parts.list().then(setParts); db.customers.list().then(setCustomers); db.sites.list().then(setSites) },[id])

  if (!job) return <div>Loading…</div>
  const customer = customers.find(c=>c.id===job.customerId)
  const site = sites.find(s=>s.id===job.siteId)

  function update(patch: Partial<Job>){ db.jobs.update(job.id, patch).then(()=> setJob(j=> j?{...j,...patch}:j)) }

  function addQuote(){
    const lines: QuoteInvoiceLine[] = [ ...(job.parts||[]).map(it=> { const p = parts.find(x=>x.id===it.partId)!; return { id: crypto.randomUUID(), sku: p.sku, description: p.name, qty: it.qty, priceEx: p.priceEx, taxRate: p.taxRate } }), { id: crypto.randomUUID(), description: 'Labour', qty: 1, priceEx: 120, taxRate: 0.1 } ]
    db.sales.createQuote(job.id, lines).then(id=> update({ quoteId: id }))
  }

  function addInvoice(){
    const lines: QuoteInvoiceLine[] = [ ...(job.parts||[]).map(it=> { const p = parts.find(x=>x.id===it.partId)!; return { id: crypto.randomUUID(), sku: p.sku, description: p.name, qty: it.qty, priceEx: p.priceEx, taxRate: p.taxRate } }), { id: crypto.randomUUID(), description: 'Labour', qty: 1, priceEx: 120, taxRate: 0.1 } ]
    db.sales.createInvoice(job.id, lines).then(id=> update({ invoiceId: id }))
  }

  function label(){ if(!customer||!site) return; const url = pdfLabel(job, customer, site); const w = window.open(); w?.document.write(`<iframe src="${url}" class='w-full h-full'></iframe>`) }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="text-xl font-semibold">{job.jobNo}</div>
        <JobStatusBadge status={job.status} />
        <div className="ml-auto flex gap-2">
          {nextStatuses(job.status).map(s=> <button key={s} className="btn-secondary" onClick={()=>update({ status: s })}>{s}</button>)}
          <button className="btn" onClick={addQuote}>Create Quote</button>
          <button className="btn" onClick={addInvoice}>Create Invoice</button>
          <button className="btn-secondary" onClick={label}>Label PDF</button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="card p-3 space-y-3 md:col-span-2">
          <Tabs tabs={['Overview','Measurements','Parts','Photos','Notes','Documents','Timeline']}>
            <div className="space-y-2">
              <div>Customer: {customer?.name}</div>
              <div>Site: {site? `${site.address.street}, ${site.address.suburb}`: ''}</div>
              <div>Priority: {job.priority}</div>
              <div className="flex items-center gap-3">
                <QR text={`${location.origin}/jobs/${job.id}`} />
                <Link to="/scan" className="btn-secondary">Scan</Link>
              </div>
            </div>
            <Measurements job={job} onChange={update} />
            <PartsTab job={job} parts={parts} onChange={update} />
            <PhotoUploader photos={job.photos} setPhotos={(p)=>update({ photos: p })} />
            <textarea className="input min-h-[120px]" value={job.notes||''} onChange={e=>update({ notes: e.target.value })} placeholder="Internal notes" />
            <div>Documents coming soon</div>
            <Timeline jobId={job.id} />
          </Tabs>
        </div>
        <div className="card p-3">
          <div className="font-semibold mb-2">Schedule</div>
          <input type="datetime-local" className="input" value={job.scheduledAt? job.scheduledAt.slice(0,16): ''} onChange={e=>update({ scheduledAt: e.target.value? new Date(e.target.value).toISOString(): undefined })} />
        </div>
      </div>
    </div>
  )
}

function Tabs({ tabs, children }: { tabs: string[]; children: React.ReactNode[] }){
  const [idx, setIdx] = useState(0)
  return (
    <div>
      <div className="flex gap-2 mb-3 overflow-auto">
        {tabs.map((t,i)=> <button key={t} className={`btn-secondary whitespace-nowrap ${i===idx?'bg-indigo-600 text-white':''}`} onClick={()=>setIdx(i)}>{t}</button>)}
      </div>
      <div>{children[idx]}</div>
    </div>
  )
}

function Measurements({ job, onChange }: { job: Job; onChange: (p: Partial<Job>)=>void }){
  const [A, setA] = useState(job.measurements?.A || 0)
  const [C, setC] = useState(job.measurements?.C || 0)
  const [profileCode, setProfile] = useState(job.profileCode || '')
  const [colour, setColour] = useState(job.sealColour || 'black')
  const [qty, setQty] = useState(job.qty || 1)
  useEffect(()=>{ onChange({ measurements: { A, C }, profileCode, sealColour: colour as any, qty }) }, [A,C,profileCode,colour,qty])

  const suggestion = useMemo(()=> suggestProfile(A, C), [A,C])

  return (
    <div className="grid md:grid-cols-4 gap-2">
      <div>
        <label className="label">A (width)</label>
        <input type="number" className="input" value={A} onChange={e=>setA(Number(e.target.value))} />
      </div>
      <div>
        <label className="label">C (height)</label>
        <input type="number" className="input" value={C} onChange={e=>setC(Number(e.target.value))} />
      </div>
      <div>
        <label className="label">Colour</label>
        <select className="select" value={colour} onChange={e=>setColour(e.target.value as any)}>
          <option value="black">Black</option>
          <option value="grey">Grey</option>
        </select>
      </div>
      <div>
        <label className="label">Quantity</label>
        <input type="number" className="input" value={qty} onChange={e=>setQty(Number(e.target.value))} />
      </div>
      <div className="md:col-span-4">
        <label className="label">Profile</label>
        <input className="input" value={profileCode} onChange={e=>setProfile(e.target.value)} placeholder="e.g., RP423" />
        {suggestion && <div className="text-xs text-slate-500 mt-1">Suggestion: {suggestion}</div>}
      </div>
    </div>
  )
}

function suggestProfile(A:number, C:number){
  if (!A || !C) return ''
  if (A<500 || C<500) return 'RP215'
  if (A>800 || C>1800) return 'RP423'
  return 'RP143'
}

function PartsTab({ job, parts, onChange }: { job: Job; parts: Part[]; onChange: (p: Partial<Job>)=>void }){
  const [lines, setLines] = useState(job.parts)
  useEffect(()=>onChange({ parts: lines }), [lines])

  function add(p: Part){ setLines(ls=> [...ls, { partId: p.id, qty: 1 }]) }
  return (
    <div className="grid md:grid-cols-2 gap-3">
      <div>
        <div className="font-semibold mb-2">Selected Parts</div>
        <ul className="space-y-1">
          {lines.map((l,i)=> <li key={i} className="flex items-center gap-2"><span className="flex-1">{parts.find(p=>p.id===l.partId)?.name}</span><input type="number" className="input w-20" value={l.qty} onChange={e=> setLines(ls=> ls.map((x,xi)=> xi===i?{...x, qty:Number(e.target.value)}:x))} /></li>)}
        </ul>
      </div>
      <div>
        <div className="font-semibold mb-2">Inventory</div>
        <div className="max-h-64 overflow-auto space-y-1">
          {parts.map(p=> <div key={p.id} className="flex items-center gap-2"><div className="flex-1">{p.name} – ${p.priceEx.toFixed(2)}</div><button className="btn-secondary" onClick={()=>add(p)}>Add</button></div>)}
        </div>
      </div>
    </div>
  )
}

function Timeline({ jobId }: { jobId: string }){
  const [items, setItems] = useState<{ ts: string; text: string }[]>([])
  useEffect(()=>{ db.activities.listForJob(jobId).then(ls=> setItems(ls.map(a=>({ ts: a.timestamp, text: `${a.action}` })))) },[jobId])
  return (
    <ul className="space-y-1">
      {items.map((it,i)=> <li key={i} className="text-sm"><span className="text-slate-500 mr-2">{new Date(it.ts).toLocaleString()}</span>{it.text}</li>)}
    </ul>
  )
}