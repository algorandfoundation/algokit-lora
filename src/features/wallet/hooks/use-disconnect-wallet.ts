import { Provider } from '@txnlab/use-wallet'
import { useCallback } from 'react'
import { clearAvailableWallets } from '../utils/clear-available-wallets'

export const useDisconnectWallet = (activeProvider?: Provider) => {
  return useCallback(async () => {
    if (activeProvider) {
      await activeProvider.disconnect()
    } else {
      clearAvailableWallets()
    }
  }, [activeProvider])
}
