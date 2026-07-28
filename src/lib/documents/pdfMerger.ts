import { PDFDocument } from 'pdf-lib'

export async function mergePdfBuffers(buffers: ArrayBuffer[]): Promise<Uint8Array> {
  const merged = await PDFDocument.create()

  for (const buffer of buffers) {
    const source = await PDFDocument.load(buffer, { ignoreEncryption: true })
    const copiedPages = await merged.copyPages(source, source.getPageIndices())
    copiedPages.forEach((page) => merged.addPage(page))
  }

  return merged.save()
}

export async function mergePdfDocuments(documents: PDFDocument[]): Promise<Uint8Array> {
  const merged = await PDFDocument.create()

  for (const source of documents) {
    const copiedPages = await merged.copyPages(source, source.getPageIndices())
    copiedPages.forEach((page) => merged.addPage(page))
  }

  return merged.save()
}
