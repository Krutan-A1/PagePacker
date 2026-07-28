import * as pdfjsLib from 'pdfjs-dist'
import type { PDFDocumentProxy } from 'pdfjs-dist'
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

const PREVIEW_DPI = 72
const PDF_POINTS_PER_INCH = 72

let workerConfigured = false

function ensurePdfWorker() {
  if (workerConfigured) return
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl
  workerConfigured = true
}

export class PageRenderCache {
  private cache = new Map<number, ImageBitmap>()
  private accessOrder: number[] = []
  private loading = new Map<number, Promise<ImageBitmap | null>>()

  constructor(private maxSize = 20) {}

  clear() {
    for (const bitmap of this.cache.values()) {
      bitmap.close()
    }
    this.cache.clear()
    this.accessOrder = []
    this.loading.clear()
  }

  private touch(pageIndex: number) {
    this.accessOrder = this.accessOrder.filter((i) => i !== pageIndex)
    this.accessOrder.push(pageIndex)
  }

  private evictIfNeeded() {
    while (this.cache.size > this.maxSize && this.accessOrder.length > 0) {
      const oldest = this.accessOrder.shift()
      if (oldest === undefined) break
      const bitmap = this.cache.get(oldest)
      bitmap?.close()
      this.cache.delete(oldest)
    }
  }

  get(pageIndex: number): ImageBitmap | undefined {
    const bitmap = this.cache.get(pageIndex)
    if (bitmap) this.touch(pageIndex)
    return bitmap
  }

  async loadPage(
    pdf: PDFDocumentProxy,
    pageIndex: number,
    scale?: number,
  ): Promise<ImageBitmap | null> {
    const cached = this.get(pageIndex)
    if (cached) return cached

    const pending = this.loading.get(pageIndex)
    if (pending) return pending

    const promise = this.renderPage(pdf, pageIndex, scale)
    this.loading.set(pageIndex, promise)

    try {
      const bitmap = await promise
      if (bitmap) {
        this.cache.set(pageIndex, bitmap)
        this.touch(pageIndex)
        this.evictIfNeeded()
      }
      return bitmap
    } finally {
      this.loading.delete(pageIndex)
    }
  }

  private async renderPage(
    pdf: PDFDocumentProxy,
    pageIndex: number,
    scale?: number,
  ): Promise<ImageBitmap | null> {
    if (pageIndex < 0 || pageIndex >= pdf.numPages) return null

    const page = await pdf.getPage(pageIndex + 1)
    const viewport = page.getViewport({ scale: scale ?? PREVIEW_DPI / PDF_POINTS_PER_INCH })

    const canvas = document.createElement('canvas')
    canvas.width = Math.floor(viewport.width)
    canvas.height = Math.floor(viewport.height)

    const context = canvas.getContext('2d')
    if (!context) return null

    await page.render({ canvasContext: context, viewport, canvas }).promise

    return createImageBitmap(canvas)
  }
}

let pdfDocumentPromise: Promise<PDFDocumentProxy> | null = null
let pdfDocumentBytes: ArrayBuffer | null = null

export async function loadPdfDocument(bytes: ArrayBuffer): Promise<PDFDocumentProxy> {
  ensurePdfWorker()

  if (pdfDocumentBytes === bytes && pdfDocumentPromise) {
    return pdfDocumentPromise
  }

  pdfDocumentBytes = bytes
  pdfDocumentPromise = pdfjsLib.getDocument({ data: bytes.slice(0) }).promise
  return pdfDocumentPromise
}

export function resetPdfDocument() {
  pdfDocumentPromise = null
  pdfDocumentBytes = null
}

export async function preloadPagesAround(
  pdf: PDFDocumentProxy,
  cache: PageRenderCache,
  centerIndex: number,
  radius = 2,
) {
  const indices = []
  for (let i = centerIndex - radius; i <= centerIndex + radius; i++) {
    if (i >= 0 && i < pdf.numPages) indices.push(i)
  }
  await Promise.all(indices.map((index) => cache.loadPage(pdf, index)))
}
