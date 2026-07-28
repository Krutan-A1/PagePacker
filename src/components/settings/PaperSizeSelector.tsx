import { useSettingsStore } from '@/store/settingsStore'
import { PAPER_SIZE_PRESETS, type CustomSize, type PresetSize } from '@/types/imposition'
import { OptionButton, OptionGrid, SettingsSection } from './SettingsSection'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function PaperSizeSelector() {
  const paperSize = useSettingsStore((s) => s.paperSize)
  const updateSettings = useSettingsStore((s) => s.updateSettings)

  const isCustom = paperSize.kind === 'custom'
  const selectedPresetId = paperSize.kind === 'preset' ? paperSize.id : 'custom'

  const selectPreset = (preset: PresetSize) => updateSettings({ paperSize: preset })
  const selectCustom = () =>
    updateSettings({
      paperSize: { kind: 'custom', width: 210, height: 297, unit: 'mm' } satisfies CustomSize,
    })

  const updateCustom = (partial: Partial<CustomSize>) => {
    if (paperSize.kind !== 'custom') return
    updateSettings({ paperSize: { ...paperSize, ...partial } })
  }

  return (
    <SettingsSection title="Paper Size" description="Physical paper used for printing">
      <OptionGrid cols={2}>
        {PAPER_SIZE_PRESETS.map((preset) => (
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
            <Label htmlFor="paper-width">Width</Label>
            <Input
              id="paper-width"
              type="number"
              min={1}
              value={paperSize.width}
              onChange={(e) => updateCustom({ width: Number(e.target.value) })}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="paper-height">Height</Label>
            <Input
              id="paper-height"
              type="number"
              min={1}
              value={paperSize.height}
              onChange={(e) => updateCustom({ height: Number(e.target.value) })}
            />
          </div>
          <div className="space-y-1">
            <Label>Unit</Label>
            <Select value={paperSize.unit} onValueChange={(unit) => updateCustom({ unit: unit as CustomSize['unit'] })}>
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
