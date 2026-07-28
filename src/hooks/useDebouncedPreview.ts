import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { BookletSettings } from '@/types/imposition'
import type { ImpositionResult } from '@/lib/imposition/impose'
import { useDocumentStore } from '@/store/documentStore'
import { useBookletSettings, getBookletSettings } from '@/store/settingsStore'
import { getImpositionWorkerClient } from '@/lib/workers/workerClients'

const DEBOUNCE_MS = 150

function settingsFingerprint(settings: BookletSettings): string {
  return JSON.stringify({
    bookSize: settings.bookSize,
    paperSize: settings.paperSize,
    pagesPerSheet: settings.pagesPerSheet,
    bookletMode: settings.bookletMode,
    marginMm: settings.marginMm,
    spacingMm: settings.spacingMm,
    scaling: settings.scaling,
    customScalePct: settings.customScalePct,
    orientation: settings.orientation,
    duplex: settings.duplex,
    printerProfile: settings.printerProfile,
  })
}

export function useDebouncedPreview() {
  const totalPages = useDocumentStore((s) => s.totalPages)
  const normalizedPdfBytes = useDocumentStore((s) => s.normalizedPdfBytes)
  const isDocumentProcessing = useDocumentStore((s) => s.isProcessing)

  const settings = useBookletSettings()
  const settingsKey = useMemo(() => settingsFingerprint(settings), [settings])

  const [imposition, setImposition] = useState<ImpositionResult | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [previewError, setPreviewError] = useState<string | null>(null)
  const [activeSideIndex, setActiveSideIndex] = useState(0)

  const abortRef = useRef<AbortController | null>(null)
  const requestIdRef = useRef(0)

  const isReady = totalPages > 0 && normalizedPdfBytes !== null && !isDocumentProcessing

  const recompute = useCallback(async () => {
    if (!isReady || totalPages === 0) {
      setImposition(null)
      setPreviewLoading(false)
      setPreviewError(null)
      return
    }

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    const requestId = ++requestIdRef.current
    setPreviewLoading(true)
    setPreviewError(null)

    try {
      const { api } = getImpositionWorkerClient()
      const result = await api.computeImposition(getBookletSettings(), totalPages)

      if (controller.signal.aborted || requestId !== requestIdRef.current) return

      setImposition(result)
      setActiveSideIndex((prev) => {
        if (result.sheets.length === 0) return 0
        return Math.min(prev, result.sheets.length - 1)
      })
    } catch (err) {
      if (controller.signal.aborted || requestId !== requestIdRef.current) return
      setPreviewError(err instanceof Error ? err.message : 'Preview update failed')
    } finally {
      if (requestId === requestIdRef.current) {
        setPreviewLoading(false)
      }
    }
  }, [isReady, totalPages])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void recompute()
    }, DEBOUNCE_MS)

    return () => {
      window.clearTimeout(timer)
      abortRef.current?.abort()
    }
  }, [settingsKey, totalPages, isReady, recompute])

  const sheets = imposition?.sheets ?? []
  const currentSheet = sheets[activeSideIndex] ?? null
  const physicalSheetCount = sheets.length
    ? Math.max(...sheets.map((s) => s.sheetIndex)) + 1
    : 0

  const currentPhysicalIndex = currentSheet?.sheetIndex ?? 0
  const currentSide = currentSheet?.side ?? 'front'

  const goToPhysicalSheet = useCallback(
    (sheetIndex: number, side: 'front' | 'back' = 'front') => {
      const target = sheets.findIndex((s) => s.sheetIndex === sheetIndex && s.side === side)
      if (target >= 0) setActiveSideIndex(target)
    },
    [sheets],
  )

  const goToPrev = useCallback(() => {
    setActiveSideIndex((prev) => Math.max(0, prev - 1))
  }, [])

  const goToNext = useCallback(() => {
    setActiveSideIndex((prev) => Math.min(sheets.length - 1, prev + 1))
  }, [sheets.length])

  const switchSide = useCallback(
    (side: 'front' | 'back') => {
      if (!currentSheet) return
      const target = sheets.findIndex(
        (s) => s.sheetIndex === currentSheet.sheetIndex && s.side === side,
      )
      if (target >= 0) setActiveSideIndex(target)
    },
    [currentSheet, sheets],
  )

  return {
    imposition,
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
    goToPhysicalSheet,
    goToPrev,
    goToNext,
    switchSide,
    refreshPreview: recompute,
  }
}
