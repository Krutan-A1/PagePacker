import { useEffect, useRef, useState } from 'react'
import { ChevronDown, FileDown, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EXPORT_PRESETS, type ExportPreset } from '@/lib/export/exportPresets'
import { useExportStore } from '@/store/exportStore'
import { cn } from '@/lib/utils'

interface ExportMenuProps {
  disabled?: boolean
  onExport: (preset: ExportPreset) => void
}

export function ExportMenu({ disabled = false, onExport }: ExportMenuProps) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const isExporting = useExportStore((s) => s.isExporting)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  return (
    <div className="relative" ref={menuRef}>
      <Button
        variant="outline"
        size="sm"
        disabled={disabled || isExporting}
        onClick={() => setOpen((value) => !value)}
      >
        {isExporting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <FileDown className="h-4 w-4" />
        )}
        Export
        <ChevronDown className={cn('h-3 w-3 transition-transform', open && 'rotate-180')} />
      </Button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-64 rounded-lg border border-border bg-popover p-1 shadow-lg">
          {EXPORT_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              className="flex w-full flex-col rounded-md px-3 py-2 text-left hover:bg-accent"
              onClick={() => {
                setOpen(false)
                onExport(preset.id)
              }}
            >
              <span className="text-sm font-medium">{preset.label}</span>
              <span className="text-xs text-muted-foreground">{preset.description}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
