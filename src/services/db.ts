import { format } from 'date-fns'
import { v4 as uuidv4 } from './uuid'

// Entities
export type Address = { street: string; suburb: string; state: string; postcode: string; type: 'Billing' | 'Site' }
export interface Customer { id: string; name: string; contactName: string; phone: string; email: string; notes?: string; addresses: Address[] }
export interface Site { id: string; customerId: string; address: Address; accessNotes?: string; onsiteContact?: string; parkingNotes?: string }
export type JobStatus =
  | 'New' | 'Need to Measure' | 'Measured' | 'Quoted' | 'Waiting Approval' | 'Approved' | 'In Production' | 'Ready for Install' | 'Scheduled' | 'In Progress' | 'Completed' | 'Invoiced' | 'Paid' | 'On Hold' | 'Cancelled'
export type Priority = 'Low' | 'Normal' | 'High' | 'Urgent'
export interface Activity { id: string; jobId: string; timestamp: string; actorId: string; action: string; meta?: any }
export interface Photo { id: string; url: string; caption?: string }
export interface ChecklistItem { id: string; name: string; done: boolean; requiresPhoto?: boolean; photoId?: string }
export interface Part { id: string; sku: string; name: string; profileCode: string; colour: 'black' | 'grey'; lengthMm: number; priceEx: number; taxRate: number; stockQty: number }
export interface User { id: string; shortCode: string; name: string; role: 'Admin' | 'Scheduler' | 'Tech'; mobile: string; email: string }
export interface QuoteInvoiceLine { id: string; sku?: string; description: string; qty: number; priceEx: number; taxRate: number }
export interface QuoteInvoice { id: string; number: string; jobId: string; lineItems: QuoteInvoiceLine[]; subtotal: number; tax: number; total: number; status: 'Draft' | 'Sent' | 'Accepted' | 'Declined' | 'Paid'; pdfUrl?: string; type: 'quote' | 'invoice' }
export interface Timesheet { id: string; userId: string; jobId: string; start: string; end?: string; travelKm?: number }
export interface Job {
  id: string
  jobNo: string
  customerId: string
  siteId: string
  status: JobStatus
  priority: Priority
  createdAt: string
  scheduledAt?: string
  assigneeId?: string
  measurements?: { A: number; C: number }
  sealColour?: 'black' | 'grey'
  profileCode?: string
  qty?: number
  photos: Photo[]
  notes?: string
  parts: { partId: string; qty: number }[]
  checklists: ChecklistItem[]
  quoteId?: string
  invoiceId?: string
  signatureUrl?: string
}

// Utilities
const LS_KEY = 'fsp_db_v1'

interface DBShape {
  customers: Customer[]
  sites: Site[]
  jobs: Job[]
  users: User[]
  parts: Part[]
  activities: Activity[]
  sales: QuoteInvoice[]
  timesheets: Timesheet[]
  counters: { job: number; quote: number; invoice: number }
}

function read(): DBShape | null {
  const json = localStorage.getItem(LS_KEY)
  return json ? JSON.parse(json) as DBShape : null
}
function write(db: DBShape) {
  localStorage.setItem(LS_KEY, JSON.stringify(db))
}

function nextJobNumber(n: number) {
  return `JB${String(n).padStart(4, '0')}`
}
function nextQuoteNumber(n: number) {
  return `Q${String(n).padStart(4, '0')}`
}
function nextInvoiceNumber(n: number) {
  return `INV${String(n).padStart(4, '0')}`
}

