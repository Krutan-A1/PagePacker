import { describe, expect, it } from 'vitest'
import { DEFAULT_SETTINGS } from '@/types/imposition'
import {
  computeGridCells,
  computePrintableArea,
  getGridDimensions,
  impose,
  resolvePaperDimensionsPt,
} from '@/lib/imposition'
import { mmToPt } from '@/lib/sizes/units'

describe('gridCalculator', () => {
  it('uses 2x4 grid for 8 pages per sheet in portrait', () => {
    const grid = getGridDimensions(8, 'portrait', 210, 297)
    expect(grid).toEqual({ rows: 4, cols: 2 })
  })

  it('uses 2x4 grid for 8 pages in landscape orientation', () => {
    const grid = getGridDimensions(8, 'landscape', 210, 297)
    expect(grid).toEqual({ rows: 2, cols: 4 })
  })

  it('creates non-overlapping cells for 8-up on A4', () => {
    const paper = resolvePaperDimensionsPt(210, 297, 'portrait')
    const printable = computePrintableArea(paper.widthPt, paper.heightPt, 5, 'home')
    const grid = getGridDimensions(8, 'portrait', 210, 297)
    const cells = computeGridCells(printable, grid.rows, grid.cols, 2)

    expect(cells).toHaveLength(8)

    for (let i = 0; i < cells.length; i++) {
      for (let j = i + 1; j < cells.length; j++) {
        const a = cells[i]
        const b = cells[j]
        const overlapX = a.x < b.x + b.width && a.x + a.width > b.x
        const overlapY = a.y < b.y + b.height && a.y + a.height > b.y
        expect(overlapX && overlapY).toBe(false)
      }
    }
  })

  it('reduces cell size when margin increases', () => {
    const paper = resolvePaperDimensionsPt(210, 297, 'portrait')
    const smallMargin = computePrintableArea(paper.widthPt, paper.heightPt, 2, 'press')
    const largeMargin = computePrintableArea(paper.widthPt, paper.heightPt, 10, 'press')

    const smallCells = computeGridCells(smallMargin, 2, 4, 2)
    const largeCells = computeGridCells(largeMargin, 2, 4, 2)

    expect(smallCells[0].width).toBeGreaterThan(largeCells[0].width)
    expect(smallCells[0].height).toBeGreaterThan(largeCells[0].height)
  })
})

describe('impose grid integration', () => {
  it('produces 8 slots for 8 pages per sheet', () => {
    const settings = {
      ...DEFAULT_SETTINGS,
      bookletMode: 'normal' as const,
      pagesPerSheet: 8 as const,
      duplex: false,
    }

    const result = impose({ settings, sourcePageCount: 8 })
    expect(result.sheets[0].slots).toHaveLength(8)
  })

  it('uses custom grid dimensions', () => {
    const settings = {
      ...DEFAULT_SETTINGS,
      bookletMode: 'normal' as const,
      pagesPerSheet: { kind: 'custom' as const, rows: 2, cols: 3 },
      duplex: false,
    }

    const result = impose({ settings, sourcePageCount: 6 })
    expect(result.sheets[0].slots).toHaveLength(6)
  })
})

describe('printable area', () => {
  it('converts mm margins to pt', () => {
    const paperW = mmToPt(210)
    const paperH = mmToPt(297)
    const printable = computePrintableArea(paperW, paperH, 0, 'press')
    const marginPt = mmToPt(2)
    expect(printable.width).toBeCloseTo(paperW - marginPt * 2, 1)
  })
})
