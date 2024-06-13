import { atom, useAtom, useAtomValue } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { settingsStore } from './settings'

export type Theme = 'dark' | 'light' | 'system'

export type EffectiveTheme = 'dark' | 'light'

export const selectedThemeAtom = atomWithStorage<Theme>('theme', 'system', undefined, { getOnInit: true })

const effectiveThemeAtom = atom<EffectiveTheme>((get) => {
  const theme = get(selectedThemeAtom)
  if (theme === 'system') {
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    return systemTheme
  }
  return theme
})

export const useSelectedTheme = () => {
  return useAtom(selectedThemeAtom, { store: settingsStore })
}

export const useEffectiveSelectedTheme = () => {
  return useAtomValue(effectiveThemeAtom, { store: settingsStore })
}
