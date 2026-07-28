import { PDFDocument } from 'pdf-lib'
import { mmToPt, mmToPx } from '@/lib/sizes/units'

export interface DocxConvertOptions {
  pageWidthMm: number
  pageHeightMm: number
  onProgress?: (progress: number) => void
}

export interface DocxConvertResult {
  pdfBytes: Uint8Array
  pageCount: number
  isApproximatePageCount: true
}

const DOCX_STYLES = `
  .docx-render-root {
    font-family: Georgia, "Times New Roman", serif;
    font-size: 12pt;
    line-height: 1.5;
    color: #111;
    word-wrap: break-word;
  }
  .docx-render-root p { margin: 0 0 0.75em; }
  .docx-render-root h1, .docx-render-root h2, .docx-render-root h3 {
    margin: 1em 0 0.5em;
    line-height: 1.25;
  }
  .docx-render-root img { max-width: 100%; height: auto; }
  .docx-render-root table { border-collapse: collapse; width: 100%; margin: 0.5em 0; }
  .docx-render-root td, .docx-render-root th { border: 1px solid #ccc; padding: 4px 8px; }
  .docx-render-root ul, .docx-render-root ol { margin: 0 0 0.75em 1.25em; }
`

export async function convertDocxToPdf(
  arrayBuffer: ArrayBuffer,
  options: DocxConvertOptions,
): Promise<DocxConvertResult> {
  const { pageWidthMm, pageHeightMm, onProgress } = options
  const report = (value: number) => onProgress?.(Math.min(100, Math.max(0, Math.round(value))))

  report(5)

  const mammoth = await import('mammoth')
  const html2canvas = (await import('html2canvas')).default

  const { value: html } = await mammoth.convertToHtml({ arrayBuffer })
  report(15)

  const pageWidthPx = Math.round(mmToPx(pageWidthMm))
  const pageHeightPx = Math.round(mmToPx(pageHeightMm))
  const pageWidthPt = mmToPt(pageWidthMm)
  const pageHeightPt = mmToPt(pageHeightMm)

  const container = document.createElement('div')
  container.style.position = 'fixed'
  container.style.left = '-10000px'
  container.style.top = '0'
  container.style.width = `${pageWidthPx}px`
  container.style.background = '#fff'
  container.style.padding = '24px'
  container.style.boxSizing = 'border-box'
  container.className = 'docx-render-root'

  const styleEl = document.createElement('style')
  styleEl.textContent = DOCX_STYLES
  container.appendChild(styleEl)

  const content = document.createElement('div')
  content.innerHTML = html
  container.appendChild(content)
  document.body.appendChild(container)

  try {
    const totalHeight = content.scrollHeight
    const pageCount = Math.max(1, Math.ceil(totalHeight / pageHeightPx))
    const pdfDoc = await PDFDocument.create()

    for (let pageIndex = 0; pageIndex < pageCount; pageIndex++) {
      const yOffset = pageIndex * pageHeightPx
      const sliceHeight = Math.min(pageHeightPx, totalHeight - yOffset)

      const canvas = await html2canvas(content, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        logging: false,
        width: pageWidthPx,
        height: sliceHeight,
        y: yOffset,
        windowWidth: pageWidthPx,
        windowHeight: sliceHeight,
      })

      const pngDataUrl = canvas.toDataURL('image/png')
      const pngBytes = dataUrlToUint8Array(pngDataUrl)
      const pngImage = await pdfDoc.embedPng(pngBytes)
      const page = pdfDoc.addPage([pageWidthPt, pageHeightPt])

      const scale = Math.min(pageWidthPt / pngImage.width, pageHeightPt / pngImage.height)
      const drawWidth = pngImage.width * scale
      const drawHeight = pngImage.height * scale

      page.drawImage(pngImage, {
        x: 0,
        y: pageHeightPt - drawHeight,
        width: drawWidth,
        height: drawHeight,
      })

      report(15 + ((pageIndex + 1) / pageCount) * 80)
    }

    const pdfBytes = await pdfDoc.save()
    report(100)

    return {
      pdfBytes,
      pageCount,
      isApproximatePageCount: true,
    }
  } finally {
    document.body.removeChild(container)
  }
}

function dataUrlToUint8Array(dataUrl: string): Uint8Array {
  const base64 = dataUrl.split(',')[1]
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}
