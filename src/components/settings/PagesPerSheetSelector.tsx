import { useSettingsStore } from '@/store/settingsStore'
import type { PagesPerSheet } from '@/types/imposition'
import { OptionButton, OptionGrid, SettingsSection } from './SettingsSection'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const PRESET_OPTIONS: { value: PagesPerSheet; label: string }[] = [
  { value: 1, label: '1 Page' },
  { value: 2, label: '2 Pages' },
  { value: 4, label: '4 Pages' },
  { value: 6, label: '6 Pages' },
  { value: 8, label: '8 Pages' },
  { value: 9, label: '9 Pages' },
  { value: 16, label: '16 Pages' },
]

function isSamePagesPerSheet(a: PagesPerSheet, b: PagesPerSheet): boolean {
  if (typeof a === 'number' && typeof b === 'number') return a === b
  if (typeof a === 'object' && typeof b === 'object') return a.rows === b.rows && a.cols === b.cols
  return false
}

function isCustomPagesPerSheet(p: PagesPerSheet): p is { kind: 'custom'; rows: number; cols: number } {
  return typeof p === 'object'
}

export function PagesPerSheetSelector() {
  const pagesPerSheet = useSettingsStore((s) => s.pagesPerSheet)
  const updateSettings = useSettingsStore((s) => s.updateSettings)

  const isCustom = isCustomPagesPerSheet(pagesPerSheet)

  return (
    <SettingsSection
      title="Pages Per Sheet"
      description="Number of book pages placed on each side of the printed sheet"
    >
      <OptionGrid cols={4}>
        {PRESET_OPTIONS.map(({ value, label }) => (
          <OptionButton
            key={label}
            selected={isSamePagesPerSheet(pagesPerSheet, value)}
            onClick={() => updateSettings({ pagesPerSheet: value })}
          >
            {label}
          </OptionButton>
        ))}
        <OptionButton
          selected={isCustom}
          onClick={() => updateSettings({ pagesPerSheet: { kind: 'custom', rows: 2, cols: 2 } })}
        >
          Custom
        </OptionButton>
      </OptionGrid>

      {isCustom && (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label htmlFor="grid-rows">Rows</Label>
            <Input
              id="grid-rows"
              type="number"
              min={1}
              max={8}
              value={pagesPerSheet.rows}
              onChange={(e) =>
                updateSettings({
                  pagesPerSheet: { kind: 'custom', rows: Number(e.target.value), cols: pagesPerSheet.cols },
                })
              }
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="grid-cols">Columns</Label>
            <Input
              id="grid-cols"
              type="number"
              min={1}
              max={8}
              value={pagesPerSheet.cols}
              onChange={(e) =>
                updateSettings({
                  pagesPerSheet: { kind: 'custom', rows: pagesPerSheet.rows, cols: Number(e.target.value) },
                })
              }
            />
          </div>
        </div>
      )}
    </SettingsSection>
  )
}
