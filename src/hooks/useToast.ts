import { useCallback } from 'react'
import { create } from 'zustand'

export type ToastVariant = 'default' | 'error' | 'success'

export interface ToastMessage {
  id: string
  message: string
  variant: ToastVariant
}

interface ToastStore {
  toasts: ToastMessage[]
  addToast: (message: string, variant?: ToastVariant) => void
  removeToast: (id: string) => void
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (message, variant = 'default') => {
    const id = crypto.randomUUID()
    set((state) => ({ toasts: [...state.toasts, { id, message, variant }] }))
    window.setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
    }, 5000)
  },
  removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}))

export function useToast() {
  const addToast = useToastStore((s) => s.addToast)
  const error = useCallback((message: string) => addToast(message, 'error'), [addToast])
  const success = useCallback((message: string) => addToast(message, 'success'), [addToast])
  return { toast: addToast, error, success }
}
