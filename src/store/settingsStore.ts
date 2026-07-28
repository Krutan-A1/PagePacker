import { create } from 'zustand'
import { useShallow } from 'zustand/react/shallow'
import type { BookletSettings } from '@/types/imposition'
import { DEFAULT_SETTINGS } from '@/types/imposition'

interface SettingsStore extends BookletSettings {
  updateSettings: (partial: Partial<BookletSettings>) => void
  resetSettings: () => void
}

export function selectBookletSettings(state: SettingsStore): BookletSettings {
  return {
    bookSize: state.bookSize,
    paperSize: state.paperSize,
    pagesPerSheet: state.pagesPerSheet,
    bookletMode: state.bookletMode,
    marginMm: state.marginMm,
    spacingMm: state.spacingMm,
    scaling: state.scaling,
    customScalePct: state.customScalePct,
    orientation: state.orientation,
    duplex: state.duplex,
    printerProfile: state.printerProfile,
    compression: state.compression,
  }
}

export function getBookletSettings(): BookletSettings {
  return selectBookletSettings(useSettingsStore.getState())
}

/** Stable selector — avoids infinite re-renders when passing settings to workers/effects. */
export function useBookletSettings(): BookletSettings {
  return useSettingsStore(useShallow(selectBookletSettings))
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  ...DEFAULT_SETTINGS,
  updateSettings: (partial) => set((state) => ({ ...state, ...partial })),
  resetSettings: () => set({ ...DEFAULT_SETTINGS }),
}))
