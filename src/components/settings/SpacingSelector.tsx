import { useSettingsStore } from '@/store/settingsStore'
import { SettingsSection } from './SettingsSection'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'

export function SpacingSelector() {
  const spacingMm = useSettingsStore((s) => s.spacingMm)
  const updateSettings = useSettingsStore((s) => s.updateSettings)

  return (
    <SettingsSection title="Spacing Between Pages" description="Gap between adjacent pages on the sheet">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Spacing</Label>
          <span className="text-sm text-muted-foreground">{spacingMm} mm</span>
        </div>
        <Slider
          min={0}
          max={15}
          step={0.5}
          value={[spacingMm]}
          onValueChange={([value]) => updateSettings({ spacingMm: value })}
        />
      </div>
    </SettingsSection>
  )
}
