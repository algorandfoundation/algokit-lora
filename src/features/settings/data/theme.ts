import { useAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { settingsStore } from './settings'

export type Theme = 'dark' | 'light' | 'system'

export const selectedThemeAtom = atomWithStorage<Theme>('theme', 'system', undefined, { getOnInit: true })

export const useTheme = () => {
  return useAtom(selectedThemeAtom, { store: settingsStore })
}
