import type { CompressionLevel, PrinterProfile } from '@/types/imposition'

export interface CompressionSettings {
  rasterize: boolean
  jpegQuality: number
  dpi: number
}

const COMPRESSION_MAP: Record<CompressionLevel, CompressionSettings> = {
  none: { rasterize: false, jpegQuality: 1, dpi: 300 },
  low: { rasterize: false, jpegQuality: 0.95, dpi: 300 },
  medium: { rasterize: true, jpegQuality: 0.92, dpi: 300 },
  high: { rasterize: true, jpegQuality: 0.85, dpi: 200 },
  max: { rasterize: true, jpegQuality: 0.75, dpi: 150 },
}

export function getCompressionSettings(level: CompressionLevel): CompressionSettings {
  return COMPRESSION_MAP[level]
}

export function getExportDpi(printerProfile: PrinterProfile, compression: CompressionLevel): number {
  const base = getCompressionSettings(compression).dpi
  if (printerProfile === 'press') return Math.max(base, 300)
  if (printerProfile === 'office') return Math.max(base, 200)
  return base
}

/** Small imposition cells (16-up, etc.) need higher render DPI when rasterizing. */
export function getSlotRenderDpi(
  slotWidthPt: number,
  printerProfile: PrinterProfile,
  compression: CompressionLevel,
): number {
  const base = getExportDpi(printerProfile, compression)
  const referenceWidthPt = 210
  const scaleFactor = Math.min(2.5, Math.max(1, referenceWidthPt / Math.max(slotWidthPt, 1)))
  return Math.min(600, Math.round(base * scaleFactor))
}

export function shouldUseVectorExport(compression: CompressionLevel): boolean {
  return compression === 'none' || compression === 'low'
}

export function getRasterQuality(compression: CompressionLevel): number {
  return getCompressionSettings(compression).jpegQuality
}

export function preferPngRaster(compression: CompressionLevel): boolean {
  return compression === 'none' || compression === 'low' || compression === 'medium'
}
