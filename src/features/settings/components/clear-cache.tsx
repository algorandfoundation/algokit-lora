import { Button } from '@/features/common/components/button'
import { useCallback } from 'react'
import { useWallet } from '@txnlab/use-wallet'
import { forceRemoveConnectedWallet } from '@/features/wallet/components/connect-wallet-button'

const useDisconnectWallet = () => {
  const { providers } = useWallet()

  const disconnectWallet = useCallback(async () => {
    const activeProvider = providers?.find((p) => p.isActive)
    if (activeProvider) {
      await activeProvider.disconnect()
    } else {
      forceRemoveConnectedWallet()
    }
  }, [providers])

  return disconnectWallet
}

export function ClearCache() {
  const disconnectWallet = useDisconnectWallet()

  const handleClearCache = async () => {
    await disconnectWallet()
    localStorage.clear()
    window.location.reload()
  }

  return (
    <Button onClick={handleClearCache} variant="outline" size="sm">
      Clear Cache
    </Button>
  )
}
