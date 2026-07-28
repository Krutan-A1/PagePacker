import { wrap, type Remote } from 'comlink'
import type { ImpositionWorkerApi } from '@/lib/workers/imposition.worker'
import type { DocumentWorkerApi } from '@/lib/workers/document.worker'
import type { ExportWorkerApi } from '@/lib/workers/export.worker'

type WorkerFactory = () => Worker

function createWorkerClient<T>(factory: WorkerFactory): { api: Remote<T>; terminate: () => void } {
  const worker = factory()
  const api = wrap<T>(worker)
  return {
    api,
    terminate: () => worker.terminate(),
  }
}

let impositionClient: ReturnType<typeof createWorkerClient<ImpositionWorkerApi>> | null = null
let documentClient: ReturnType<typeof createWorkerClient<DocumentWorkerApi>> | null = null
let exportClient: ReturnType<typeof createWorkerClient<ExportWorkerApi>> | null = null

export function getImpositionWorkerClient() {
  if (!impositionClient) {
    impositionClient = createWorkerClient<ImpositionWorkerApi>(
      () => new Worker(new URL('./imposition.worker.ts', import.meta.url), { type: 'module' }),
    )
  }
  return impositionClient
}

export function getDocumentWorkerClient() {
  if (!documentClient) {
    documentClient = createWorkerClient<DocumentWorkerApi>(
      () => new Worker(new URL('./document.worker.ts', import.meta.url), { type: 'module' }),
    )
  }
  return documentClient
}

export function getExportWorkerClient() {
  if (!exportClient) {
    exportClient = createWorkerClient<ExportWorkerApi>(
      () => new Worker(new URL('./export.worker.ts', import.meta.url), { type: 'module' }),
    )
  }
  return exportClient
}

export function terminateAllWorkers() {
  impositionClient?.terminate()
  documentClient?.terminate()
  exportClient?.terminate()
  impositionClient = null
  documentClient = null
  exportClient = null
}
