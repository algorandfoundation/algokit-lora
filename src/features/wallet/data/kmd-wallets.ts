import { kmd } from '@/features/common/data/algo-client'
import { useAtomValue, useSetAtom } from 'jotai'
import { atomWithRefresh, loadable } from 'jotai/utils'
import { KmdWalletResult } from '../types/kmd'

const getKmdWalletsResult = () => {
  if (!kmd) {
    return [] as KmdWalletResult[]
  }

  return kmd?.listWallets().then((result) => {
    return result.wallets.map(({ id, name }: KmdWalletResult) => {
      // Remove any properties we don't need
      return {
        id,
        name,
      } as KmdWalletResult
    }) as KmdWalletResult[]
  })
}

const availableKmdWalletsAtom = atomWithRefresh((_get) => {
  return getKmdWalletsResult()
})

export const useLoadableAvailableKmdWallets = () => {
  return useAtomValue(loadable(availableKmdWalletsAtom))
}

export const useRefreshAvailableKmdWallets = () => {
  return useSetAtom(availableKmdWalletsAtom)
}
