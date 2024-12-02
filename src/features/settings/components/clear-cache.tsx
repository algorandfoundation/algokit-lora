import { Button } from '@/features/common/components/button'
import { useWallet } from '@txnlab/use-wallet-react'
import { useDisconnectWallet } from '@/features/wallet/hooks/use-disconnect-wallet'
import { useMemo } from 'react'

export function ClearCache() {
  const { wallets } = useWallet()
  const activeWallet = useMemo(() => wallets?.find((p) => p.isActive), [wallets])
  const disconnectWallet = useDisconnectWallet(activeWallet)

  const handleClearCache = async () => {
    await disconnectWallet()
    window.location.reload()
  }

  return (
    <div>
      <h2>Data</h2>
      <div>
        <p className="mb-2 text-sm">Reset cached state and reload the app.</p>
        <Button onClick={handleClearCache} variant="outline" size="sm">
          Reset cache
        </Button>
      </div>
    </div>
  )
}
