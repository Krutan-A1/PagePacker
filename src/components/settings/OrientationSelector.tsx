import { useSettingsStore } from '@/store/settingsStore'
import type { Orientation } from '@/types/imposition'
import { OptionButton, OptionGrid, SettingsSection } from './SettingsSection'

const ORIENTATIONS: { value: Orientation; label: string }[] = [
  { value: 'portrait', label: 'Portrait' },
  { value: 'landscape', label: 'Landscape' },
  { value: 'auto', label: 'Auto' },
]

export function OrientationSelector() {
  const orientation = useSettingsStore((s) => s.orientation)
  const updateSettings = useSettingsStore((s) => s.updateSettings)

  return (
    <SettingsSection title="Orientation" description="Sheet and page orientation">
      <OptionGrid cols={3}>
        {ORIENTATIONS.map(({ value, label }) => (
          <OptionButton
            key={value}
            selected={orientation === value}
            onClick={() => updateSettings({ orientation: value })}
          >
            {label}
          </OptionButton>
        ))}
      </OptionGrid>
    </SettingsSection>
  )
}
