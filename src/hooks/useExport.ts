import { useCallback, useRef } from 'react'
import { useDocumentStore } from '@/store/documentStore'
import { getBookletSettings } from '@/store/settingsStore'
import { useExportStore } from '@/store/exportStore'
import { useToast } from '@/hooks/useToast'
import {
  applyExportPreset,
  getPresetFilename,
  isSourceOnlyExport,
  type ExportPreset,
} from '@/lib/export/exportPresets'
import { buildExportPdf } from '@/lib/export/pdfExporter'
import { downloadBlob, printPdfBlob } from '@/lib/export/printHelper'

export function useExport() {
  const normalizedPdfBytes = useDocumentStore((s) => s.normalizedPdfBytes)
  const totalPages = useDocumentStore((s) => s.totalPages)
  const isDocumentProcessing = useDocumentStore((s) => s.isProcessing)

  const setExporting = useExportStore((s) => s.setExporting)
  const resetExport = useExportStore((s) => s.resetExport)
  const setExportError = useExportStore((s) => s.setExportError)
  const isExporting = useExportStore((s) => s.isExporting)

  const { success: toastSuccess, error: toastError } = useToast()
  const exportGenerationRef = useRef(0)

  const canExport =
    normalizedPdfBytes !== null && totalPages > 0 && !isDocumentProcessing && !isExporting

  const runExport = useCallback(
    async (preset: ExportPreset, mode: 'download' | 'print') => {
      if (!normalizedPdfBytes || totalPages === 0) {
        toastError('No document loaded to export')
        return
      }

      const exportId = ++exportGenerationRef.current
      setExportError(null)
      setExporting(true, 0)

      try {
        if (isSourceOnlyExport(preset)) {
          const filename = getPresetFilename(preset)
          downloadBlob(new Blob([normalizedPdfBytes], { type: 'application/pdf' }), filename)
          toastSuccess(`Downloaded ${filename} (${totalPages} pages)`)
          return
        }

        const exportSettings = applyExportPreset(preset, getBookletSettings())

        const result = await buildExportPdf({
          sourcePdfBytes: normalizedPdfBytes,
          settings: exportSettings,
          sourcePageCount: totalPages,
          title: `Booklet Generator — ${preset}`,
          onProgress: (progress) => {
            if (exportGenerationRef.current === exportId) {
              setExporting(true, progress)
            }
          },
        })

        if (exportGenerationRef.current !== exportId) return

        const blob = new Blob([result.pdfBytes], { type: 'application/pdf' })
        const filename = getPresetFilename(preset)

        if (mode === 'print') {
          printPdfBlob(blob)
          toastSuccess('Opening print dialog…')
        } else {
          downloadBlob(blob, filename)
          toastSuccess(`Downloaded ${filename}`)
        }
      } catch (err) {
        if (exportGenerationRef.current !== exportId) return
        const message = err instanceof Error ? err.message : 'Export failed'
        setExportError(message)
        toastError(message)
      } finally {
        if (exportGenerationRef.current === exportId) {
          exportGenerationRef.current++
          resetExport()
        }
      }
    },
    [
      normalizedPdfBytes,
      totalPages,
      setExporting,
      resetExport,
      setExportError,
      toastError,
      toastSuccess,
    ],
  )

  const downloadPreset = useCallback(
    (preset: ExportPreset) => runExport(preset, 'download'),
    [runExport],
  )

  const printCurrent = useCallback(() => runExport('print-ready', 'print'), [runExport])

  return {
    canExport,
    downloadPreset,
    printCurrent,
  }
}
