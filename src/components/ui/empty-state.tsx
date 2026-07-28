import { type ReactNode } from 'react'
import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  hint?: string
  action?: ReactNode
}

export function EmptyState({ icon: Icon, title, description, hint, action }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center py-12 text-center"
    >
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Icon className="h-8 w-8" />
      </div>
      <h2 className="mb-2 text-lg font-semibold">{title}</h2>
      <p className="max-w-md text-sm text-muted-foreground">{description}</p>
      {hint && <p className="mt-3 text-xs text-muted-foreground">{hint}</p>}
      {action && <div className="mt-6">{action}</div>}
    </motion.div>
  )
}
