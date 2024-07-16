import { Button } from '@/features/common/components/button'
import { useCallback } from 'react'
import { useWallet } from '@txnlab/use-wallet'
import { clearAllActiveWallets } from '@/features/wallet/data/clear-active-wallets'

const useDisconnectWallet = () => {
  const { providers } = useWallet()

  const disconnectWallet = useCallback(async () => {
    const activeProvider = providers?.find((p) => p.isActive)
    if (activeProvider) {
      await activeProvider.disconnect()
    } else {
      clearAllActiveWallets()
    }
  }, [providers])

  return disconnectWallet
}

export function ClearCache() {
  const disconnectWallet = useDisconnectWallet()

  const handleClearCache = async () => {
    await disconnectWallet()
    window.location.reload()
  }

  return (
    <div>
      <h2>Data</h2>
      <span>Disconnect wallets and clear cache </span>
      <Button onClick={handleClearCache} variant="outline" size="sm">
        Clear Cache
      </Button>
    </div>
  )
}
