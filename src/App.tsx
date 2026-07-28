import { ErrorBoundary } from '@/components/ErrorBoundary'
import { useEffect } from 'react'
import { terminateAllWorkers } from '@/lib/workers/workerClients'
import { AppShell } from '@/components/layout/AppShell'

export default function App() {
  useEffect(() => () => terminateAllWorkers(), [])

  return (
    <ErrorBoundary title="Application error">
      <AppShell />
    </ErrorBoundary>
  )
}
