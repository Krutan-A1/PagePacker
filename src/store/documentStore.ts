import { create } from 'zustand'
import type { DocumentState, UploadedFile } from '@/types/imposition'
import { DEFAULT_DOCUMENT_STATE } from '@/types/imposition'

interface DocumentStore extends DocumentState {
  setFiles: (files: UploadedFile[]) => void
  setProcessing: (isProcessing: boolean, progress?: number) => void
  setProcessingError: (error: string | null) => void
  setDocumentStats: (
    stats: Partial<
      Pick<
        DocumentState,
        | 'totalPages'
        | 'paddedPages'
        | 'sheetCount'
        | 'blankPagesAdded'
        | 'hasApproximatePageCount'
        | 'normalizedPdfBytes'
      >
    >,
  ) => void
  clearDocument: () => void
}

export const useDocumentStore = create<DocumentStore>((set) => ({
  ...DEFAULT_DOCUMENT_STATE,
  setFiles: (files) => set({ files }),
  setProcessing: (isProcessing, progress = 0) =>
    set((state) => ({
      isProcessing,
      processingProgress: progress,
      processingError: isProcessing ? null : state.processingError,
    })),
  setProcessingError: (processingError) => set({ processingError, isProcessing: false }),
  setDocumentStats: (stats) =>
    set((state) => {
      const next = { ...state, ...stats }
      if (
        next.totalPages === state.totalPages &&
        next.paddedPages === state.paddedPages &&
        next.sheetCount === state.sheetCount &&
        next.blankPagesAdded === state.blankPagesAdded &&
        next.hasApproximatePageCount === state.hasApproximatePageCount &&
        next.normalizedPdfBytes === state.normalizedPdfBytes
      ) {
        return state
      }
      return next
    }),
  clearDocument: () =>
    set((state) => {
      if (
        state.files.length === 0 &&
        state.totalPages === 0 &&
        !state.isProcessing &&
        state.processingError === null &&
        state.normalizedPdfBytes === null
      ) {
        return state
      }
      return { ...DEFAULT_DOCUMENT_STATE }
    }),
}))
