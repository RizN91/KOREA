import { useEffect, useState } from 'react'
import { db, QuoteInvoice, Job, Customer, Site } from '../services/db'
import { pdfQuoteInvoice } from '../utils/pdf'

export default function QuotesInvoicesPage(){
  const [items, setItems] = useState<QuoteInvoice[]>([])
  const [jobs, setJobs] = useState<Job[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [sites, setSites] = useState<Site[]>([])
  useEffect(()=>{ db.sales.list().then(setItems); db.jobs.list().then(setJobs); db.customers.list().then(setCustomers); db.sites.list().then(setSites) }, [])

  function genPdf(it: QuoteInvoice){
    const job = jobs.find(j=>j.id===it.jobId)!; const cust = customers.find(c=>c.id===job.customerId)!; const site = sites.find(s=>s.id===job.siteId)!;
    const url = pdfQuoteInvoice(it, job, cust, site)
    const w = window.open()
    w?.document.write(`<iframe src="${url}" class='w-full h-full'></iframe>`)
  }

  return (
    <div className="space-y-3">
      <div className="text-xl font-semibold">Quotes & Invoices</div>
      <div className="card">
        <table className="w-full">
          <thead><tr><th className="p-2 text-left">Number</th><th className="p-2">Type</th><th className="p-2">Job</th><th className="p-2">Total</th><th className="p-2">Status</th><th className="p-2">PDF</th></tr></thead>
          <tbody>
            {items.map(it=> (
              <tr key={it.id} className="border-t">
                <td className="p-2">{it.number}</td>
                <td className="p-2">{it.type}</td>
                <td className="p-2">{jobs.find(j=>j.id===it.jobId)?.jobNo}</td>
                <td className="p-2">${it.total.toFixed(2)}</td>
                <td className="p-2">{it.status}</td>
                <td className="p-2"><button className="btn-secondary" onClick={()=>genPdf(it)}>Open PDF</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}