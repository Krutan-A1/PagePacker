export type BookletMode = 'normal' | 'booklet' | 'miniBook' | 'signature'
export type ScalingMode = 'fit' | 'fill' | 'actual' | 'custom'
export type PrinterProfile = 'home' | 'office' | 'press'
export type Orientation = 'portrait' | 'landscape' | 'auto'
export type CompressionLevel = 'none' | 'low' | 'medium' | 'high' | 'max'
export type SizeUnit = 'mm' | 'cm' | 'in'
export type DocumentSourceType = 'pdf' | 'docx'

export interface CustomSize {
  kind: 'custom'
  width: number
  height: number
  unit: SizeUnit
}

export interface PresetSize {
  kind: 'preset'
  id: string
  label: string
  widthMm: number
  heightMm: number
}

export type SizeSelection = PresetSize | CustomSize

export type PagesPerSheet =
  | 1
  | 2
  | 4
  | 6
  | 8
  | 9
  | 16
  | { kind: 'custom'; rows: number; cols: number }

export interface BookletSettings {
  bookSize: SizeSelection
  paperSize: SizeSelection
  pagesPerSheet: PagesPerSheet
  bookletMode: BookletMode
  marginMm: number
  spacingMm: number
  scaling: ScalingMode
  customScalePct: number
  orientation: Orientation
  duplex: boolean
  printerProfile: PrinterProfile
  compression: CompressionLevel
}

export interface PageSlot {
  sourcePageIndex: number | 'blank'
  x: number
  y: number
  width: number
  height: number
  rotation: 0 | 90 | 180 | 270
}

export interface SheetLayout {
  sheetIndex: number
  side: 'front' | 'back'
  widthPt: number
  heightPt: number
  slots: PageSlot[]
}

export interface UploadedFile {
  id: string
  name: string
  type: DocumentSourceType
  sizeBytes: number
  pageCount?: number
  isApproximatePageCount?: boolean
}

export interface DocumentState {
  files: UploadedFile[]
  totalPages: number
  paddedPages: number
  sheetCount: number
  blankPagesAdded: number
  isProcessing: boolean
  processingProgress: number
  processingError: string | null
  hasApproximatePageCount: boolean
  normalizedPdfBytes: ArrayBuffer | null
}

export const BOOK_SIZE_PRESETS: PresetSize[] = [
  { kind: 'preset', id: 'a7', label: 'A7', widthMm: 74, heightMm: 105 },
  { kind: 'preset', id: 'a6', label: 'A6', widthMm: 105, heightMm: 148 },
  { kind: 'preset', id: 'a5', label: 'A5', widthMm: 148, heightMm: 210 },
  { kind: 'preset', id: 'b7', label: 'B7', widthMm: 88, heightMm: 125 },
  { kind: 'preset', id: 'b6', label: 'B6', widthMm: 125, heightMm: 176 },
  { kind: 'preset', id: 'pocket', label: 'Pocket Size', widthMm: 108, heightMm: 178 },
]

export const PAPER_SIZE_PRESETS: PresetSize[] = [
  { kind: 'preset', id: 'a4', label: 'A4', widthMm: 210, heightMm: 297 },
  { kind: 'preset', id: 'a3', label: 'A3', widthMm: 297, heightMm: 420 },
  { kind: 'preset', id: 'letter', label: 'Letter', widthMm: 215.9, heightMm: 279.4 },
  { kind: 'preset', id: 'legal', label: 'Legal', widthMm: 215.9, heightMm: 355.6 },
]

export const DEFAULT_BOOK_SIZE = BOOK_SIZE_PRESETS[0]
export const DEFAULT_PAPER_SIZE = PAPER_SIZE_PRESETS[0]

export const DEFAULT_SETTINGS: BookletSettings = {
  bookSize: DEFAULT_BOOK_SIZE,
  paperSize: DEFAULT_PAPER_SIZE,
  pagesPerSheet: 8,
  bookletMode: 'booklet',
  marginMm: 5,
  spacingMm: 2,
  scaling: 'fit',
  customScalePct: 100,
  orientation: 'auto',
  duplex: true,
  printerProfile: 'home',
  compression: 'low',
}

export const DEFAULT_DOCUMENT_STATE: DocumentState = {
  files: [],
  totalPages: 0,
  paddedPages: 0,
  sheetCount: 0,
  blankPagesAdded: 0,
  isProcessing: false,
  processingProgress: 0,
  processingError: null,
  hasApproximatePageCount: false,
  normalizedPdfBytes: null,
}
