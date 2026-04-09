import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DEFAULT_SETTINGS, type AppSettings } from '../types/settings'

interface SettingsStore extends AppSettings {
  update: (patch: Partial<AppSettings>) => void
}

const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,
      update: (patch) => set((state) => ({ ...state, ...patch })),
    }),
    { name: 'local-llm-settings' },
  ),
)

export { useSettingsStore }
