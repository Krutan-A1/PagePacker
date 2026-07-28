import { useSettingsStore } from '@/store/settingsStore'
import { OptionButton, OptionGrid, SettingsSection } from './SettingsSection'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'

const PRESET_MARGINS = [0, 2, 5, 10]

export function MarginSelector() {
  const marginMm = useSettingsStore((s) => s.marginMm)
  const updateSettings = useSettingsStore((s) => s.updateSettings)

  const isPreset = PRESET_MARGINS.includes(marginMm)

  return (
    <SettingsSection title="Margin" description="Outer margin around the printable area">
      <OptionGrid cols={4}>
        {PRESET_MARGINS.map((mm) => (
          <OptionButton key={mm} selected={marginMm === mm} onClick={() => updateSettings({ marginMm: mm })}>
            {mm} mm
          </OptionButton>
        ))}
        <OptionButton selected={!isPreset} onClick={() => updateSettings({ marginMm: 7 })}>
          Custom
        </OptionButton>
      </OptionGrid>

      {!isPreset && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Custom margin</Label>
            <span className="text-sm text-muted-foreground">{marginMm} mm</span>
          </div>
          <Slider
            min={0}
            max={25}
            step={0.5}
            value={[marginMm]}
            onValueChange={([value]) => updateSettings({ marginMm: value })}
          />
        </div>
      )}

      {isPreset && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Fine tune</Label>
            <span className="text-sm text-muted-foreground">{marginMm} mm</span>
          </div>
          <Slider
            min={0}
            max={25}
            step={0.5}
            value={[marginMm]}
            onValueChange={([value]) => updateSettings({ marginMm: value })}
          />
        </div>
      )}

    </SettingsSection>
  )
}
