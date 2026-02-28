import { create } from 'zustand'

interface RegisterModalState {
  isOpen: boolean
  redirect: string
  open: (redirect?: string) => void
  close: () => void
}

export const useRegisterModalStore = create<RegisterModalState>((set) => ({
  isOpen: false,
  redirect: '/',
  open: (redirect = '/') => set({ isOpen: true, redirect }),
  close: () => set({ isOpen: false, redirect: '/' }),
}))
