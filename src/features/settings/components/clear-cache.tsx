import { Button } from '@/features/common/components/button'
import { useWallet } from '@txnlab/use-wallet'
import { useDisconnectWallet } from '@/features/wallet/hooks/use-disconnect-wallet'
import { useMemo } from 'react'

export function ClearCache() {
  const { providers } = useWallet()
  const activeProvider = useMemo(() => providers?.find((p) => p.isActive), [providers])
  const disconnectWallet = useDisconnectWallet(activeProvider)

  const handleClearCache = async () => {
    await disconnectWallet()
    window.location.reload()
  }

  return (
    <div>
      <h2>Data</h2>
      <div>
        <p className="mb-2">Reset cached state and reload the app.</p>
        <Button onClick={handleClearCache} variant="outline" size="sm">
          Reset cache
        </Button>
      </div>
    </div>
  )
}
