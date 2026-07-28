import { useSettingsStore } from '@/store/settingsStore'
import { BOOK_SIZE_PRESETS, type CustomSize, type PresetSize } from '@/types/imposition'
import { OptionButton, OptionGrid, SettingsSection } from './SettingsSection'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function BookSizeSelector() {
  const bookSize = useSettingsStore((s) => s.bookSize)
  const updateSettings = useSettingsStore((s) => s.updateSettings)

  const isCustom = bookSize.kind === 'custom'
  const selectedPresetId = bookSize.kind === 'preset' ? bookSize.id : 'custom'

  const selectPreset = (preset: PresetSize) => updateSettings({ bookSize: preset })
  const selectCustom = () =>
    updateSettings({
      bookSize: { kind: 'custom', width: 74, height: 105, unit: 'mm' } satisfies CustomSize,
    })

  const updateCustom = (partial: Partial<CustomSize>) => {
    if (bookSize.kind !== 'custom') return
    updateSettings({ bookSize: { ...bookSize, ...partial } })
  }

  return (
    <SettingsSection title="Book Size" description="Target size of each page in the finished booklet">
      <OptionGrid cols={3}>
        {BOOK_SIZE_PRESETS.map((preset) => (
          <OptionButton
            key={preset.id}
            selected={selectedPresetId === preset.id}
            onClick={() => selectPreset(preset)}
          >
            {preset.label}
          </OptionButton>
        ))}
        <OptionButton selected={isCustom} onClick={selectCustom}>
          Custom
        </OptionButton>
      </OptionGrid>

      {isCustom && (
        <div className="mt-3 grid grid-cols-3 gap-2">
          <div className="space-y-1">
            <Label htmlFor="book-width">Width</Label>
            <Input
              id="book-width"
              type="number"
              min={1}
              value={bookSize.width}
              onChange={(e) => updateCustom({ width: Number(e.target.value) })}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="book-height">Height</Label>
            <Input
              id="book-height"
              type="number"
              min={1}
              value={bookSize.height}
              onChange={(e) => updateCustom({ height: Number(e.target.value) })}
            />
          </div>
          <div className="space-y-1">
            <Label>Unit</Label>
            <Select value={bookSize.unit} onValueChange={(unit) => updateCustom({ unit: unit as CustomSize['unit'] })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mm">mm</SelectItem>
                <SelectItem value="cm">cm</SelectItem>
                <SelectItem value="in">inches</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </SettingsSection>
  )
}
