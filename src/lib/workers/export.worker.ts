import { expose } from 'comlink'
import type { BookletSettings } from '@/types/imposition'
import { buildExportPdf } from '@/lib/export/pdfExporter'

export interface ExportWorkerRequest {
  sourcePdfBytes: ArrayBuffer
  settings: BookletSettings
  sourcePageCount: number
  title?: string
}

export interface ExportWorkerApi {
  exportPdf(
    request: ExportWorkerRequest,
    onProgress?: (progress: number) => void,
  ): Promise<ArrayBuffer>
}

const api: ExportWorkerApi = {
  async exportPdf(request, onProgress) {
    const result = await buildExportPdf({
      ...request,
      onProgress,
    })
    return result.pdfBytes.buffer.slice(0) as ArrayBuffer
  },
}

expose(api)
