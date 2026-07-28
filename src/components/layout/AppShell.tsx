import { DocumentPipelineProvider } from '@/context/DocumentPipelineContext'

import { Toolbar } from './Toolbar'

import { SettingsPanel } from '@/components/settings/SettingsPanel'

import { PreviewPanel } from '@/components/preview/PreviewPanel'

import { DocumentInfoPanel } from '@/components/document-info/DocumentInfoPanel'

import { DocumentInfoContent } from '@/components/document-info/DocumentInfoContent'

import { SettingsDrawer, InfoDrawer } from '@/components/layout/SlideOver'

import { ErrorBoundary } from '@/components/ErrorBoundary'

import { useUiStore } from '@/store/uiStore'



export function AppShell() {

  const settingsOpen = useUiStore((s) => s.settingsOpen)

  const infoOpen = useUiStore((s) => s.infoOpen)

  const closeSettings = useUiStore((s) => s.closeSettings)

  const closeInfo = useUiStore((s) => s.closeInfo)



  return (

    <DocumentPipelineProvider>

      <div className="flex h-dvh flex-col overflow-hidden">

        <Toolbar />

        <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(240px,260px)_minmax(0,1fr)] 2xl:grid-cols-[minmax(240px,260px)_minmax(0,1fr)_minmax(220px,240px)]">

          <div className="hidden h-full min-h-0 lg:block">

            <SettingsPanel />

          </div>



          <main className="min-h-0 min-w-0 overflow-hidden bg-background">

            <ErrorBoundary title="Preview failed to load">

              <PreviewPanel />

            </ErrorBoundary>

          </main>



          <div className="hidden h-full min-h-0 2xl:block">

            <DocumentInfoPanel />

          </div>

        </div>



        <SettingsDrawer open={settingsOpen} onClose={closeSettings} />

        <InfoDrawer open={infoOpen} onClose={closeInfo}>

          <DocumentInfoContent />

        </InfoDrawer>

      </div>

    </DocumentPipelineProvider>

  )

}

