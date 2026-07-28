import { PDFDocument } from 'pdf-lib'

export async function loadPdfDocument(bytes: ArrayBuffer): Promise<PDFDocument> {
  return PDFDocument.load(bytes, { ignoreEncryption: true })
}

export async function getPdfPageCount(bytes: ArrayBuffer): Promise<number> {
  const pdf = await loadPdfDocument(bytes)
  return pdf.getPageCount()
}

export async function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return file.arrayBuffer()
}
