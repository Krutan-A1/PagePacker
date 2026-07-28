import { useEffect, useState } from 'react'
import { ChevronDown, Loader2, Upload } from 'lucide-react'
import { useDocumentStore } from '@/store/documentStore'
import { useSettingsStore } from '@/store/settingsStore'
import { useDocumentPipelineContext } from '@/context/DocumentPipelineContext'
import { useDebouncedPreview } from '@/hooks/useDebouncedPreview'
import { DropZone } from '@/components/upload/DropZone'
import { FileList } from '@/components/upload/FileList'
import { PipelineStrip } from '@/components/preview/PipelineStrip'
import { SheetPreviewCanvas } from '@/components/preview/SheetPreviewCanvas'
import { SheetNavigator } from '@/components/preview/SheetNavigator'
import { EmptyState } from '@/components/ui/empty-state'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function PreviewPanel() {
  const { sourceFiles, addFiles, removeFile, reorderFiles, retryProcessing } =
    useDocumentPipelineContext()

  const isProcessing = useDocumentStore((s) => s.isProcessing)
  const processingProgress = useDocumentStore((s) => s.processingProgress)
  const processingError = useDocumentStore((s) => s.processingError)
  const normalizedPdfBytes = useDocumentStore((s) => s.normalizedPdfBytes)
  const totalPages = useDocumentStore((s) => s.totalPages)
  const duplex = useSettingsStore((s) => s.duplex)

  const [filesExpanded, setFilesExpanded] = useState(false)

  const {
    previewLoading,
    previewError,
    isReady,
    sheets,
    activeSideIndex,
    setActiveSideIndex,
    currentSheet,
    currentPhysicalIndex,
    currentSide,
    physicalSheetCount,
    goToPrev,
    goToNext,
    switchSide,
    refreshPreview,
  } = useDebouncedPreview()

  const hasDocument = sourceFiles.length > 0
  const hasPreview = isReady && sheets.length > 0 && !previewLoading

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!hasPreview) return
      if (event.key === 'ArrowLeft') goToPrev()
      if (event.key === 'ArrowRight') goToNext()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [goToPrev, goToNext, hasPreview])

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden p-3 sm:p-4 lg:p-5">
      {hasDocument && !hasPreview && (
        <div className="mb-3 shrink-0">
          <PipelineStrip
            hasDocument={hasDocument}
            isConverted={isReady}
            hasPreview={hasPreview}
            compact
            className="md:hidden"
          />
          <PipelineStrip
            hasDocument={hasDocument}
            isConverted={isReady}
            hasPreview={hasPreview}
            className="hidden md:flex"
          />
        </div>
      )}

      {hasDocument && (
        <div className="mb-2 shrink-0">
          {hasPreview ? (
            <>
              <button
                type="button"
                className="flex w-full items-center justify-between rounded-lg border border-border bg-card/80 px-3 py-1.5 text-left"
                onClick={() => setFilesExpanded((open) => !open)}
                aria-expanded={filesExpanded}
              >
                <span className="truncate text-sm">
                  <span className="font-medium">{sourceFiles[0]?.name}</span>
                  {sourceFiles.length > 1 && (
                    <span className="text-muted-foreground"> · +{sourceFiles.length - 1} more</span>
                  )}
                  {totalPages > 0 && (
                    <span className="text-muted-foreground"> · {totalPages} pages</span>
                  )}
                </span>
                <ChevronDown
                  className={cn(
                    'ml-2 h-4 w-4 shrink-0 text-muted-foreground transition-transform',
                    filesExpanded && 'rotate-180',
                  )}
                />
              </button>
              {filesExpanded && (
                <div className="mt-2 max-h-36 overflow-y-auto">
                  <FileList
                    files={sourceFiles}
                    onRemove={removeFile}
                    onReorder={reorderFiles}
                    disabled={isProcessing}
                    compact
                  />
                  <div className="mt-2">
                    <DropZone
                      onFilesSelected={addFiles}
                      disabled={isProcessing}
                      inline
                    />
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <button
                type="button"
                className="flex w-full items-center justify-between rounded-lg border border-border bg-card/80 px-3 py-2 text-left md:hidden"
                onClick={() => setFilesExpanded((open) => !open)}
                aria-expanded={filesExpanded}
              >
                <span className="truncate text-sm font-medium">
                  {sourceFiles.length} file{sourceFiles.length !== 1 ? 's' : ''}
                  {totalPages > 0 ? ` · ${totalPages} pages` : ''}
                </span>
                <ChevronDown
                  className={cn(
                    'h-4 w-4 shrink-0 text-muted-foreground transition-transform',
                    filesExpanded && 'rotate-180',
                  )}
                />
              </button>

              {filesExpanded && (
                <div className="mt-2 max-h-40 overflow-y-auto md:hidden">
                  <FileList
                    files={sourceFiles}
                    onRemove={removeFile}
                    onReorder={reorderFiles}
                    disabled={isProcessing}
                    compact
                  />
                </div>
              )}

              <div className="hidden md:block">
                <FileList
                  files={sourceFiles}
                  onRemove={removeFile}
                  onReorder={reorderFiles}
                  disabled={isProcessing}
                />
              </div>
            </>
          )}
        </div>
      )}

      {isProcessing && (
        <Card className="mb-2 shrink-0">
          <CardContent className="space-y-2 py-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              Processing document…
            </div>
            <Progress value={processingProgress} />
            <p className="text-xs text-muted-foreground">{processingProgress}% complete</p>
          </CardContent>
        </Card>
      )}

      {processingError && (
        <Card className="mb-2 shrink-0 border-destructive/50">
          <CardContent className="flex items-center justify-between gap-4 py-3">
            <p className="text-sm text-destructive">{processingError}</p>
            <Button size="sm" variant="outline" onClick={() => void retryProcessing()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {!hasDocument ? (
        <Card className="flex min-h-0 flex-1 border-dashed bg-muted/10">
          <CardContent className="flex flex-1 flex-col">
            <EmptyState
              icon={Upload}
              title="Upload a document to begin"
              description="Drop a PDF or DOCX file to preview how your pages will be arranged on printable sheets. All processing happens locally in your browser."
              hint="Supported formats: PDF, DOCX"
              action={<DropZone onFilesSelected={addFiles} disabled={isProcessing} compact />}
            />
          </CardContent>
        </Card>
      ) : isReady ? (
        <div className="flex min-h-0 flex-1 flex-col gap-2">
          {(previewLoading || previewError) && (
            <Card className="shrink-0">
              <CardContent className="py-2">
                {previewLoading && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    Updating preview…
                  </div>
                )}
                {previewError && (
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm text-destructive">{previewError}</p>
                    <Button size="sm" variant="outline" onClick={() => void refreshPreview()}>
                      Retry
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <SheetNavigator
            activeSideIndex={activeSideIndex}
            totalSides={sheets.length}
            physicalSheetIndex={currentPhysicalIndex}
            physicalSheetCount={physicalSheetCount}
            side={currentSide}
            duplex={duplex}
            onPrev={goToPrev}
            onNext={goToNext}
            onSideChange={switchSide}
            onSliderChange={setActiveSideIndex}
          />

          <Card className="flex min-h-0 flex-1 flex-col overflow-hidden border-dashed bg-muted/10">
            <CardContent className="flex min-h-0 flex-1 p-2 sm:p-3">
              <SheetPreviewCanvas sheet={currentSheet} pdfBytes={normalizedPdfBytes} />
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="flex min-h-0 flex-1 items-center justify-center border-dashed bg-muted/10">
          <CardContent className="py-8 text-center text-sm text-muted-foreground sm:py-12">
            {isProcessing ? 'Converting and merging your files…' : 'Waiting to process…'}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
