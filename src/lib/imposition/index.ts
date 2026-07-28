export { padPageCount, pageNumberToSourceIndex, isBlankPageNumber } from '@/lib/imposition/blankPagePadding'
export {
  buildPageStream,
  buildSaddleStitchStream,
  buildSequentialStream,
  getBookletSidePairs,
  chunkStreamIntoSides,
} from '@/lib/imposition/pageOrdering'
export {
  getGridDimensions,
  computeGridCells,
  computePrintableArea,
  getPrinterBleedMm,
  resolvePaperDimensionsPt,
  validateGridCapacity,
} from '@/lib/imposition/gridCalculator'
export {
  computePageTransform,
  isTransformWithinCell,
  type PageTransform,
  type SourceDimensions,
} from '@/lib/imposition/scalingEngine'
export {
  mirrorColumn,
  mapCellIndexForDuplexBack,
  assignPagesToGrid,
  assignPagesToGridMirrored,
} from '@/lib/imposition/duplexLayout'
export { impose, countPhysicalSheets, type ImpositionResult, type ImposeOptions } from '@/lib/imposition/impose'
