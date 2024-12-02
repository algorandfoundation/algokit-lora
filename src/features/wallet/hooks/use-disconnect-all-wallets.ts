import { useWallet } from '@txnlab/use-wallet-react'
import { useSetAtom } from 'jotai'
import { useCallback } from 'react'
import { selectedKmdWalletAtom } from '../data/selected-kmd-wallet'
import { RESET } from 'jotai/utils'

export const useDisconnectAllWallets = () => {
  const { wallets } = useWallet()
  const setSelectedKmdWallet = useSetAtom(selectedKmdWalletAtom)

  return useCallback(async () => {
    wallets?.forEach((wallet) => {
      wallet.disconnect()
    })
    setSelectedKmdWallet(RESET)
  }, [wallets, setSelectedKmdWallet])
}
