import type { JobStatus } from '../services/db'

export const STATUS_FLOW: JobStatus[] = [
  'New','Need to Measure','Measured','Quoted','Waiting Approval','Approved','In Production','Ready for Install','Scheduled','In Progress','Completed','Invoiced','Paid'
]

const CANCEL_SET: JobStatus[] = ['On Hold','Cancelled']

export function nextStatuses(current: JobStatus): JobStatus[] {
  const idx = STATUS_FLOW.indexOf(current)
  const options: JobStatus[] = []
  if (idx >= 0 && idx < STATUS_FLOW.length - 1) options.push(STATUS_FLOW[idx + 1])
  // allow skipping certain steps for admin convenience
  if (idx >= 0 && idx + 2 < STATUS_FLOW.length) options.push(STATUS_FLOW[idx + 2])
  return [...options, ...CANCEL_SET]
}

export function canTransition(from: JobStatus, to: JobStatus): boolean {
  if (from === to) return false
  if (CANCEL_SET.includes(to)) return true
  const idx = STATUS_FLOW.indexOf(from)
  const tidx = STATUS_FLOW.indexOf(to)
  if (idx === -1 || tidx === -1) return false
  return tidx >= idx && tidx - idx <= 2
}

export function assertTransition(from: JobStatus, to: JobStatus) {
  if (!canTransition(from, to)) throw new Error(`Invalid transition ${from} -> ${to}`)
}