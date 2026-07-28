import type { Orientation, PagesPerSheet, PrinterProfile } from '@/types/imposition'
import { getPagesPerSheetCount } from '@/lib/utils'
import { mmToPt } from '@/lib/sizes/units'

export interface GridDimensions {
  rows: number
  cols: number
}

export interface CellRect {
  row: number
  col: number
  x: number
  y: number
  width: number
  height: number
}

export interface PrintableArea {
  x: number
  y: number
  width: number
  height: number
  paperWidthPt: number
  paperHeightPt: number
}

const PRINTER_BLEED_MM: Record<PrinterProfile, number> = {
  home: 5,
  office: 3,
  press: 2,
}

export function getPrinterBleedMm(profile: PrinterProfile): number {
  return PRINTER_BLEED_MM[profile]
}

export function getGridDimensions(
  pagesPerSheet: PagesPerSheet,
  orientation: Orientation,
  paperWidthMm: number,
  paperHeightMm: number,
): GridDimensions {
  if (typeof pagesPerSheet === 'object') {
    return { rows: pagesPerSheet.rows, cols: pagesPerSheet.cols }
  }

  const presets: Record<number, GridDimensions[]> = {
    1: [{ rows: 1, cols: 1 }],
    2: [
      { rows: 1, cols: 2 },
      { rows: 2, cols: 1 },
    ],
    4: [{ rows: 2, cols: 2 }],
    6: [
      { rows: 2, cols: 3 },
      { rows: 3, cols: 2 },
    ],
    8: [
      { rows: 2, cols: 4 },
      { rows: 4, cols: 2 },
    ],
    9: [{ rows: 3, cols: 3 }],
    16: [{ rows: 4, cols: 4 }],
  }

  const options = presets[pagesPerSheet] ?? [{ rows: 1, cols: pagesPerSheet }]
  if (options.length === 1) return options[0]

  const useLandscape =
    orientation === 'landscape' ||
    (orientation === 'auto' && paperWidthMm >= paperHeightMm)

  if (pagesPerSheet === 2) {
    return useLandscape ? { rows: 1, cols: 2 } : { rows: 2, cols: 1 }
  }

  if (pagesPerSheet === 6) {
    return useLandscape ? { rows: 2, cols: 3 } : { rows: 3, cols: 2 }
  }

  if (pagesPerSheet === 8) {
    return useLandscape ? { rows: 2, cols: 4 } : { rows: 4, cols: 2 }
  }

  return options[0]
}

export function resolvePaperDimensionsPt(
  paperWidthMm: number,
  paperHeightMm: number,
  orientation: Orientation,
): { widthPt: number; heightPt: number; landscape: boolean } {
  let widthMm = paperWidthMm
  let heightMm = paperHeightMm
  let landscape = false

  if (orientation === 'landscape') {
    landscape = true
    ;[widthMm, heightMm] = [heightMm, widthMm]
  } else if (orientation === 'auto' && paperWidthMm > paperHeightMm) {
    landscape = true
  }

  return {
    widthPt: mmToPt(widthMm),
    heightPt: mmToPt(heightMm),
    landscape,
  }
}

export function computePrintableArea(
  paperWidthPt: number,
  paperHeightPt: number,
  marginMm: number,
  printerProfile: PrinterProfile,
): PrintableArea {
  const totalMarginMm = marginMm + getPrinterBleedMm(printerProfile)
  const marginPt = mmToPt(totalMarginMm)
  const printableWidth = Math.max(0, paperWidthPt - marginPt * 2)
  const printableHeight = Math.max(0, paperHeightPt - marginPt * 2)

  return {
    x: marginPt,
    y: marginPt,
    width: printableWidth,
    height: printableHeight,
    paperWidthPt,
    paperHeightPt,
  }
}

export function computeGridCells(
  printable: PrintableArea,
  rows: number,
  cols: number,
  spacingMm: number,
): CellRect[] {
  const spacingPt = mmToPt(spacingMm)
  const totalHorizontalSpacing = spacingPt * Math.max(0, cols - 1)
  const totalVerticalSpacing = spacingPt * Math.max(0, rows - 1)

  const cellWidth = (printable.width - totalHorizontalSpacing) / cols
  const cellHeight = (printable.height - totalVerticalSpacing) / rows

  const cells: CellRect[] = []

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      cells.push({
        row,
        col,
        x: printable.x + col * (cellWidth + spacingPt),
        y: printable.y + row * (cellHeight + spacingPt),
        width: cellWidth,
        height: cellHeight,
      })
    }
  }

  return cells
}

export function validateGridCapacity(pagesPerSheet: PagesPerSheet, grid: GridDimensions): boolean {
  return getPagesPerSheetCount(pagesPerSheet) === grid.rows * grid.cols
}
