import { describe, expect, it } from 'vitest'
import {
  computePageTransform,
  isTransformWithinCell,
  mapCellIndexForDuplexBack,
  mirrorColumn,
} from '@/lib/imposition'

describe('scalingEngine', () => {
  const cell = { x: 0, y: 0, width: 100, height: 50 }

  it('fits wide source inside cell without clipping', () => {
    const transform = computePageTransform(
      0,
      { widthPt: 200, heightPt: 100 },
      cell,
      { scaling: 'fit', customScalePct: 100, orientation: 'portrait' },
    )

    expect(transform.width).toBeLessThanOrEqual(cell.width + 0.01)
    expect(transform.height).toBeLessThanOrEqual(cell.height + 0.01)
    expect(isTransformWithinCell(transform)).toBe(true)
  })

  it('centers fitted page in cell', () => {
    const transform = computePageTransform(
      0,
      { widthPt: 200, heightPt: 200 },
      cell,
      { scaling: 'fit', customScalePct: 100, orientation: 'portrait' },
    )

    expect(transform.x).toBeCloseTo(25, 1)
    expect(transform.y).toBeCloseTo(0, 1)
    expect(transform.width).toBeCloseTo(50, 1)
    expect(transform.height).toBeCloseTo(50, 1)
  })

  it('auto rotation improves fit for landscape source', () => {
    const transform = computePageTransform(
      0,
      { widthPt: 200, heightPt: 100 },
      { x: 0, y: 0, width: 100, height: 200 },
      { scaling: 'fit', customScalePct: 100, orientation: 'auto' },
    )

    expect(transform.rotation).toBe(90)
    expect(isTransformWithinCell(transform)).toBe(true)
  })

  it('fill mode may clip', () => {
    const transform = computePageTransform(
      0,
      { widthPt: 200, heightPt: 100 },
      cell,
      { scaling: 'fill', customScalePct: 100, orientation: 'portrait' },
    )

    expect(transform.clipped).toBe(true)
  })

  it('blank pages produce blank slots', () => {
    const transform = computePageTransform(
      'blank',
      { widthPt: 200, heightPt: 100 },
      cell,
      { scaling: 'fit', customScalePct: 100, orientation: 'portrait' },
    )

    expect(transform.sourcePageIndex).toBe('blank')
    expect(isTransformWithinCell(transform)).toBe(true)
  })
})

describe('duplexLayout', () => {
  it('mirrors columns for back side mapping', () => {
    expect(mirrorColumn(0, 4)).toBe(3)
    expect(mirrorColumn(3, 4)).toBe(0)
    expect(mapCellIndexForDuplexBack(0, 4)).toBe(3)
    expect(mapCellIndexForDuplexBack(3, 4)).toBe(0)
  })
})
