import type { Orientation, ScalingMode } from '@/types/imposition'

export interface SourceDimensions {
  widthPt: number
  heightPt: number
}

export interface PageTransform {
  sourcePageIndex: number | 'blank'
  x: number
  y: number
  width: number
  height: number
  rotation: 0 | 90 | 180 | 270
  scale: number
  clipped: boolean
}

export interface TransformOptions {
  scaling: ScalingMode
  customScalePct: number
  orientation: Orientation
}

function scoreFit(scale: number, clipped: boolean): number {
  if (clipped) return scale * 0.5
  return scale
}

function computeScaleForMode(
  sourceWidth: number,
  sourceHeight: number,
  cellWidth: number,
  cellHeight: number,
  scaling: ScalingMode,
  customScalePct: number,
): { scale: number; clipped: boolean } {
  if (sourceWidth <= 0 || sourceHeight <= 0) {
    return { scale: 1, clipped: false }
  }

  const fitScale = Math.min(cellWidth / sourceWidth, cellHeight / sourceHeight)
  const fillScale = Math.max(cellWidth / sourceWidth, cellHeight / sourceHeight)

  switch (scaling) {
    case 'fill': {
      return { scale: fillScale, clipped: true }
    }
    case 'actual': {
      const scale = 1
      const clipped = sourceWidth > cellWidth || sourceHeight > cellHeight
      return { scale, clipped }
    }
    case 'custom': {
      const scale = (customScalePct / 100) * fitScale
      const drawW = sourceWidth * scale
      const drawH = sourceHeight * scale
      return { scale, clipped: drawW > cellWidth + 0.01 || drawH > cellHeight + 0.01 }
    }
    case 'fit':
    default: {
      return { scale: fitScale, clipped: false }
    }
  }
}

function buildTransform(
  sourceWidth: number,
  sourceHeight: number,
  cell: { x: number; y: number; width: number; height: number },
  rotation: 0 | 90,
  scaling: ScalingMode,
  customScalePct: number,
  sourcePageIndex: number | 'blank',
): PageTransform {
  if (sourcePageIndex === 'blank') {
    return {
      sourcePageIndex: 'blank',
      x: cell.x,
      y: cell.y,
      width: cell.width,
      height: cell.height,
      rotation: 0,
      scale: 1,
      clipped: false,
    }
  }

  const effectiveWidth = rotation === 90 ? sourceHeight : sourceWidth
  const effectiveHeight = rotation === 90 ? sourceWidth : sourceHeight

  const { scale, clipped } = computeScaleForMode(
    effectiveWidth,
    effectiveHeight,
    cell.width,
    cell.height,
    scaling,
    customScalePct,
  )

  const drawWidth = effectiveWidth * scale
  const drawHeight = effectiveHeight * scale
  const x = cell.x + (cell.width - drawWidth) / 2
  const y = cell.y + (cell.height - drawHeight) / 2

  return {
    sourcePageIndex,
    x,
    y,
    width: drawWidth,
    height: drawHeight,
    rotation,
    scale,
    clipped,
  }
}

export function computePageTransform(
  sourcePageIndex: number | 'blank',
  sourceDimensions: SourceDimensions,
  cell: { x: number; y: number; width: number; height: number },
  options: TransformOptions,
): PageTransform {
  if (sourcePageIndex === 'blank') {
    return buildTransform(0, 0, cell, 0, options.scaling, options.customScalePct, 'blank')
  }

  const rotations: Array<0 | 90> = options.orientation === 'portrait' ? [0] : [0, 90]

  let best = buildTransform(
    sourceDimensions.widthPt,
    sourceDimensions.heightPt,
    cell,
    0,
    options.scaling,
    options.customScalePct,
    sourcePageIndex,
  )
  let bestScore = scoreFit(best.scale, best.clipped)

  for (const rotation of rotations) {
    const candidate = buildTransform(
      sourceDimensions.widthPt,
      sourceDimensions.heightPt,
      cell,
      rotation,
      options.scaling,
      options.customScalePct,
      sourcePageIndex,
    )
    const candidateScore = scoreFit(candidate.scale, candidate.clipped)
    if (candidateScore > bestScore) {
      best = candidate
      bestScore = candidateScore
    }
  }

  return best
}

export function isTransformWithinCell(transform: PageTransform, epsilon = 0.01): boolean {
  if (transform.sourcePageIndex === 'blank') return true
  return !transform.clipped
}
