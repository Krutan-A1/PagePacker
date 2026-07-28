import { createContext, useContext, type ReactNode } from 'react'
import { useDocumentPipeline } from '@/hooks/useDocumentPipeline'

type DocumentPipelineContextValue = ReturnType<typeof useDocumentPipeline>

const DocumentPipelineContext = createContext<DocumentPipelineContextValue | null>(null)

export function DocumentPipelineProvider({ children }: { children: ReactNode }) {
  const pipeline = useDocumentPipeline()
  return <DocumentPipelineContext.Provider value={pipeline}>{children}</DocumentPipelineContext.Provider>
}

export function useDocumentPipelineContext() {
  const ctx = useContext(DocumentPipelineContext)
  if (!ctx) {
    throw new Error('useDocumentPipelineContext must be used within DocumentPipelineProvider')
  }
  return ctx
}
