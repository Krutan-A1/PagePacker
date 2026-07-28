import type { SizeSelection } from '@/types/imposition'
import { DEFAULT_PAPER_SIZE } from '@/types/imposition'

const MM_TO_PX = 96 / 25.4
const MM_TO_PT = 72 / 25.4

export function mmToPt(mm: number): number {
  return mm * MM_TO_PT
}

export function mmToPx(mm: number): number {
  return mm * MM_TO_PX
}

export function getSizeMm(size: SizeSelection): { widthMm: number; heightMm: number } {
  if (size.kind === 'preset') {
    return { widthMm: size.widthMm, heightMm: size.heightMm }
  }

  const toMm = (value: number, unit: 'mm' | 'cm' | 'in') => {
    if (unit === 'cm') return value * 10
    if (unit === 'in') return value * 25.4
    return value
  }

  return {
    widthMm: toMm(size.width, size.unit),
    heightMm: toMm(size.height, size.unit),
  }
}

export function getPaperSizeMm(paperSize: SizeSelection = DEFAULT_PAPER_SIZE): {
  widthMm: number
  heightMm: number
} {
  return getSizeMm(paperSize)
}

export function createDocumentId(): string {
  return crypto.randomUUID()
}
