import { Wallet, WalletId } from '@txnlab/use-wallet-react'
import { useCallback } from 'react'
import { selectedKmdWalletAtom } from '../data/selected-kmd-wallet'
import { useSetAtom } from 'jotai'
import { useDisconnectAllWallets } from './use-disconnect-all-wallets'
import { RESET } from 'jotai/utils'

export const useDisconnectWallet = (activeWallet?: Wallet) => {
  const setSelectedKmdWallet = useSetAtom(selectedKmdWalletAtom)
  const disconnectAllWallets = useDisconnectAllWallets()

  return useCallback(async () => {
    if (activeWallet) {
      await activeWallet.disconnect()
      if (activeWallet.id === WalletId.KMD) {
        setSelectedKmdWallet(RESET)
      }
    } else {
      disconnectAllWallets()
    }
  }, [activeWallet, disconnectAllWallets, setSelectedKmdWallet])
}
