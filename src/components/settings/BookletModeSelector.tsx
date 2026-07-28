import { useSettingsStore } from '@/store/settingsStore'
import type { BookletMode } from '@/types/imposition'
import { OptionButton, OptionGrid, SettingsSection } from './SettingsSection'

const MODES: { value: BookletMode; label: string; description: string }[] = [
  { value: 'normal', label: 'Normal', description: 'Sequential page layout' },
  { value: 'booklet', label: 'Booklet', description: 'Saddle-stitch imposition' },
  { value: 'miniBook', label: 'Mini Book', description: 'Compact N-up layout' },
  { value: 'signature', label: 'Signature', description: 'Professional signature printing' },
]

export function BookletModeSelector() {
  const bookletMode = useSettingsStore((s) => s.bookletMode)
  const updateSettings = useSettingsStore((s) => s.updateSettings)

  return (
    <SettingsSection title="Booklet Mode" description="How pages are ordered for printing and folding">
      <OptionGrid cols={2}>
        {MODES.map(({ value, label }) => (
          <OptionButton
            key={value}
            selected={bookletMode === value}
            onClick={() => updateSettings({ bookletMode: value })}
          >
            {label}
          </OptionButton>
        ))}
      </OptionGrid>
      <p className="text-xs text-muted-foreground">
        {MODES.find((m) => m.value === bookletMode)?.description}
      </p>
    </SettingsSection>
  )
}
