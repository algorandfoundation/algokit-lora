import { useNetworkMatchesCachedData, useSubscriberStatus } from '@/features/blocks/data'
import { SubscriberState } from '@/features/blocks/data/types'
import { Alert, AlertDescription } from '@/features/common/components/alert'
import { Button } from '@/features/common/components/button'
import { useRefreshDataProviderToken } from '@/features/common/data'
import { CircleAlert } from 'lucide-react'
import { useCallback } from 'react'

type Props = {
  networkName?: string
}

export function AlertOnSubscriberFailure({ networkName }: Props) {
  const [subscriberStatus, restartSubscriber] = useSubscriberStatus()
  const networkMatchesCachedData = useNetworkMatchesCachedData()
  const refreshDataProviderToken = useRefreshDataProviderToken()

  const reconnect = useCallback(async () => {
    try {
      // Check if the network were about to connect to matches the cached data
      // If it doesn't then it's a new network state, which is likely because LocalNet has been reset.
      const match = await networkMatchesCachedData()
      if (match) {
        // Same network, just restart the subscriber
        restartSubscriber()
      } else {
        // Clear cached data, which will restart the subscriber automatically
        refreshDataProviderToken()
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e)
    }
  }, [networkMatchesCachedData, restartSubscriber, refreshDataProviderToken])

  if (subscriberStatus.state === SubscriberState.Failed) {
    const message = subscriberStatus.error.message.toLowerCase().includes('failed to fetch')
      ? `Connection to ${networkName ?? 'the network'} failed`
      : `${subscriberStatus.error.message}`

    return (
      <Alert variant="destructive" className="mt-4 animate-in fade-in-0">
        <CircleAlert className="size-4" />
        <AlertDescription>{message}</AlertDescription>
        <Button onClick={reconnect} variant="outline" size="xs" className="ml-auto">
          Retry
        </Button>
      </Alert>
    )
  }

  return undefined
}
