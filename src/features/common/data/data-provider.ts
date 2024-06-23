import { settingsStore } from '@/features/settings/data'
import { useAtomValue, useSetAtom } from 'jotai'
import { atomWithRefresh } from 'jotai/utils'

const dataProviderTokenAtom = atomWithRefresh(() => {
  return Number(new Date()).toString(36).toUpperCase()
})

export const useDataProviderToken = () => {
  return useAtomValue(dataProviderTokenAtom, { store: settingsStore })
}

export const useRefreshDataProviderToken = () => {
  return useSetAtom(dataProviderTokenAtom, { store: settingsStore })
}
