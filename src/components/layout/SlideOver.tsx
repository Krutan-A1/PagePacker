import { type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { SettingsPanelContent } from '@/components/settings/SettingsPanel'
import { Button } from '@/components/ui/button'

interface SlideOverProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  side?: 'left' | 'right'
  children: ReactNode
  hideFrom?: 'lg' | 'xl' | '2xl'
}

export function SlideOver({
  open,
  onClose,
  title,
  description,
  side = 'left',
  children,
  hideFrom = 'lg',
}: SlideOverProps) {
  const hideClass =
    hideFrom === '2xl' ? '2xl:hidden' : hideFrom === 'xl' ? 'xl:hidden' : 'lg:hidden'

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            aria-label="Close panel"
            className={`fixed inset-0 z-40 bg-black/40 ${hideClass}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            className={`fixed inset-y-0 z-50 flex w-[min(100vw,320px)] flex-col border-border bg-card shadow-xl ${hideClass} ${
              side === 'left' ? 'left-0 border-r' : 'right-0 border-l'
            }`}
            initial={{ x: side === 'left' ? '-100%' : '100%' }}
            animate={{ x: 0 }}
            exit={{ x: side === 'left' ? '-100%' : '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div>
                <h2 className="text-base font-semibold">{title}</h2>
                {description && <p className="text-xs text-muted-foreground">{description}</p>}
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}

export function SettingsDrawer({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  return (
    <SlideOver
      open={open}
      onClose={onClose}
      side="left"
      title="Booklet Settings"
      description="Configure layout and print options"
    >
      <SettingsPanelContent />
    </SlideOver>
  )
}

export function InfoDrawer({
  open,
  onClose,
  children,
}: {
  open: boolean
  onClose: () => void
  children: ReactNode
}) {
  return (
    <SlideOver
      open={open}
      onClose={onClose}
      side="right"
      hideFrom="2xl"
      title="Document Info"
      description="File and layout statistics"
    >
      {children}
    </SlideOver>
  )
}
