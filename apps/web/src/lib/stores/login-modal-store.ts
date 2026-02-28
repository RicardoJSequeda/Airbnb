import { create } from 'zustand'

interface LoginModalState {
  isOpen: boolean
  redirect: string
  open: (redirect?: string) => void
  close: () => void
}

export const useLoginModalStore = create<LoginModalState>((set) => ({
  isOpen: false,
  redirect: '/',
  open: (redirect = '/') => set({ isOpen: true, redirect }),
  close: () => set({ isOpen: false, redirect: '/' }),
}))
