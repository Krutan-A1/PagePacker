import type { BookletSettings } from '@/types/imposition'
import { impose, countPhysicalSheets } from '@/lib/imposition/impose'

export function computeLayoutStats(totalPages: number, settings: BookletSettings) {
  const result = impose({ settings, sourcePageCount: totalPages })

  return {
    paddedPages: result.paddedPageCount,
    blankPagesAdded: result.blankPagesAdded,
    sheetCount: countPhysicalSheets(result.sheets),
  }
}

export { padPageCount } from '@/lib/imposition/blankPagePadding'
