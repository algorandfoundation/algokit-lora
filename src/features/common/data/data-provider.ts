import { settingsStore } from '@/features/settings/data'
import { shortId } from '@/utils/short-id'
import { useAtomValue, useSetAtom } from 'jotai'
import { atomWithRefresh } from 'jotai/utils'

const dataProviderTokenAtom = atomWithRefresh(() => {
  return shortId()
})

export const useDataProviderToken = () => {
  return useAtomValue(dataProviderTokenAtom, { store: settingsStore })
}

export const useRefreshDataProviderToken = () => {
  return useSetAtom(dataProviderTokenAtom, { store: settingsStore })
}
