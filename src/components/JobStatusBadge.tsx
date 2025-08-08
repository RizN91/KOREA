import type { JobStatus } from '../services/db'

const map: Record<JobStatus, string> = {
  'New': 'bg-slate-200 text-slate-900',
  'Need to Measure': 'bg-amber-200 text-amber-900',
  'Measured': 'bg-amber-300 text-amber-900',
  'Quoted': 'bg-blue-200 text-blue-900',
  'Waiting Approval': 'bg-yellow-200 text-yellow-900',
  'Approved': 'bg-green-200 text-green-900',
  'In Production': 'bg-indigo-200 text-indigo-900',
  'Ready for Install': 'bg-teal-200 text-teal-900',
  'Scheduled': 'bg-cyan-200 text-cyan-900',
  'In Progress': 'bg-purple-200 text-purple-900',
  'Completed': 'bg-emerald-200 text-emerald-900',
  'Invoiced': 'bg-fuchsia-200 text-fuchsia-900',
  'Paid': 'bg-emerald-300 text-emerald-900',
  'On Hold': 'bg-slate-400 text-white',
  'Cancelled': 'bg-rose-300 text-rose-900',
}

export default function JobStatusBadge({ status }: { status: JobStatus }) {
  return <span className={`badge ${map[status]}`}>{status}</span>
}