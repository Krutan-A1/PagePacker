import type { BookletSettings } from '@/types/imposition'

import { DEFAULT_BOOK_SIZE, DEFAULT_PAPER_SIZE } from '@/types/imposition'



export type ExportPreset = 'print-ready' | 'booklet' | 'mini-book' | 'source'



export interface ExportPresetMeta {

  id: ExportPreset

  label: string

  description: string

  filename: string

}



export const EXPORT_PRESETS: ExportPresetMeta[] = [

  {

    id: 'print-ready',

    label: 'Print-ready PDF',

    description: 'Imposed print sheets (not 1 PDF page per source page)',

    filename: 'booklet-print-ready.pdf',

  },

  {

    id: 'source',

    label: 'Source PDF',

    description: 'All original pages in order, no imposition',

    filename: 'booklet-source.pdf',

  },

  {

    id: 'booklet',

    label: 'Booklet PDF',

    description: '2-up saddle-stitch with duplex defaults',

    filename: 'booklet-saddle-stitch.pdf',

  },

  {

    id: 'mini-book',

    label: 'Mini-book PDF',

    description: 'A7 mini book with 8 pages per sheet',

    filename: 'booklet-mini-book.pdf',

  },

]



export function applyExportPreset(

  preset: ExportPreset,

  settings: BookletSettings,

): BookletSettings {

  switch (preset) {

    case 'source':

      return settings

    case 'booklet':

      return {

        ...settings,

        bookletMode: 'booklet',

        pagesPerSheet: 2,

        duplex: true,

        scaling: 'fit',

        compression: settings.compression === 'none' ? 'low' : settings.compression,

      }

    case 'mini-book':

      return {

        ...settings,

        bookSize: DEFAULT_BOOK_SIZE,

        paperSize: DEFAULT_PAPER_SIZE,

        pagesPerSheet: 8,

        bookletMode: 'miniBook',

        duplex: true,

        scaling: 'fit',

        compression: settings.compression,

      }

    case 'print-ready':

      return {

        ...settings,

        compression: 'none',

      }

  }

}



export function getPresetFilename(preset: ExportPreset): string {

  return EXPORT_PRESETS.find((p) => p.id === preset)?.filename ?? 'booklet.pdf'

}



export function isSourceOnlyExport(preset: ExportPreset): boolean {

  return preset === 'source'

}

