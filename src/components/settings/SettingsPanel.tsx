import { BookSizeSelector } from './BookSizeSelector'
import { PaperSizeSelector } from './PaperSizeSelector'
import { PagesPerSheetSelector } from './PagesPerSheetSelector'
import { BookletModeSelector } from './BookletModeSelector'
import { MarginSelector } from './MarginSelector'
import { SpacingSelector } from './SpacingSelector'
import { ScalingSelector } from './ScalingSelector'
import { OrientationSelector } from './OrientationSelector'
import { DuplexSelector } from './DuplexSelector'
import { PrinterTypeSelector } from './PrinterTypeSelector'
import { CompressionSelector } from './CompressionSelector'

export function SettingsPanelContent() {
  return (
    <div className="space-y-4 px-3 py-3 sm:px-4 sm:py-4">
      <BookSizeSelector />
      <PaperSizeSelector />
      <PagesPerSheetSelector />
      <BookletModeSelector />
      <MarginSelector />
      <SpacingSelector />
      <ScalingSelector />
      <OrientationSelector />
      <DuplexSelector />
      <PrinterTypeSelector />
      <CompressionSelector />
    </div>
  )
}

export function SettingsPanel() {
  return (
    <aside className="flex h-full flex-col overflow-hidden border-r border-border bg-card/50">
      <div className="border-b border-border px-3 py-2.5 sm:px-4 sm:py-3">
        <h2 className="text-base font-semibold">Booklet Settings</h2>
        <p className="text-xs text-muted-foreground">Configure layout and print options</p>
      </div>
      <div className="flex-1 overflow-y-auto">
        <SettingsPanelContent />
      </div>
    </aside>
  )
}