// Seed
function seed(): DBShape {
  const users: User[] = [
    { id: uuidv4(), shortCode: 'FS', name: 'Brett Taylor', role: 'Admin', mobile: '0400 000 001', email: 'brett@example.com' },
    { id: uuidv4(), shortCode: 'MK', name: 'Mark Jacobs', role: 'Tech', mobile: '0400 000 002', email: 'mark@example.com' },
    { id: uuidv4(), shortCode: 'JS', name: 'Jess Lee', role: 'Scheduler', mobile: '0400 000 003', email: 'jess@example.com' },
  ]

  function addr(street: string, suburb: string): Address { return { street, suburb, state: 'VIC', postcode: '3000', type: 'Site' } }

  const customerNames = [
    'Provincial Hotel', 'Morris House', 'Bekka', 'Convenience Store', 'The Posty', 'Beer Deluxe Fed Square', 'Station Hotel', 'Lakeside Pavilion', 'Yarra Botanica AVC', 'Queen Victoria Market', 'Grand Hotel', 'Southbank Deli', 'Prahran Supermarket', 'Moonee Ponds IGA', 'Clifton Hill Bakery', 'Carlton Café', 'Richmond Grocer', 'Docklands Pub', 'St Kilda Bistro', 'Brunswick Eatery', 'Melbourne Marriott', 'Fitzroy Microbrewery', 'Collingwood Café', 'Northcote RSL', 'Footscray Market'
  ]
  const customers: Customer[] = customerNames.map((name, idx) => ({
    id: uuidv4(),
    name,
    contactName: 'Manager',
    phone: `03 9${String(300000 + idx).slice(0,6)}`,
    email: name.toLowerCase().replace(/\s+/g,'') + '@example.com',
    notes: 'VIP customer',
    addresses: [addr(`${100+idx} High St`, 'Melbourne')]
  }))

  const sites: Site[] = customers.map(c => ({ id: uuidv4(), customerId: c.id, address: c.addresses[0] }))

  const parts: Part[] = [
    { id: uuidv4(), sku: 'RP423-2100', name: 'Raven RP423', profileCode: 'RP423', colour: 'black', lengthMm: 2100, priceEx: 28, taxRate: 0.1, stockQty: 60 },
    { id: uuidv4(), sku: 'RP215-2100', name: 'Raven RP215', profileCode: 'RP215', colour: 'grey', lengthMm: 2100, priceEx: 26, taxRate: 0.1, stockQty: 40 },
    { id: uuidv4(), sku: 'RP143-2100', name: 'Raven RP143', profileCode: 'RP143', colour: 'black', lengthMm: 2100, priceEx: 24, taxRate: 0.1, stockQty: 35 }
  ]

  const statuses: JobStatus[] = ['New','Need to Measure','Measured','Quoted','Waiting Approval','Approved','In Production','Ready for Install','Scheduled','In Progress','Completed','Invoiced','Paid']

  const jobs: Job[] = Array.from({ length: 45 }).map((_, i) => {
    const customer = customers[i % customers.length]
    const site = sites.find(s => s.customerId === customer.id)!
    const created = new Date(); created.setDate(created.getDate() - (45 - i))
    const status = statuses[i % statuses.length]
    return {
      id: uuidv4(),
      jobNo: nextJobNumber(1000 + i),
      customerId: customer.id,
      siteId: site.id,
      status,
      priority: (['Low','Normal','High','Urgent'] as const)[i % 4],
      createdAt: created.toISOString(),
      scheduledAt: undefined,
      assigneeId: users[(i % users.length)].id,
      photos: [],
      parts: [],
      checklists: [],
      signatureUrl: undefined,
    }
  })

  const activities: Activity[] = jobs.map(j => ({ id: uuidv4(), jobId: j.id, timestamp: new Date().toISOString(), actorId: users[0].id, action: 'Created', meta: { jobNo: j.jobNo } }))

  const sales: QuoteInvoice[] = []
  const timesheets: Timesheet[] = []

  return { customers, sites, jobs, users, parts, activities, sales, timesheets, counters: { job: 1045, quote: 100, invoice: 100 } }
}

function getDB(): DBShape {
  const existing = read()
  if (existing) return existing
  const seeded = seed()
  write(seeded)
  return seeded
}

function saveDB(mutator: (db: DBShape) => void) {
  const db = getDB()
  mutator(db)
  write(db)
}

function delay<T>(value: T, ms = 150) { return new Promise<T>(res => setTimeout(() => res(value), ms)) }

