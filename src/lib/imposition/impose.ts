import type { BookletSettings, SheetLayout } from '@/types/imposition'
import { getPagesPerSheetCount } from '@/lib/utils'
import { getSizeMm, mmToPt } from '@/lib/sizes/units'
import {
  padPageCount,
  pageNumberToSourceIndex,
} from '@/lib/imposition/blankPagePadding'
import {
  buildPageStream,
  chunkStreamIntoSides,
  sideIndexToSheetSide,
} from '@/lib/imposition/pageOrdering'
import {
  computeGridCells,
  computePrintableArea,
  getGridDimensions,
  resolvePaperDimensionsPt,
} from '@/lib/imposition/gridCalculator'
import { computePageTransform } from '@/lib/imposition/scalingEngine'
import { assignPagesToGrid, assignPagesToGridMirrored, transformToPageSlot } from '@/lib/imposition/duplexLayout'

export interface SourcePageDimensions {
  widthPt: number
  heightPt: number
}

export interface ImposeOptions {
  settings: BookletSettings
  sourcePageCount: number
  sourcePageDimensions?: SourcePageDimensions
}

export interface ImpositionResult {
  sourcePageCount: number
  paddedPageCount: number
  blankPagesAdded: number
  sheets: SheetLayout[]
}

function defaultSourceDimensions(settings: BookletSettings): SourcePageDimensions {
  const { widthMm, heightMm } = getSizeMm(settings.bookSize)
  return {
    widthPt: mmToPt(widthMm),
    heightPt: mmToPt(heightMm),
  }
}

export function impose(options: ImposeOptions): ImpositionResult {
  const { settings, sourcePageCount } = options
  const sourceDimensions = options.sourcePageDimensions ?? defaultSourceDimensions(settings)

  if (sourcePageCount === 0) {
    return {
      sourcePageCount: 0,
      paddedPageCount: 0,
      blankPagesAdded: 0,
      sheets: [],
    }
  }

  const { paddedPages, blankPagesAdded } = padPageCount(
    sourcePageCount,
    settings.bookletMode,
    settings.pagesPerSheet,
    settings.duplex,
  )

  const pagesPerSide = getPagesPerSheetCount(settings.pagesPerSheet)
  const pageStream = buildPageStream(settings.bookletMode, paddedPages, pagesPerSide)
  const sideChunks = chunkStreamIntoSides(pageStream, pagesPerSide)

  if (settings.duplex && sideChunks.length % 2 === 1) {
    sideChunks.push(Array.from({ length: pagesPerSide }, () => -1))
  }

  const paperMm = getSizeMm(settings.paperSize)
  const paperDimensions = resolvePaperDimensionsPt(
    paperMm.widthMm,
    paperMm.heightMm,
    settings.orientation,
  )

  const grid = getGridDimensions(
    settings.pagesPerSheet,
    settings.orientation,
    paperMm.widthMm,
    paperMm.heightMm,
  )

  const printable = computePrintableArea(
    paperDimensions.widthPt,
    paperDimensions.heightPt,
    settings.marginMm,
    settings.printerProfile,
  )

  const cells = computeGridCells(printable, grid.rows, grid.cols, settings.spacingMm)
  const toSourceIndex = (pageNumber: number) => pageNumberToSourceIndex(pageNumber, sourcePageCount)

  const buildSlot = (sourceIndex: number | 'blank', cell: (typeof cells)[number]) => {
    const transform = computePageTransform(sourceIndex, sourceDimensions, cell, {
      scaling: settings.scaling,
      customScalePct: settings.customScalePct,
      orientation: settings.orientation,
    })
    return transformToPageSlot(transform)
  }

  const sheets: SheetLayout[] = sideChunks.map((chunk, sideIndex) => {
    const { sheetIndex, side } = sideIndexToSheetSide(sideIndex, settings.duplex)
    const pageNumbers = chunk.map((n) => (n === -1 ? -1 : n))

    const slots =
      side === 'back' && settings.duplex
        ? assignPagesToGridMirrored(pageNumbers, cells, sourcePageCount, toSourceIndex, buildSlot, grid.cols)
        : assignPagesToGrid(pageNumbers, cells, toSourceIndex, buildSlot)

    return {
      sheetIndex,
      side,
      widthPt: paperDimensions.widthPt,
      heightPt: paperDimensions.heightPt,
      slots,
    }
  })

  return {
    sourcePageCount,
    paddedPageCount: paddedPages,
    blankPagesAdded,
    sheets,
  }
}

export function countPhysicalSheets(sheets: SheetLayout[]): number {
  if (sheets.length === 0) return 0
  return Math.max(...sheets.map((s) => s.sheetIndex)) + 1
}
