import { kmd } from '@/features/common/data/algo-client'
import { atom, useAtomValue, useSetAtom } from 'jotai'
import { atomWithRefresh, loadable } from 'jotai/utils'
import { KmdWalletResult } from './types'

export const defaultKmdWallet = 'unencrypted-default-wallet'

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

export const availableKmdWalletsAtom = atomWithRefresh((_get) => {
  return getKmdWalletsResult()
})

export const selectedKmdWalletAtom = atom<string | undefined>(undefined)

export const useSelectedKmdWallet = () => {
  return useAtomValue(selectedKmdWalletAtom)
}

export const useAvailableKmdWallets = () => {
  return [useAtomValue(loadable(availableKmdWalletsAtom)), useSetAtom(availableKmdWalletsAtom)] as const
}

export const walletDialogOpenAtom = atom(false)
