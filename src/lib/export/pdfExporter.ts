import type { BookletSettings, PageSlot } from '@/types/imposition'
import { PDFDocument, degrees, type PDFDocument as PDFLibDocument, type PDFEmbeddedPage, type PDFPage } from 'pdf-lib'
import { impose, type ImpositionResult } from '@/lib/imposition/impose'
import {
  getRasterQuality,
  getSlotRenderDpi,
  preferPngRaster,
  shouldUseVectorExport,
} from '@/lib/export/compression'
import { rasterizeSlotToJpeg, rasterizeSlotToPng } from '@/lib/pdf/slotRenderer'
import type { PDFDocumentProxy } from 'pdfjs-dist'

export interface ExportPdfOptions {
  sourcePdfBytes: ArrayBuffer
  settings: BookletSettings
  sourcePageCount: number
  title?: string
  onProgress?: (progress: number) => void
}

export interface ExportPdfResult {
  pdfBytes: Uint8Array
  imposition: ImpositionResult
  pageCount: number
}

function slotToPdfY(slot: PageSlot, pageHeightPt: number): number {
  return pageHeightPt - slot.y - slot.height
}

function drawEmbeddedPage(
  page: PDFPage,
  embedded: PDFEmbeddedPage,
  slot: PageSlot,
  pageHeightPt: number,
): void {
  const rotation = slot.rotation ?? 0

  if (rotation === 0) {
    page.drawPage(embedded, {
      x: slot.x,
      y: slotToPdfY(slot, pageHeightPt),
      width: slot.width,
      height: slot.height,
    })
    return
  }

  if (rotation === 90) {
    const unrotatedWidth = slot.height
    const unrotatedHeight = slot.width
    const centerX = slot.x + slot.width / 2
    const centerY = pageHeightPt - slot.y - slot.height / 2

    page.drawPage(embedded, {
      x: centerX - unrotatedHeight / 2,
      y: centerY - unrotatedWidth / 2,
      width: unrotatedWidth,
      height: unrotatedHeight,
      rotate: degrees(90),
    })
    return
  }

  page.drawPage(embedded, {
    x: slot.x,
    y: slotToPdfY(slot, pageHeightPt),
    width: slot.width,
    height: slot.height,
    rotate: degrees(rotation),
  })
}

async function drawRasterizedPage(
  page: PDFPage,
  imageBytes: Uint8Array,
  slot: PageSlot,
  pageHeightPt: number,
  outputDoc: PDFDocument,
  format: 'png' | 'jpeg',
): Promise<void> {
  const image =
    format === 'png' ? await outputDoc.embedPng(imageBytes) : await outputDoc.embedJpg(imageBytes)

  page.drawImage(image, {
    x: slot.x,
    y: slotToPdfY(slot, pageHeightPt),
    width: slot.width,
    height: slot.height,
  })
}

async function embedSourcePage(
  outputDoc: PDFDocument,
  sourceDoc: PDFLibDocument,
  pageIndex: number,
  cache: Map<number, PDFEmbeddedPage>,
): Promise<PDFEmbeddedPage> {
  const cached = cache.get(pageIndex)
  if (cached) return cached

  const embedded = await outputDoc.embedPage(sourceDoc.getPage(pageIndex))
  cache.set(pageIndex, embedded)
  return embedded
}

