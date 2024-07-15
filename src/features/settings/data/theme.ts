import { atom, useAtom, useAtomValue } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { settingsStore } from './settings'
import { ResolvedTheme, Theme } from './types'

export const selectedThemeAtom = atomWithStorage<Theme>('theme', 'system', undefined, { getOnInit: true })

const resolvedThemeAtom = atom<ResolvedTheme>((get) => {
  const theme = get(selectedThemeAtom)
  if (theme === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return theme
})

export const useSelectedTheme = () => {
  return useAtom(selectedThemeAtom, { store: settingsStore })
}

export const useResolvedTheme = () => {
  return useAtomValue(resolvedThemeAtom, { store: settingsStore })
}
