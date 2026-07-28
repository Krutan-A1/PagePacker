import { DocumentInfoContent } from '@/components/document-info/DocumentInfoContent'

export function DocumentInfoPanel() {
  return (
    <aside className="flex h-full flex-col overflow-hidden border-l border-border bg-card/50">
      <div className="border-b border-border px-3 py-2.5 sm:px-4 sm:py-3">
        <h2 className="text-base font-semibold">Document Info</h2>
        <p className="text-xs text-muted-foreground">File and layout statistics</p>
      </div>
      <div className="flex-1 overflow-y-auto">
        <DocumentInfoContent />
      </div>
    </aside>
  )
}