// API
export const db = {
  async ensureSeeded() { getDB(); return delay(true) },
  customers: {
    async list() { return delay(getDB().customers) },
    async get(id: string) { return delay(getDB().customers.find(c=>c.id===id) || null) },
    async create(c: Omit<Customer,'id'>) { const id = uuidv4(); saveDB(db=>{db.customers.push({ ...c, id })}); return delay(id) },
    async update(id: string, patch: Partial<Customer>) { saveDB(db=>{const i=db.customers.findIndex(c=>c.id===id); if(i>=0) db.customers[i]={...db.customers[i],...patch}}); return delay(true) },
    async remove(id: string) { saveDB(db=>{db.customers = db.customers.filter(c=>c.id!==id)}) ; return delay(true) },
  },
  sites: {
    async list() { return delay(getDB().sites) },
    async byCustomer(customerId: string) { return delay(getDB().sites.filter(s=>s.customerId===customerId)) },
  },
  users: {
    async list() { return delay(getDB().users) },
    async get(id: string) { return delay(getDB().users.find(u=>u.id===id) || null) },
  },
  parts: {
    async list() { return delay(getDB().parts) },
    async update(id: string, patch: Partial<Part>) { saveDB(db=>{const i=db.parts.findIndex(p=>p.id===id); if(i>=0) db.parts[i]={...db.parts[i],...patch}}); return delay(true) },
    async create(p: Omit<Part,'id'>) { const id = uuidv4(); saveDB(db=>{db.parts.push({ ...p, id })}); return delay(id) },
  },
  jobs: {
    async list() { return delay(getDB().jobs) },
    async get(id: string) { return delay(getDB().jobs.find(j=>j.id===id) || null) },
    async byStatus(status: JobStatus) { return delay(getDB().jobs.filter(j=>j.status===status)) },
    async create(input: Omit<Job,'id'|'jobNo'|'photos'|'parts'|'checklists'>) {
      let id = uuidv4();
      let jobNo = ''; saveDB(db=>{ const n = ++db.counters.job; jobNo = nextJobNumber(n); db.jobs.push({ ...input, id, jobNo, photos: [], parts: [], checklists: [] }) })
      return delay(id)
    },
    async update(id: string, patch: Partial<Job>) { saveDB(db=>{const i=db.jobs.findIndex(j=>j.id===id); if(i>=0) db.jobs[i] = { ...db.jobs[i], ...patch } }); return delay(true) },
    async bulkUpdate(ids: string[], patch: Partial<Job>) { saveDB(db=>{db.jobs = db.jobs.map(j=> ids.includes(j.id) ? { ...j, ...patch } : j) }); return delay(true) },
  },
  activities: {
    async listForJob(jobId: string) { return delay(getDB().activities.filter(a=>a.jobId===jobId).sort((a,b)=>a.timestamp.localeCompare(b.timestamp))) },
    async log(jobId: string, actorId: string, action: string, meta?: any) { saveDB(db=>{db.activities.push({ id: uuidv4(), jobId, timestamp: new Date().toISOString(), actorId, action, meta }) }); return delay(true) }
  },
  sales: {
    async list() { return delay(getDB().sales) },
    async createQuote(jobId: string, lines: QuoteInvoiceLine[]) { let id = uuidv4(), number=''; saveDB(db=>{ const n = ++db.counters.quote; number = nextQuoteNumber(n); const subtotal = lines.reduce((s,l)=>s+l.priceEx*l.qty,0); const tax = lines.reduce((s,l)=>s+l.priceEx*l.qty*l.taxRate,0); const total = subtotal+tax; db.sales.push({ id, number, jobId, lineItems: lines, subtotal, tax, total, status: 'Draft', type: 'quote' }) }); return delay(id) },
    async createInvoice(jobId: string, lines: QuoteInvoiceLine[]) { let id = uuidv4(), number=''; saveDB(db=>{ const n = ++db.counters.invoice; number = nextInvoiceNumber(n); const subtotal = lines.reduce((s,l)=>s+l.priceEx*l.qty,0); const tax = lines.reduce((s,l)=>s+l.priceEx*l.qty*l.taxRate,0); const total = subtotal+tax; db.sales.push({ id, number, jobId, lineItems: lines, subtotal, tax, total, status: 'Draft', type: 'invoice' }) }); return delay(id) },
    async update(id: string, patch: Partial<QuoteInvoice>) { saveDB(db=>{const i=db.sales.findIndex(s=>s.id===id); if(i>=0) db.sales[i]={...db.sales[i],...patch}}); return delay(true) },
  },
}