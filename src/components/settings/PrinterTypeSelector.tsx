import { useSettingsStore } from '@/store/settingsStore'
import type { PrinterProfile } from '@/types/imposition'
import { OptionButton, OptionGrid, SettingsSection } from './SettingsSection'

const PROFILES: { value: PrinterProfile; label: string; description: string }[] = [
  { value: 'home', label: 'Home Printer', description: 'Extra safe margins (+5 mm)' },
  { value: 'office', label: 'Office Printer', description: 'Standard margins (+3 mm)' },
  { value: 'press', label: 'Professional Press', description: 'Minimal margins (+2 mm)' },
]

export function PrinterTypeSelector() {
  const printerProfile = useSettingsStore((s) => s.printerProfile)
  const updateSettings = useSettingsStore((s) => s.updateSettings)

  return (
    <SettingsSection title="Printer Type" description="Adjusts print safety margins automatically">
      <OptionGrid cols={1}>
        {PROFILES.map(({ value, label }) => (
          <OptionButton
            key={value}
            selected={printerProfile === value}
            onClick={() => updateSettings({ printerProfile: value })}
            className="text-left"
          >
            {label}
          </OptionButton>
        ))}
      </OptionGrid>
      <p className="text-xs text-muted-foreground">
        {PROFILES.find((p) => p.value === printerProfile)?.description}
      </p>
    </SettingsSection>
  )
}
