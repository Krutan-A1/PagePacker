import type { PageSlot } from '@/types/imposition'
import type { CellRect } from '@/lib/imposition/gridCalculator'
import type { PageTransform } from '@/lib/imposition/scalingEngine'

export function mirrorColumn(col: number, cols: number): number {
  return cols - 1 - col
}

export function mapCellIndexForDuplexBack(flatIndex: number, cols: number): number {
  const row = Math.floor(flatIndex / cols)
  const col = flatIndex % cols
  const mirroredCol = mirrorColumn(col, cols)
  return row * cols + mirroredCol
}

export function assignPagesToGridMirrored(
  pageNumbers: number[],
  cells: CellRect[],
  _sourcePageCount: number,
  toSourceIndex: (pageNumber: number) => number | 'blank',
  buildSlot: (sourceIndex: number | 'blank', cell: CellRect) => PageSlot,
  cols: number,
): PageSlot[] {
  const slots: PageSlot[] = []

  for (let i = 0; i < cells.length; i++) {
    const mirroredIndex = mapCellIndexForDuplexBack(i, cols)
    const pageNumber = pageNumbers[mirroredIndex] ?? -1
    const sourceIndex = pageNumber === -1 ? 'blank' : toSourceIndex(pageNumber)
    slots.push(buildSlot(sourceIndex, cells[i]))
  }

  return slots
}

export function assignPagesToGrid(
  pageNumbers: number[],
  cells: CellRect[],
  toSourceIndex: (pageNumber: number) => number | 'blank',
  buildSlot: (sourceIndex: number | 'blank', cell: CellRect) => PageSlot,
): PageSlot[] {
  return cells.map((cell, index) => {
    const pageNumber = pageNumbers[index] ?? -1
    const sourceIndex = pageNumber === -1 ? 'blank' : toSourceIndex(pageNumber)
    return buildSlot(sourceIndex, cell)
  })
}

export function transformToPageSlot(transform: PageTransform): PageSlot {
  return {
    sourcePageIndex: transform.sourcePageIndex,
    x: transform.x,
    y: transform.y,
    width: transform.width,
    height: transform.height,
    rotation: transform.rotation,
  }
}
