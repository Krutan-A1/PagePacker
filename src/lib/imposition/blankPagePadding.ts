import type { BookletMode, PagesPerSheet } from '@/types/imposition'
import { getPagesPerSheetCount } from '@/lib/utils'

export function padPageCount(
  totalPages: number,
  bookletMode: BookletMode,
  pagesPerSheet: PagesPerSheet,
  duplex: boolean,
): { paddedPages: number; blankPagesAdded: number } {
  if (totalPages === 0) {
    return { paddedPages: 0, blankPagesAdded: 0 }
  }

  let padTo = 1

  if (bookletMode === 'booklet') {
    const perSide = getPagesPerSheetCount(pagesPerSheet)
    // Classic saddle-stitch (2-up): pad to multiple of 4.
    // N-up booklet (4+ per side): sequential cut-and-stack — pad to full print sides.
    if (perSide > 2) {
      const sides = Math.ceil(totalPages / perSide)
      const totalSides = duplex ? Math.ceil(sides / 2) * 2 : sides
      const paddedPages = totalSides * perSide
      return {
        paddedPages,
        blankPagesAdded: paddedPages - totalPages,
      }
    }
    padTo = 4
  } else if (bookletMode === 'signature') {
    padTo = 16
  } else {
    const perSide = getPagesPerSheetCount(pagesPerSheet)
    padTo = perSide * (duplex ? 2 : 1)
  }

  const paddedPages =
    totalPages % padTo === 0 ? totalPages : totalPages + (padTo - (totalPages % padTo))

  return {
    paddedPages,
    blankPagesAdded: paddedPages - totalPages,
  }
}

export function isBlankPageNumber(pageNumber: number, sourcePageCount: number): boolean {
  return pageNumber < 1 || pageNumber > sourcePageCount
}

export function pageNumberToSourceIndex(
  pageNumber: number,
  sourcePageCount: number,
): number | 'blank' {
  if (isBlankPageNumber(pageNumber, sourcePageCount)) return 'blank'
  return pageNumber - 1
}
