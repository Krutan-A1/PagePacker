import { expose } from 'comlink'
import type { BookletSettings } from '@/types/imposition'
import { impose, type ImpositionResult, type SourcePageDimensions } from '@/lib/imposition/impose'

export interface ImpositionWorkerApi {
  computeImposition(
    settings: BookletSettings,
    sourcePageCount: number,
    sourcePageDimensions?: SourcePageDimensions,
  ): ImpositionResult
}

const api: ImpositionWorkerApi = {
  computeImposition(settings, sourcePageCount, sourcePageDimensions) {
    return impose({ settings, sourcePageCount, sourcePageDimensions })
  },
}

expose(api)
