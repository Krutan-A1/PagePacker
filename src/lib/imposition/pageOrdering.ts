import type { BookletMode } from '@/types/imposition'

/** 1-based page numbers in saddle-stitch print order (front/back interleaved per sheet). */
export function buildSaddleStitchStream(paddedPageCount: number): number[] {
  if (paddedPageCount === 0) return []
  if (paddedPageCount % 4 !== 0) {
    throw new Error(`Saddle stitch requires page count divisible by 4, got ${paddedPageCount}`)
  }

  const stream: number[] = []
  const sheetCount = paddedPageCount / 4

  for (let i = 0; i < sheetCount; i++) {
    const frontLeft = paddedPageCount - 2 * i
    const frontRight = 1 + 2 * i
    const backLeft = 2 + 2 * i
    const backRight = paddedPageCount - 1 - 2 * i
    stream.push(frontLeft, frontRight, backLeft, backRight)
  }

  return stream
}

/** Simplified signature stream: sequential within padded blocks (Stage 3 baseline). */
export function buildSignatureStream(paddedPageCount: number): number[] {
  return buildSequentialStream(paddedPageCount)
}

export function buildSequentialStream(paddedPageCount: number): number[] {
  return Array.from({ length: paddedPageCount }, (_, i) => i + 1)
}

export function buildPageStream(
  bookletMode: BookletMode,
  paddedPageCount: number,
  pagesPerSide = 1,
): number[] {
  switch (bookletMode) {
    case 'booklet':
      // Saddle-stitch ordering only for classic 2-up booklet sheets.
      if (pagesPerSide <= 2) {
        return buildSaddleStitchStream(paddedPageCount)
      }
      return buildSequentialStream(paddedPageCount)
    case 'signature':
      return buildSignatureStream(paddedPageCount)
    case 'normal':
    case 'miniBook':
    default:
      return buildSequentialStream(paddedPageCount)
  }
}

export interface BookletSidePair {
  frontLeft: number
  frontRight: number
  backLeft: number
  backRight: number
}

/** Saddle-stitch side pairs for golden tests (1-based page numbers). */
export function getBookletSidePairs(paddedPageCount: number): BookletSidePair[] {
  if (paddedPageCount === 0) return []
  const stream = buildSaddleStitchStream(paddedPageCount)
  const pairs: BookletSidePair[] = []

  for (let i = 0; i < stream.length; i += 4) {
    pairs.push({
      frontLeft: stream[i],
      frontRight: stream[i + 1],
      backLeft: stream[i + 2],
      backRight: stream[i + 3],
    })
  }

  return pairs
}

export function chunkStreamIntoSides(
  stream: number[],
  pagesPerSide: number,
): number[][] {
  if (pagesPerSide <= 0) return []

  const sides: number[][] = []
  for (let i = 0; i < stream.length; i += pagesPerSide) {
    const chunk = stream.slice(i, i + pagesPerSide)
    while (chunk.length < pagesPerSide) {
      chunk.push(-1)
    }
    sides.push(chunk)
  }

  return sides
}

export function sideIndexToSheetSide(sideIndex: number, duplex: boolean): {
  sheetIndex: number
  side: 'front' | 'back'
} {
  if (!duplex) {
    return { sheetIndex: sideIndex, side: 'front' }
  }
  return {
    sheetIndex: Math.floor(sideIndex / 2),
    side: sideIndex % 2 === 0 ? 'front' : 'back',
  }
}
