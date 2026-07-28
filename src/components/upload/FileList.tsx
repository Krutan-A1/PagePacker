import { motion, AnimatePresence } from 'framer-motion'
import { GripVertical, Trash2, FileText } from 'lucide-react'
import type { SourceFileInput } from '@/lib/documents/documentProcessor'
import { formatBytes } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface FileListProps {
  files: SourceFileInput[]
  onRemove: (id: string) => void
  onReorder: (fromIndex: number, toIndex: number) => void
  disabled?: boolean
  compact?: boolean
}

export function FileList({ files, onRemove, onReorder, disabled = false, compact = false }: FileListProps) {
  if (files.length === 0) return null

  return (
    <div className="space-y-2">
      {!compact && (
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Uploaded files</h3>
          <span className="text-xs text-muted-foreground">
            {files.length} file{files.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      <ul className="space-y-2">
        <AnimatePresence initial={false}>
          {files.map((file, index) => (
            <FileListItem
              key={file.id}
              file={file}
              index={index}
              disabled={disabled}
              compact={compact}
              onRemove={() => onRemove(file.id)}
              onDropAt={(fromIndex) => onReorder(fromIndex, index)}
            />
          ))}
        </AnimatePresence>
      </ul>

      {!compact && (
        <p className="hidden text-xs text-muted-foreground sm:block">Drag to reorder merge sequence</p>
      )}
    </div>
  )
}

function FileListItem({
  file,
  index,
  disabled,
  compact = false,
  onRemove,
  onDropAt,
}: {
  file: SourceFileInput
  index: number
  disabled: boolean
  compact?: boolean
  onRemove: () => void
  onDropAt: (fromIndex: number) => void
}) {
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -12, height: 0 }}
      transition={{ duration: 0.2 }}
      draggable={!disabled}
      onDragStart={(e) => {
        const dragEvent = e as unknown as React.DragEvent<HTMLLIElement>
        dragEvent.dataTransfer?.setData('text/plain', String(index))
        if (dragEvent.dataTransfer) dragEvent.dataTransfer.effectAllowed = 'move'
      }}
      onDragOver={(e) => {
        e.preventDefault()
      }}
      onDrop={(e) => {
        const dragEvent = e as unknown as React.DragEvent<HTMLLIElement>
        dragEvent.preventDefault()
        const fromIndex = Number(dragEvent.dataTransfer?.getData('text/plain'))
        if (!Number.isNaN(fromIndex)) onDropAt(fromIndex)
      }}
      className={cn(
        'flex items-center gap-2 rounded-lg border border-border bg-card text-sm',
        compact ? 'px-2.5 py-1.5' : 'px-3 py-2',
        disabled && 'opacity-60',
      )}
    >
      <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-muted-foreground active:cursor-grabbing" />
      <FileText className="h-4 w-4 shrink-0 text-primary" />
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{file.name}</p>
        {!compact && (
          <p className="text-xs text-muted-foreground">
            {file.type.toUpperCase()} · {formatBytes(file.file.size)}
          </p>
        )}
      </div>
      <button
        type="button"
        disabled={disabled}
        onClick={onRemove}
        className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
        aria-label={`Remove ${file.name}`}
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </motion.li>
  )
}
