import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Upload, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DropZoneProps {
  onFilesSelected: (files: File[]) => void
  disabled?: boolean
  compact?: boolean
  /** Minimal bar for adding more files when a document is already loaded */
  inline?: boolean
}

export function DropZone({
  onFilesSelected,
  disabled = false,
  compact = false,
  inline = false,
}: DropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList || disabled) return
    onFilesSelected(Array.from(fileList))
  }

  if (inline) {
    return (
      <div
        className={cn(
          'flex items-center justify-center rounded-lg border border-dashed border-border bg-muted/20 px-3 py-2 text-sm transition-colors',
          isDragging && 'border-primary bg-primary/5',
          disabled && 'pointer-events-none opacity-60',
        )}
        onDragEnter={(e) => {
          e.preventDefault()
          if (!disabled) setIsDragging(true)
        }}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={(e) => {
          e.preventDefault()
          setIsDragging(false)
        }}
        onDrop={(e) => {
          e.preventDefault()
          setIsDragging(false)
          handleFiles(e.dataTransfer.files)
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          multiple
          className="hidden"
          disabled={disabled}
          onChange={(e) => {
            handleFiles(e.target.files)
            e.target.value = ''
          }}
        />
        <button
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-1.5 font-medium text-primary hover:text-primary/80 disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          {isDragging ? 'Drop to add files' : 'Add more files'}
        </button>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25 }}
      className={cn(
        'relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors',
        compact ? 'p-6' : 'flex-1 p-10',
        isDragging ? 'border-primary bg-primary/5' : 'border-border bg-muted/20',
        disabled && 'pointer-events-none opacity-60',
      )}
      onDragEnter={(e) => {
        e.preventDefault()
        if (!disabled) setIsDragging(true)
      }}
      onDragOver={(e) => e.preventDefault()}
      onDragLeave={(e) => {
        e.preventDefault()
        setIsDragging(false)
      }}
      onDrop={(e) => {
        e.preventDefault()
        setIsDragging(false)
        handleFiles(e.dataTransfer.files)
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        multiple
        className="hidden"
        disabled={disabled}
        onChange={(e) => {
          handleFiles(e.target.files)
          e.target.value = ''
        }}
      />

      <div
        className={cn(
          'mb-4 flex items-center justify-center rounded-2xl bg-primary/10 text-primary',
          compact ? 'h-12 w-12' : 'h-16 w-16',
        )}
      >
        {isDragging ? (
          <Upload className={compact ? 'h-6 w-6' : 'h-8 w-8'} />
        ) : (
          <FileText className={compact ? 'h-6 w-6' : 'h-8 w-8'} />
        )}
      </div>

      <h2 className={cn('font-semibold', compact ? 'text-base' : 'text-lg')}>
        {isDragging ? 'Drop files here' : 'Upload a document to begin'}
      </h2>
      <p className="mt-2 max-w-md text-center text-sm text-muted-foreground">
        Drag & drop PDF or DOCX files, or browse from your computer. Multiple files are merged
        automatically.
      </p>

      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        Browse files
      </button>

      <p className="mt-3 text-xs text-muted-foreground">
        Supported: PDF, DOCX · Legacy .doc is not supported
      </p>
    </motion.div>
  )
}
