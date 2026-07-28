import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useDocumentStore } from '@/store/documentStore'
import { useBookletSettings, getBookletSettings } from '@/store/settingsStore'
import { useToast } from '@/hooks/useToast'
import { validateFile, VALIDATION_MESSAGES } from '@/lib/documents/fileValidator'
import { processDocuments, type SourceFileInput } from '@/lib/documents/documentProcessor'
import { computeLayoutStats } from '@/lib/documents/documentStats'
import { createDocumentId } from '@/lib/sizes/units'

function filesFingerprint(files: SourceFileInput[]): string {
  return files.map((f) => `${f.id}:${f.name}:${f.file.size}:${f.file.lastModified}`).join('|')
}

export function useDocumentPipeline() {
  const [sourceFiles, setSourceFiles] = useState<SourceFileInput[]>([])
  const sourceFilesRef = useRef<SourceFileInput[]>([])
  const abortRef = useRef<AbortController | null>(null)
  const lastProcessedFingerprint = useRef<string>('')

  const settings = useBookletSettings()
  const settingsKey = useMemo(() => JSON.stringify(settings), [settings])
  const { error: toastError, success: toastSuccess } = useToast()

  const setProcessing = useDocumentStore((s) => s.setProcessing)
  const setProcessingError = useDocumentStore((s) => s.setProcessingError)
  const setFiles = useDocumentStore((s) => s.setFiles)
  const setDocumentStats = useDocumentStore((s) => s.setDocumentStats)
  const clearDocument = useDocumentStore((s) => s.clearDocument)
  const totalPages = useDocumentStore((s) => s.totalPages)

  sourceFilesRef.current = sourceFiles
  const fingerprint = useMemo(() => filesFingerprint(sourceFiles), [sourceFiles])

  const addFiles = useCallback(
    (incoming: File[]) => {
      const accepted: SourceFileInput[] = []

      for (const file of incoming) {
        const result = validateFile(file)
        if (result === 'doc' || result === 'unsupported' || result === 'empty') {
          toastError(VALIDATION_MESSAGES[result])
          continue
        }

        accepted.push({
          id: createDocumentId(),
          name: file.name,
          type: result.type,
          file,
        })
      }

      if (accepted.length === 0) return

      setSourceFiles((prev) => [...prev, ...accepted])
      toastSuccess(
        accepted.length === 1 ? `Added ${accepted[0].name}` : `Added ${accepted.length} files`,
      )
    },
    [toastError, toastSuccess],
  )

  const removeFile = useCallback((id: string) => {
    setSourceFiles((prev) => prev.filter((f) => f.id !== id))
  }, [])

  const reorderFiles = useCallback((fromIndex: number, toIndex: number) => {
    setSourceFiles((prev) => {
      if (
        fromIndex === toIndex ||
        fromIndex < 0 ||
        toIndex < 0 ||
        fromIndex >= prev.length ||
        toIndex >= prev.length
      ) {
        return prev
      }
      const next = [...prev]
      const [moved] = next.splice(fromIndex, 1)
      next.splice(toIndex, 0, moved)
      return next
    })
  }, [])

  const clearAll = useCallback(() => {
    abortRef.current?.abort()
    lastProcessedFingerprint.current = ''
    setSourceFiles([])
    clearDocument()
  }, [clearDocument])

  const runPipeline = useCallback(async () => {
    const files = sourceFilesRef.current
    if (files.length === 0) {
      lastProcessedFingerprint.current = ''
      clearDocument()
      return
    }

    const currentFingerprint = filesFingerprint(files)
    if (currentFingerprint === lastProcessedFingerprint.current) return

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setProcessing(true, 0)
    setProcessingError(null)

    try {
      const result = await processDocuments({
        files,
        settings: getBookletSettings(),
        signal: controller.signal,
        onProgress: (progress) => setProcessing(true, progress),
      })

      if (controller.signal.aborted) return

      lastProcessedFingerprint.current = currentFingerprint
      setFiles(result.files)
      setDocumentStats({
        totalPages: result.totalPages,
        paddedPages: result.paddedPages,
        sheetCount: result.sheetCount,
        blankPagesAdded: result.blankPagesAdded,
        hasApproximatePageCount: result.hasApproximatePageCount,
        normalizedPdfBytes: result.normalizedPdfBytes,
      })
      setProcessing(false, 100)
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return
      const message = err instanceof Error ? err.message : 'Failed to process documents'
      setProcessingError(message)
      toastError(message)
    }
  }, [setProcessing, setProcessingError, setFiles, setDocumentStats, clearDocument, toastError])

  const retryProcessing = useCallback(() => {
    lastProcessedFingerprint.current = ''
    void runPipeline()
  }, [runPipeline])

  useEffect(() => {
    void runPipeline()
  }, [fingerprint, runPipeline])

  useEffect(() => {
    if (totalPages === 0) return
    setDocumentStats(computeLayoutStats(totalPages, getBookletSettings()))
  }, [settingsKey, totalPages, setDocumentStats])

  return {
    sourceFiles,
    addFiles,
    removeFile,
    reorderFiles,
    clearAll,
    retryProcessing,
  }
}