async function drawSlot(
  page: PDFPage,
  slot: PageSlot,
  sheetHeightPt: number,
  outputDoc: PDFDocument,
  sourceDoc: PDFLibDocument,
  sourcePdfBytes: ArrayBuffer,
  settings: BookletSettings,
  embeddedCache: Map<number, PDFEmbeddedPage>,
  pdfCache: { bytes: ArrayBuffer | null; doc: PDFDocumentProxy | null },
  pageCanvasCache: Map<number, OffscreenCanvas>,
): Promise<void> {
  const pageIndex = slot.sourcePageIndex
  if (pageIndex === 'blank') return

  const preferVector = shouldUseVectorExport(settings.compression)
  const usePng = preferPngRaster(settings.compression)
  const rasterQuality = getRasterQuality(settings.compression)

  if (preferVector) {
    try {
      const embedded = await embedSourcePage(outputDoc, sourceDoc, pageIndex, embeddedCache)
      drawEmbeddedPage(page, embedded, slot, sheetHeightPt)
      return
    } catch {
      // Fall through to raster if vector embed fails for this page.
    }
  }

  const slotDpi = getSlotRenderDpi(slot.width, settings.printerProfile, settings.compression)
  const imageBytes = usePng
    ? await rasterizeSlotToPng(sourcePdfBytes, slot, slotDpi, pdfCache, pageCanvasCache)
    : await rasterizeSlotToJpeg(
        sourcePdfBytes,
        slot,
        slotDpi,
        rasterQuality,
        pdfCache,
        pageCanvasCache,
      )

  if (imageBytes) {
    await drawRasterizedPage(page, imageBytes, slot, sheetHeightPt, outputDoc, usePng ? 'png' : 'jpeg')
    return
  }

  const embedded = await embedSourcePage(outputDoc, sourceDoc, pageIndex, embeddedCache)
  drawEmbeddedPage(page, embedded, slot, sheetHeightPt)
}

export async function buildExportPdf(options: ExportPdfOptions): Promise<ExportPdfResult> {
  const {
    sourcePdfBytes,
    settings,
    sourcePageCount,
    title = 'Booklet Generator Export',
    onProgress,
  } = options

  const report = (value: number) => onProgress?.(Math.min(99, Math.max(0, Math.round(value))))

  report(2)

  const imposition = impose({ settings, sourcePageCount })
  if (imposition.sheets.length === 0) {
    throw new Error('Nothing to export — no sheets in layout')
  }

  report(8)

  const sourceDoc = await PDFDocument.load(sourcePdfBytes, { ignoreEncryption: true })
  const pdfPageCount = sourceDoc.getPageCount()
  if (pdfPageCount < sourcePageCount) {
    throw new Error(
      `Document has ${pdfPageCount} PDF pages but ${sourcePageCount} were expected — try re-uploading the file`,
    )
  }

  const outputDoc = await PDFDocument.create()
  outputDoc.setTitle(title)
  outputDoc.setProducer('Booklet Generator')
  outputDoc.setCreator('Booklet Generator')
  if (settings.duplex) {
    outputDoc.setKeywords(['duplex', 'booklet'])
  }

  const embeddedCache = new Map<number, PDFEmbeddedPage>()
  const pdfCache: { bytes: ArrayBuffer | null; doc: PDFDocumentProxy | null } = {
    bytes: null,
    doc: null,
  }
  const pageCanvasCache = new Map<number, OffscreenCanvas>()
  const includedSourcePages = new Set<number>()

  let slotsDone = 0
  const totalSlots = imposition.sheets.reduce(
    (count, sheet) => count + sheet.slots.filter((s) => s.sourcePageIndex !== 'blank').length,
    0,
  )

  for (const sheet of imposition.sheets) {
    const page = outputDoc.addPage([sheet.widthPt, sheet.heightPt])

    for (const slot of sheet.slots) {
      if (slot.sourcePageIndex === 'blank') continue

      await drawSlot(
        page,
        slot,
        sheet.heightPt,
        outputDoc,
        sourceDoc,
        sourcePdfBytes,
        settings,
        embeddedCache,
        pdfCache,
        pageCanvasCache,
      )

      includedSourcePages.add(slot.sourcePageIndex)
      slotsDone++
      report(8 + (slotsDone / Math.max(totalSlots, 1)) * 90)
    }
  }

  if (includedSourcePages.size !== sourcePageCount) {
    const missing: number[] = []
    for (let i = 0; i < sourcePageCount; i++) {
      if (!includedSourcePages.has(i)) missing.push(i + 1)
    }
    throw new Error(
      `Export is missing ${missing.length} page(s): ${missing.slice(0, 8).join(', ')}${missing.length > 8 ? '…' : ''}`,
    )
  }

  const pdfBytes = await outputDoc.save()

  return {
    pdfBytes,
    imposition,
    pageCount: imposition.sheets.length,
  }
}
