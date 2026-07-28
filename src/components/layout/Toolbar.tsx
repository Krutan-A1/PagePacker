import { useEffect, useRef } from 'react'
import {
  Upload,
  Printer,
  Moon,
  Sun,
  BookOpen,
  Loader2,
  SlidersHorizontal,
  PanelRightOpen,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { useDocumentPipelineContext } from '@/context/DocumentPipelineContext'
import { useDocumentStore } from '@/store/documentStore'
import { useExportStore } from '@/store/exportStore'
import { useUiStore } from '@/store/uiStore'
import { ExportMenu } from '@/components/export/ExportMenu'
import { useExport } from '@/hooks/useExport'

export function Toolbar() {
  const { theme, setTheme } = useTheme()
  const inputRef = useRef<HTMLInputElement>(null)
  const { addFiles } = useDocumentPipelineContext()
  const isProcessing = useDocumentStore((s) => s.isProcessing)
  const { canExport, downloadPreset, printCurrent } = useExport()
  const isExporting = useExportStore((s) => s.isExporting)
  const exportProgress = useExportStore((s) => s.exportProgress)
  const toggleSettings = useUiStore((s) => s.toggleSettings)
  const toggleInfo = useUiStore((s) => s.toggleInfo)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'p') {
        event.preventDefault()
        if (canExport) void printCurrent()
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
        event.preventDefault()
        if (canExport) void downloadPreset('print-ready')
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [canExport, printCurrent, downloadPreset])

  return (
    <header className="flex shrink-0 flex-col border-b border-border bg-card/80 backdrop-blur-sm">
      <div className="flex h-14 items-center justify-between gap-2 px-3 sm:px-4">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <Button
            variant="outline"
            size="icon"
            className="shrink-0 lg:hidden"
            onClick={toggleSettings}
            aria-label="Open settings"
          >
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <BookOpen className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-sm font-semibold leading-none">Booklet Generator</h1>
            <p className="hidden text-xs text-muted-foreground sm:block">Serverless print imposition</p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            multiple
            className="hidden"
            onChange={(e) => {
              const files = e.target.files
              if (files?.length) addFiles(Array.from(files))
              e.target.value = ''
            }}
          />
          <Button
            variant="outline"
            size="sm"
            disabled={isProcessing}
            onClick={() => inputRef.current?.click()}
          >
            <Upload className="h-4 w-4" />
            <span className="hidden sm:inline">Upload</span>
          </Button>
          <ErrorBoundary title="Export failed">
            <ExportMenu disabled={!canExport} onExport={(preset) => void downloadPreset(preset)} />
          </ErrorBoundary>
          <Button
            variant="default"
            size="sm"
            disabled={!canExport}
            onClick={() => void printCurrent()}
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Printer className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">Print</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="2xl:hidden"
            onClick={toggleInfo}
            aria-label="Open document info"
          >
            <PanelRightOpen className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label="Toggle theme"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
        </div>
      </div>

      {isExporting && (
        <div className="border-t border-border px-4 py-2">
          <div className="flex items-center gap-3">
            <span className="shrink-0 text-xs text-muted-foreground">Exporting… {exportProgress}%</span>
            <Progress value={exportProgress} className="h-1.5" />
          </div>
        </div>
      )}
    </header>
  )
}
