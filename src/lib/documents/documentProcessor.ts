import type { BookletSettings } from '@/types/imposition'
import type { DocumentSourceType } from '@/types/imposition'
import { getPaperSizeMm } from '@/lib/sizes/units'
import { getPdfPageCount, readFileAsArrayBuffer } from '@/lib/documents/pdfLoader'
import { mergePdfBuffers } from '@/lib/documents/pdfMerger'
import { convertDocxToPdf } from '@/lib/documents/docxConverter'
import { computeLayoutStats } from '@/lib/documents/documentStats'

export interface SourceFileInput {
  id: string
  name: string
  type: DocumentSourceType
  file: File
}

export interface ProcessedDocument {
  normalizedPdfBytes: ArrayBuffer
  files: Array<{
    id: string
    name: string
    type: DocumentSourceType
    sizeBytes: number
    pageCount: number
    isApproximatePageCount?: boolean
  }>
  totalPages: number
  paddedPages: number
  sheetCount: number
  blankPagesAdded: number
  hasApproximatePageCount: boolean
}

export interface ProcessDocumentsOptions {
  files: SourceFileInput[]
  settings: BookletSettings
  onProgress?: (progress: number) => void
  signal?: AbortSignal
}

function throwIfAborted(signal?: AbortSignal) {
  if (signal?.aborted) {
    throw new DOMException('Processing aborted', 'AbortError')
  }
}

export async function processDocuments(options: ProcessDocumentsOptions): Promise<ProcessedDocument> {
  const { files, settings, onProgress, signal } = options
  const report = (value: number) => onProgress?.(Math.min(100, Math.max(0, Math.round(value))))

  if (files.length === 0) {
    throw new Error('No files to process')
  }

  const pdfBuffers: ArrayBuffer[] = []
  const fileMeta: ProcessedDocument['files'] = []
  let hasApproximatePageCount = false

  for (let i = 0; i < files.length; i++) {
    throwIfAborted(signal)
    const entry = files[i]
    const fileProgressStart = (i / files.length) * 90
    const fileProgressEnd = ((i + 1) / files.length) * 90

    if (entry.type === 'pdf') {
      report(fileProgressStart + 5)
      const buffer = await readFileAsArrayBuffer(entry.file)
      throwIfAborted(signal)
      const pageCount = await getPdfPageCount(buffer)
      pdfBuffers.push(buffer)
      fileMeta.push({
        id: entry.id,
        name: entry.name,
        type: 'pdf',
        sizeBytes: entry.file.size,
        pageCount,
      })
      report(fileProgressEnd)
    } else {
      const { widthMm, heightMm } = getPaperSizeMm(settings.paperSize)
      const result = await convertDocxToPdf(await readFileAsArrayBuffer(entry.file), {
        pageWidthMm: widthMm,
        pageHeightMm: heightMm,
        onProgress: (inner) => {
          const scaled = fileProgressStart + (inner / 100) * (fileProgressEnd - fileProgressStart)
          report(scaled)
        },
      })
      throwIfAborted(signal)
      hasApproximatePageCount = true
      pdfBuffers.push(result.pdfBytes.buffer.slice(0) as ArrayBuffer)
      fileMeta.push({
        id: entry.id,
        name: entry.name,
        type: 'docx',
        sizeBytes: entry.file.size,
        pageCount: result.pageCount,
        isApproximatePageCount: true,
      })
      report(fileProgressEnd)
    }
  }

  throwIfAborted(signal)
  report(92)

  const mergedBytes = await mergePdfBuffers(pdfBuffers)
  throwIfAborted(signal)

  const mergedPageCount = await getPdfPageCount(mergedBytes.buffer.slice(0) as ArrayBuffer)
  const metaPageCount = fileMeta.reduce((sum, f) => sum + f.pageCount, 0)
  const totalPages = mergedPageCount > 0 ? mergedPageCount : metaPageCount
  if (mergedPageCount > 0 && mergedPageCount !== metaPageCount) {
    console.warn(
      `Merged PDF has ${mergedPageCount} pages but file metadata counted ${metaPageCount}`,
    )
  }
  const { paddedPages, blankPagesAdded, sheetCount } = computeLayoutStats(totalPages, settings)

  report(100)

  return {
    normalizedPdfBytes: mergedBytes.buffer.slice(0) as ArrayBuffer,
    files: fileMeta,
    totalPages,
    paddedPages,
    sheetCount,
    blankPagesAdded,
    hasApproximatePageCount,
  }
}
