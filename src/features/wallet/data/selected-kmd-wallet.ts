import { useAtomValue } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

export const defaultKmdWallet = 'unencrypted-default-wallet'

export const selectedKmdWalletAtom = atomWithStorage<string | undefined>('selected-kmd-wallet', undefined)

export const useSelectedKmdWallet = () => {
  return useAtomValue(selectedKmdWalletAtom)
}
