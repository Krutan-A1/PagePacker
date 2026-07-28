import { X } from 'lucide-react'
import { useToastStore } from '@/hooks/useToast'
import { cn } from '@/lib/utils'

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts)
  const removeToast = useToastStore((s) => s.removeToast)

  if (toasts.length === 0) return null

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            'pointer-events-auto flex items-start gap-3 rounded-lg border px-4 py-3 text-sm shadow-lg',
            toast.variant === 'error' && 'border-destructive/50 bg-destructive/10 text-destructive',
            toast.variant === 'success' && 'border-primary/30 bg-primary/10 text-foreground',
            toast.variant === 'default' && 'border-border bg-card text-foreground',
          )}
        >
          <p className="flex-1">{toast.message}</p>
          <button
            type="button"
            onClick={() => removeToast(toast.id)}
            className="shrink-0 opacity-70 hover:opacity-100"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
