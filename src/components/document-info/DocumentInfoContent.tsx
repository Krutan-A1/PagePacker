import type { ComponentType } from 'react'
import { useDocumentStore } from '@/store/documentStore'
import { useSettingsStore } from '@/store/settingsStore'
import { formatBytes, getPagesPerSheetCount } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { FoldDiagram } from '@/components/document-info/FoldDiagram'
import { useExportStore } from '@/store/exportStore'
import { FileText, Layers, Printer, Info, AlertCircle } from 'lucide-react'

export function DocumentInfoContent() {
  const files = useDocumentStore((s) => s.files)
  const totalPages = useDocumentStore((s) => s.totalPages)
  const paddedPages = useDocumentStore((s) => s.paddedPages)
  const sheetCount = useDocumentStore((s) => s.sheetCount)
  const blankPagesAdded = useDocumentStore((s) => s.blankPagesAdded)
  const isProcessing = useDocumentStore((s) => s.isProcessing)
  const processingProgress = useDocumentStore((s) => s.processingProgress)
  const processingError = useDocumentStore((s) => s.processingError)
  const hasApproximatePageCount = useDocumentStore((s) => s.hasApproximatePageCount)
  const normalizedPdfBytes = useDocumentStore((s) => s.normalizedPdfBytes)

  const bookletMode = useSettingsStore((s) => s.bookletMode)
  const pagesPerSheet = useSettingsStore((s) => s.pagesPerSheet)
  const duplex = useSettingsStore((s) => s.duplex)

  const isExporting = useExportStore((s) => s.isExporting)
  const exportProgress = useExportStore((s) => s.exportProgress)
  const exportError = useExportStore((s) => s.exportError)

  const hasDocument = files.length > 0
  const isReady = hasDocument && normalizedPdfBytes !== null && !isProcessing && !processingError

  return (
    <div className="space-y-3 p-3 sm:space-y-4 sm:p-4">
      {!hasDocument ? (
        <Card>
          <CardContent className="flex flex-col items-center py-8 text-center">
            <Info className="mb-3 h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No document loaded yet</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {isProcessing && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Processing</CardTitle>
              </CardHeader>
              <CardContent>
                <Progress value={processingProgress} className="mb-2" />
                <p className="text-xs text-muted-foreground">{processingProgress}% complete</p>
              </CardContent>
            </Card>
          )}

          {processingError && (
            <Card className="border-destructive/50">
              <CardContent className="flex items-start gap-2 py-4 text-sm text-destructive">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <p>{processingError}</p>
              </CardContent>
            </Card>
          )}

          {isExporting && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Exporting PDF</CardTitle>
              </CardHeader>
              <CardContent>
                <Progress value={exportProgress} className="mb-2" />
                <p className="text-xs text-muted-foreground">{exportProgress}% complete</p>
              </CardContent>
            </Card>
          )}

          {exportError && (
            <Card className="border-destructive/50">
              <CardContent className="flex items-start gap-2 py-4 text-sm text-destructive">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <p>{exportError}</p>
              </CardContent>
            </Card>
          )}

          {hasApproximatePageCount && isReady && (
            <Card className="border-amber-500/40 bg-amber-500/5">
              <CardContent className="flex items-start gap-2 py-4 text-sm">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                <p className="text-muted-foreground">
                  DOCX page count is approximate — pagination is based on rendered layout.
                </p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Files</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {files.map((file) => (
                <div key={file.id} className="flex items-start gap-2 text-sm">
                  <FileText className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <div className="min-w-0">
                    <p className="truncate font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {file.type.toUpperCase()} · {formatBytes(file.sizeBytes)}
                      {file.pageCount !== undefined && (
                        <>
                          {' '}
                          · {file.pageCount} page{file.pageCount !== 1 ? 's' : ''}
                          {file.isApproximatePageCount ? ' (approx.)' : ''}
                        </>
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </>
      )}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Layout Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <StatRow icon={FileText} label="Source pages" value={isReady ? String(totalPages) : hasDocument ? '…' : '—'} />
          <StatRow icon={Layers} label="Padded pages" value={isReady ? String(paddedPages) : hasDocument ? '…' : '—'} />
          <StatRow icon={Printer} label="Print sheets" value={isReady ? String(sheetCount) : hasDocument ? '…' : '—'} />
          <StatRow
            icon={Info}
            label="Blank pages added"
            value={isReady ? String(blankPagesAdded) : hasDocument ? '…' : '—'}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Current Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Mode</span>
            <span className="font-medium capitalize">{bookletMode.replace(/([A-Z])/g, ' $1')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Pages / sheet</span>
            <span className="font-medium">{getPagesPerSheetCount(pagesPerSheet)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Duplex</span>
            <span className="font-medium">{duplex ? 'On' : 'Off'}</span>
          </div>
        </CardContent>
      </Card>

      {bookletMode === 'booklet' && isReady && paddedPages > 0 && (
        <FoldDiagram paddedPages={paddedPages} sourcePageCount={totalPages} />
      )}
    </div>
  )
}

function StatRow({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>
  label: string
  value: string
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-4 w-4" />
        <span>{label}</span>
      </div>
      <span className="font-medium">{value}</span>
    </div>
  )
}
