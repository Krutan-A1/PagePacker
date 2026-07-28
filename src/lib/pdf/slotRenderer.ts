import type { PageSlot } from '@/types/imposition'
import type { PDFDocumentProxy } from 'pdfjs-dist'
import { getPdfJs } from '@/lib/pdf/configurePdfJs'

/** Draw page content into a slot-sized canvas (origin 0,0 — used for PDF export tiles). */
export function drawPageIntoSlotLocal(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  pageCanvas: CanvasImageSource,
  slot: PageSlot,
  scale: number,
): void {
  const w = slot.width * scale
  const h = slot.height * scale

  if (slot.rotation !== 0) {
    ctx.save()
    ctx.translate(w / 2, h / 2)
    ctx.rotate((slot.rotation * Math.PI) / 180)
    ctx.drawImage(pageCanvas, -w / 2, -h / 2, w, h)
    ctx.restore()
    return
  }

  ctx.drawImage(pageCanvas, 0, 0, w, h)
}

export async function loadPdfDocumentCached(
  pdfBytes: ArrayBuffer,
  cache: { bytes: ArrayBuffer | null; doc: PDFDocumentProxy | null },
): Promise<PDFDocumentProxy> {
  if (cache.bytes === pdfBytes && cache.doc) {
    return cache.doc
  }
  const pdfjs = await getPdfJs()
  cache.bytes = pdfBytes
  cache.doc = await pdfjs.getDocument({ data: pdfBytes.slice(0) }).promise
  return cache.doc
}

export async function renderSourcePageCanvas(
  pdf: PDFDocumentProxy,
  pageIndex: number,
  dpi: number,
): Promise<OffscreenCanvas | null> {
  if (pageIndex < 0 || pageIndex >= pdf.numPages) return null

  const page = await pdf.getPage(pageIndex + 1)
  const pageScale = dpi / 72
  const viewport = page.getViewport({ scale: pageScale })

  const canvas = new OffscreenCanvas(Math.floor(viewport.width), Math.floor(viewport.height))
  const context = canvas.getContext('2d')
  if (!context) return null

  await page.render({
    canvasContext: context as unknown as CanvasRenderingContext2D,
    viewport,
  }).promise

  return canvas
}

export async function rasterizeSlotToJpeg(
  pdfBytes: ArrayBuffer,
  slot: PageSlot,
  dpi: number,
  quality: number,
  cache: { bytes: ArrayBuffer | null; doc: PDFDocumentProxy | null },
  pageCanvasCache: Map<number, OffscreenCanvas>,
): Promise<Uint8Array | null> {
  return rasterizeSlot(pdfBytes, slot, dpi, quality, 'image/jpeg', cache, pageCanvasCache)
}

export async function rasterizeSlotToPng(
  pdfBytes: ArrayBuffer,
  slot: PageSlot,
  dpi: number,
  cache: { bytes: ArrayBuffer | null; doc: PDFDocumentProxy | null },
  pageCanvasCache: Map<number, OffscreenCanvas>,
): Promise<Uint8Array | null> {
  return rasterizeSlot(pdfBytes, slot, dpi, 1, 'image/png', cache, pageCanvasCache)
}

async function rasterizeSlot(
  pdfBytes: ArrayBuffer,
  slot: PageSlot,
  dpi: number,
  quality: number,
  mimeType: 'image/jpeg' | 'image/png',
  cache: { bytes: ArrayBuffer | null; doc: PDFDocumentProxy | null },
  pageCanvasCache: Map<number, OffscreenCanvas>,
): Promise<Uint8Array | null> {
  if (slot.sourcePageIndex === 'blank') return null

  try {
    const pdf = await loadPdfDocumentCached(pdfBytes, cache)
    const pageIndex = slot.sourcePageIndex
    const cacheKey = pageIndex * 10000 + dpi
    let pageCanvas = pageCanvasCache.get(cacheKey)

    if (!pageCanvas) {
      pageCanvas = (await renderSourcePageCanvas(pdf, pageIndex, dpi)) ?? undefined
      if (pageCanvas) pageCanvasCache.set(cacheKey, pageCanvas)
    }
    if (!pageCanvas) return null

    const pageScale = dpi / 72
    const boxWidthPx = Math.max(1, Math.floor(slot.width * pageScale))
    const boxHeightPx = Math.max(1, Math.floor(slot.height * pageScale))

    const slotCanvas = new OffscreenCanvas(boxWidthPx, boxHeightPx)
    const slotContext = slotCanvas.getContext('2d')
    if (!slotContext) return null

    slotContext.fillStyle = '#ffffff'
    slotContext.fillRect(0, 0, boxWidthPx, boxHeightPx)
    slotContext.imageSmoothingEnabled = true
    slotContext.imageSmoothingQuality = 'high'

    drawPageIntoSlotLocal(slotContext, pageCanvas, slot, pageScale)

    const blob = await slotCanvas.convertToBlob({ type: mimeType, quality })
    return new Uint8Array(await blob.arrayBuffer())
  } catch {
    return null
  }
}
