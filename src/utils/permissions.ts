import type { User } from '../services/db'

export function canEditJobs(user: User) { return user.role === 'Admin' || user.role === 'Scheduler' }
export function canSchedule(user: User) { return user.role !== 'Admin' ? user.role === 'Scheduler' : true }
export function canViewAllJobs(user: User) { return user.role !== 'Tech' }