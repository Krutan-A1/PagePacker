import { useSettingsStore } from '@/store/settingsStore'
import type { CompressionLevel } from '@/types/imposition'
import { OptionButton, OptionGrid, SettingsSection } from './SettingsSection'

const LEVELS: { value: CompressionLevel; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'max', label: 'Maximum' },
]

export function CompressionSelector() {
  const compression = useSettingsStore((s) => s.compression)
  const updateSettings = useSettingsStore((s) => s.updateSettings)

  return (
    <SettingsSection
      title="Compression"
      description="None = sharpest text (vector). Medium+ = smaller files, softer text."
    >
      <OptionGrid cols={3}>
        {LEVELS.map(({ value, label }) => (
          <OptionButton
            key={value}
            selected={compression === value}
            onClick={() => updateSettings({ compression: value })}
          >
            {label}
          </OptionButton>
        ))}
      </OptionGrid>
    </SettingsSection>
  )
}
