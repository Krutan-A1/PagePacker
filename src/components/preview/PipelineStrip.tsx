import type { ComponentType } from 'react'
import { ArrowDown, FileText, Layers, LayoutTemplate } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PipelineStripProps {
  hasDocument: boolean
  isConverted: boolean
  hasPreview: boolean
  compact?: boolean
  className?: string
}

export function PipelineStrip({
  hasDocument,
  isConverted,
  hasPreview,
  compact = false,
  className,
}: PipelineStripProps) {
  if (compact) {
    const step = hasPreview ? 3 : hasDocument && isConverted ? 2 : hasDocument ? 1 : 0
    return (
      <div className={cn('flex items-center gap-2', className)}>
        {[1, 2, 3].map((index) => (
          <div
            key={index}
            className={cn(
              'h-1.5 flex-1 rounded-full',
              index <= step ? 'bg-primary' : 'bg-muted',
            )}
          />
        ))}
      </div>
    )
  }

  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground sm:gap-3',
        className,
      )}
    >
      <PipelineStep icon={FileText} label="Original document" active={hasDocument} />
      <ArrowDown className="hidden h-4 w-4 rotate-[-90deg] sm:block" />
      <PipelineStep icon={Layers} label="Converted pages" active={isConverted} />
      <ArrowDown className="hidden h-4 w-4 rotate-[-90deg] sm:block" />
      <PipelineStep icon={LayoutTemplate} label="Final printable sheet" active={hasPreview} />
    </div>
  )
}

function PipelineStep({
  icon: Icon,
  label,
  active,
}: {
  icon: ComponentType<{ className?: string }>
  label: string
  active: boolean
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-full px-2.5 py-1 sm:px-3 sm:py-1.5',
        active ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground',
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="hidden text-xs sm:inline sm:text-sm">{label}</span>
    </div>
  )
}
