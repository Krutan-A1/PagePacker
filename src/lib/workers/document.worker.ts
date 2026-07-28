import { expose } from 'comlink'
import { getPdfPageCount } from '@/lib/documents/pdfLoader'
import { mergePdfBuffers } from '@/lib/documents/pdfMerger'

export interface DocumentWorkerApi {
  getPageCount(pdfBytes: ArrayBuffer): Promise<number>
  mergePdfs(buffers: ArrayBuffer[]): Promise<ArrayBuffer>
}

const api: DocumentWorkerApi = {
  async getPageCount(pdfBytes) {
    return getPdfPageCount(pdfBytes)
  },
  async mergePdfs(buffers) {
    const merged = await mergePdfBuffers(buffers)
    return merged.buffer.slice(0) as ArrayBuffer
  },
}

expose(api)
