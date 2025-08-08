import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { db } from '../services/db'

export type Theme = 'light' | 'dark'

interface AppState {
  theme: Theme
  currentUserId: string
  initialize: () => Promise<void>
  setTheme: (t: Theme) => void
  setUser: (id: string) => void
}

export const useAppStore = create<AppState>()(persist((set, get) => ({
  theme: (localStorage.getItem('fsp_theme') as Theme) || 'dark',
  currentUserId: '',
  async initialize() {
    await db.ensureSeeded()
    const users = await db.users.list()
    const admin = users.find(u => u.role === 'Admin') || users[0]
    set({ currentUserId: admin?.id || '' })
  },
  setTheme(t) { set({ theme: t }) },
  setUser(id) { set({ currentUserId: id }) },
}), { name: 'fsp_app' }))