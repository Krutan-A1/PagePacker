import { useSettingsStore } from '@/store/settingsStore'
import type { ScalingMode } from '@/types/imposition'
import { OptionButton, OptionGrid, SettingsSection } from './SettingsSection'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const SCALING_OPTIONS: { value: ScalingMode; label: string }[] = [
  { value: 'fit', label: 'Fit' },
  { value: 'fill', label: 'Fill' },
  { value: 'actual', label: 'Actual Size' },
  { value: 'custom', label: 'Custom %' },
]

export function ScalingSelector() {
  const scaling = useSettingsStore((s) => s.scaling)
  const customScalePct = useSettingsStore((s) => s.customScalePct)
  const updateSettings = useSettingsStore((s) => s.updateSettings)

  return (
    <SettingsSection title="Scaling" description="How source pages are scaled to fit each cell">
      <OptionGrid cols={2}>
        {SCALING_OPTIONS.map(({ value, label }) => (
          <OptionButton
            key={value}
            selected={scaling === value}
            onClick={() => updateSettings({ scaling: value })}
          >
            {label}
          </OptionButton>
        ))}
      </OptionGrid>

      {scaling === 'custom' && (
        <div className="space-y-1">
          <Label htmlFor="custom-scale">Scale percentage</Label>
          <Input
            id="custom-scale"
            type="number"
            min={10}
            max={300}
            value={customScalePct}
            onChange={(e) => updateSettings({ customScalePct: Number(e.target.value) })}
          />
        </div>
      )}
    </SettingsSection>
  )
}
