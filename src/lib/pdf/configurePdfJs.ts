import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

let configured = false

export async function getPdfJs() {
  const pdfjs = await import('pdfjs-dist')
  if (!configured) {
    pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl
    configured = true
  }
  return pdfjs
}
