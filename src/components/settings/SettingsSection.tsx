import { useState, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SettingsSectionProps {
  title: string
  description?: string
  children: ReactNode
  className?: string
  defaultOpen?: boolean
  collapsible?: boolean
}

export function SettingsSection({
  title,
  description,
  children,
  className,
  defaultOpen = true,
  collapsible = true,
}: SettingsSectionProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <section className={cn('border-b border-border pb-5 last:border-b-0', className)}>
      <button
        type="button"
        className={cn(
          'flex w-full items-start justify-between gap-2 text-left',
          collapsible && 'cursor-pointer',
        )}
        onClick={() => collapsible && setOpen((value) => !value)}
        aria-expanded={open}
      >
        <div>
          <h3 className="text-sm font-semibold">{title}</h3>
          {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
        </div>
        {collapsible && (
          <ChevronDown
            className={cn(
              'mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-transform',
              open && 'rotate-180',
            )}
          />
        )}
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="space-y-3 pt-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

interface OptionButtonProps {
  selected: boolean
  onClick: () => void
  children: ReactNode
  className?: string
}

export function OptionButton({ selected, onClick, children, className }: OptionButtonProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      className={cn(
        'rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
        selected
          ? 'border-primary bg-primary/10 text-primary shadow-sm ring-1 ring-primary/30'
          : 'border-border bg-card text-foreground hover:border-primary/40 hover:bg-accent',
        className,
      )}
    >
      {children}
    </motion.button>
  )
}

export function OptionGrid({ children, cols = 3 }: { children: ReactNode; cols?: 2 | 3 | 4 }) {
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
  }
  return <div className={cn('grid gap-2', gridCols[cols])}>{children}</div>
}
