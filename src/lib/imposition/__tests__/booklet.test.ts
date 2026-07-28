import { describe, expect, it } from 'vitest'
import { DEFAULT_SETTINGS, type BookletSettings } from '@/types/imposition'
import {
  buildSaddleStitchStream,
  getBookletSidePairs,
  padPageCount,
  pageNumberToSourceIndex,
} from '@/lib/imposition'
import { impose } from '@/lib/imposition/impose'

describe('padPageCount', () => {
  it('pads 10 pages to 12 for classic 2-up booklet mode', () => {
    const result = padPageCount(10, 'booklet', 2, true)
    expect(result.paddedPages).toBe(12)
    expect(result.blankPagesAdded).toBe(2)
  })

  it('pads 4 pages to 4 for classic 2-up booklet mode', () => {
    const result = padPageCount(4, 'booklet', 2, true)
    expect(result.paddedPages).toBe(4)
    expect(result.blankPagesAdded).toBe(0)
  })

  it('pads n-up booklet to full print sides', () => {
    const result = padPageCount(10, 'booklet', 8, true)
    expect(result.paddedPages).toBe(16)
    expect(result.blankPagesAdded).toBe(6)
  })
})

describe('saddle stitch ordering', () => {
  it('orders 12 pages correctly', () => {
    expect(buildSaddleStitchStream(12)).toEqual([12, 1, 2, 11, 10, 3, 4, 9, 8, 5, 6, 7])
  })

  it('returns side pairs matching spec for 10 source pages padded to 12', () => {
    const pairs = getBookletSidePairs(12)
    expect(pairs).toHaveLength(3)
    expect(pairs[0]).toEqual({ frontLeft: 12, frontRight: 1, backLeft: 2, backRight: 11 })
    expect(pairs[1]).toEqual({ frontLeft: 10, frontRight: 3, backLeft: 4, backRight: 9 })
    expect(pairs[2]).toEqual({ frontLeft: 8, frontRight: 5, backLeft: 6, backRight: 7 })
  })

  it('orders 4 pages', () => {
    expect(buildSaddleStitchStream(4)).toEqual([4, 1, 2, 3])
  })

  it('orders 8 pages', () => {
    expect(buildSaddleStitchStream(8)).toEqual([8, 1, 2, 7, 6, 3, 4, 5])
  })

  it('orders 16 pages', () => {
    const stream = buildSaddleStitchStream(16)
    expect(stream).toHaveLength(16)
    expect(stream[0]).toBe(16)
    expect(stream[1]).toBe(1)
  })
})

describe('impose booklet layout', () => {
  const bookletSettings: BookletSettings = {
    ...DEFAULT_SETTINGS,
    bookletMode: 'booklet',
    pagesPerSheet: 2,
    duplex: true,
  }

  it('maps 10 pages to saddle stitch slots with blanks', () => {
    const result = impose({ settings: bookletSettings, sourcePageCount: 10 })
    expect(result.paddedPageCount).toBe(12)
    expect(result.blankPagesAdded).toBe(2)

    const sheet0Front = result.sheets.find((s) => s.sheetIndex === 0 && s.side === 'front')
    const sheet0Back = result.sheets.find((s) => s.sheetIndex === 0 && s.side === 'back')

    expect(sheet0Front?.slots).toHaveLength(2)
    expect(sheet0Front?.slots[0].sourcePageIndex).toBe('blank')
    expect(sheet0Front?.slots[1].sourcePageIndex).toBe(0)

    expect(sheet0Back?.slots[0].sourcePageIndex).toBe(1)
    expect(sheet0Back?.slots[1].sourcePageIndex).toBe('blank')
  })

  it('converts page numbers to source indices', () => {
    expect(pageNumberToSourceIndex(1, 10)).toBe(0)
    expect(pageNumberToSourceIndex(10, 10)).toBe(9)
    expect(pageNumberToSourceIndex(11, 10)).toBe('blank')
    expect(pageNumberToSourceIndex(12, 10)).toBe('blank')
  })

  it('adds a blank back side when duplex leaves an odd side count', () => {
    const settings: BookletSettings = {
      ...DEFAULT_SETTINGS,
      bookletMode: 'booklet',
      pagesPerSheet: 16,
      duplex: true,
    }
    const result = impose({ settings, sourcePageCount: 105 })
    expect(result.paddedPageCount).toBe(128)
    expect(result.blankPagesAdded).toBe(23)
    expect(result.sheets.length % 2).toBe(0)

    const seen = new Set<number>()
    for (const sheet of result.sheets) {
      for (const slot of sheet.slots) {
        if (slot.sourcePageIndex !== 'blank') seen.add(slot.sourcePageIndex)
      }
    }
    expect(seen.size).toBe(105)
  })
})
