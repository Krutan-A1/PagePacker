import { useSettingsStore } from '@/store/settingsStore'
import { SettingsSection } from './SettingsSection'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

export function DuplexSelector() {
  const duplex = useSettingsStore((s) => s.duplex)
  const updateSettings = useSettingsStore((s) => s.updateSettings)

  return (
    <SettingsSection title="Duplex Printing" description="Optimize layout for double-sided printing">
      <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
        <Checkbox
          id="duplex"
          checked={duplex}
          onCheckedChange={(checked) => updateSettings({ duplex: checked === true })}
        />
        <Label htmlFor="duplex" className="cursor-pointer font-normal">
          Optimize for duplex printers (automatic front/back arrangement)
        </Label>
      </div>
    </SettingsSection>
  )
}
