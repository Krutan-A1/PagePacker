import { useEffect, useRef, useState } from 'react'

import type { SheetLayout } from '@/types/imposition'

import { Loader2 } from 'lucide-react'

import {

  loadPdfDocument,

  PageRenderCache,

  preloadPagesAround,

  resetPdfDocument,

} from '@/lib/pdf/pdfRenderer'



interface SheetPreviewCanvasProps {

  sheet: SheetLayout | null

  pdfBytes: ArrayBuffer | null

}



const pageCache = new PageRenderCache(20)



export function SheetPreviewCanvas({ sheet, pdfBytes }: SheetPreviewCanvasProps) {

  const canvasRef = useRef<HTMLCanvasElement>(null)

  const containerRef = useRef<HTMLDivElement>(null)

  const [rendering, setRendering] = useState(false)

  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })



  useEffect(() => {

    if (!pdfBytes) {

      pageCache.clear()

      resetPdfDocument()

    }

  }, [pdfBytes])



  useEffect(() => {

    const container = containerRef.current

    if (!container) return



    const updateSize = () => {

      setContainerSize({

        width: container.clientWidth,

        height: container.clientHeight,

      })

    }



    updateSize()

    const observer = new ResizeObserver(updateSize)

    observer.observe(container)

    return () => observer.disconnect()

  }, [sheet])



  useEffect(() => {

    const canvas = canvasRef.current

    if (!canvas || !sheet || !pdfBytes) return

    if (containerSize.width <= 0 || containerSize.height <= 0) return



    let cancelled = false

    const ctx = canvas.getContext('2d')

    if (!ctx) return



    const render = async () => {

      setRendering(true)

      try {

        const pdf = await loadPdfDocument(pdfBytes)

        if (cancelled) return



        const pageIndices = sheet.slots

          .map((slot) => slot.sourcePageIndex)

          .filter((index): index is number => index !== 'blank')



        if (pageIndices.length > 0) {

          await preloadPagesAround(pdf, pageCache, pageIndices[0], 3)

        }



        const padding = 8

        const availableWidth = Math.max(containerSize.width - padding * 2, 1)

        const availableHeight = Math.max(containerSize.height - padding * 2, 1)

        const scale = Math.min(

          availableWidth / sheet.widthPt,

          availableHeight / sheet.heightPt,

        )



        const displayWidth = sheet.widthPt * scale

        const displayHeight = sheet.heightPt * scale



        canvas.width = Math.floor(displayWidth * devicePixelRatio)

        canvas.height = Math.floor(displayHeight * devicePixelRatio)

        canvas.style.width = `${displayWidth}px`

        canvas.style.height = `${displayHeight}px`



        ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0)

        ctx.clearRect(0, 0, displayWidth, displayHeight)



        ctx.fillStyle = '#ffffff'

        ctx.fillRect(0, 0, displayWidth, displayHeight)



        ctx.strokeStyle = '#d1d5db'

        ctx.lineWidth = 1

        ctx.strokeRect(0.5, 0.5, displayWidth - 1, displayHeight - 1)



        for (const slot of sheet.slots) {

          const x = slot.x * scale

          const y = slot.y * scale

          const w = slot.width * scale

          const h = slot.height * scale



          ctx.strokeStyle = '#e5e7eb'

          ctx.setLineDash([4, 4])

          ctx.strokeRect(x, y, w, h)

          ctx.setLineDash([])



          if (slot.sourcePageIndex === 'blank') {

            ctx.fillStyle = '#f9fafb'

            ctx.fillRect(x, y, w, h)

            ctx.fillStyle = '#9ca3af'

            ctx.font = '12px system-ui, sans-serif'

            ctx.textAlign = 'center'

            ctx.textBaseline = 'middle'

            ctx.fillText('Blank', x + w / 2, y + h / 2)

            continue

          }



          const bitmap = await pageCache.loadPage(pdf, slot.sourcePageIndex)

          if (cancelled || !bitmap) continue



          ctx.save()

          if (slot.rotation !== 0) {

            ctx.translate(x + w / 2, y + h / 2)

            ctx.rotate((slot.rotation * Math.PI) / 180)

            ctx.drawImage(bitmap, -w / 2, -h / 2, w, h)

          } else {

            ctx.drawImage(bitmap, x, y, w, h)

          }

          ctx.restore()



          ctx.strokeStyle = '#6366f1'

          ctx.lineWidth = 1

          ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1)



          ctx.fillStyle = '#6366f1'

          ctx.font = 'bold 10px system-ui, sans-serif'

          ctx.textAlign = 'left'

          ctx.textBaseline = 'top'

          ctx.fillText(String(slot.sourcePageIndex + 1), x + 4, y + 4)

        }

      } finally {

        if (!cancelled) setRendering(false)

      }

    }



    void render()



    return () => {

      cancelled = true

    }

  }, [sheet, pdfBytes, containerSize])



  if (!sheet) {

    return (

      <div className="flex h-full min-h-[160px] items-center justify-center rounded-lg border border-dashed border-border bg-muted/20 text-sm text-muted-foreground">

        No sheet to preview

      </div>

    )

  }



  return (

    <div

      ref={containerRef}

      className="relative flex h-full min-h-[160px] w-full items-center justify-center"

    >

      {rendering && (

        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-background/60">

          <Loader2 className="h-6 w-6 animate-spin text-primary" />

        </div>

      )}

      <canvas ref={canvasRef} className="block max-h-full max-w-full rounded-lg shadow-md" />

    </div>

  )

}

