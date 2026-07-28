import { create } from 'zustand'

interface ExportStore {
  isExporting: boolean
  exportProgress: number
  exportError: string | null
  setExporting: (isExporting: boolean, progress?: number) => void
  setExportError: (error: string | null) => void
  resetExport: () => void
}

export const useExportStore = create<ExportStore>((set) => ({
  isExporting: false,
  exportProgress: 0,
  exportError: null,
  setExporting: (isExporting, exportProgress = 0) =>
    set((state) => ({
      isExporting,
      exportProgress: isExporting ? exportProgress : 0,
      exportError: isExporting ? null : state.exportError,
    })),
  setExportError: (exportError) => set({ exportError, isExporting: false }),
  resetExport: () => set({ isExporting: false, exportProgress: 0, exportError: null }),
}))
