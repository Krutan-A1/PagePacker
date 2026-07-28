import { create } from 'zustand'

interface UiStore {
  settingsOpen: boolean
  infoOpen: boolean
  openSettings: () => void
  closeSettings: () => void
  toggleSettings: () => void
  openInfo: () => void
  closeInfo: () => void
  toggleInfo: () => void
  closeAllPanels: () => void
}

export const useUiStore = create<UiStore>((set) => ({
  settingsOpen: false,
  infoOpen: false,
  openSettings: () => set({ settingsOpen: true, infoOpen: false }),
  closeSettings: () => set({ settingsOpen: false }),
  toggleSettings: () => set((s) => ({ settingsOpen: !s.settingsOpen, infoOpen: false })),
  openInfo: () => set({ infoOpen: true, settingsOpen: false }),
  closeInfo: () => set({ infoOpen: false }),
  toggleInfo: () => set((s) => ({ infoOpen: !s.infoOpen, settingsOpen: false })),
  closeAllPanels: () => set({ settingsOpen: false, infoOpen: false }),
}))
