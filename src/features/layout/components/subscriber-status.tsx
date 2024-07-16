import { useNetworkMatchesCachedData, useSubscriber } from '@/features/blocks/data'
import { SubscriberState, SubscriberStoppedReason } from '@/features/blocks/data/types'
import { Alert, AlertDescription } from '@/features/common/components/alert'
import { Button } from '@/features/common/components/button'
import { cachedDataExpirationMillis, useRefreshDataProviderToken } from '@/features/common/data'
import { CircleAlert, Info } from 'lucide-react'
import { useCallback } from 'react'
import { useIdleTimer } from 'react-idle-timer'

const idleTimeoutMillis = 300_000 // 5 minutes

type Props = {
  status: ReturnType<typeof useSubscriber>[0]
  start: ReturnType<typeof useSubscriber>[1]
  stop: ReturnType<typeof useSubscriber>[2]
}

function SubscriberStatusInner({ status, start, stop }: Props) {
  const networkMatchesCachedData = useNetworkMatchesCachedData()
  const refreshDataProviderToken = useRefreshDataProviderToken()

  const reconnect = useCallback(async () => {
    try {
      if (status.state !== SubscriberState.Stopped) {
        return
      }

      const expiredTimestamp = Date.now() - cachedDataExpirationMillis

      // Check if the network were about to connect to matches the cached data
      // If it doesn't then it's a new network state, which is likely because LocalNet has been reset.
      const networkMatch = await networkMatchesCachedData()
      if (networkMatch && status.timestamp > expiredTimestamp) {
        // Same network and the tip isn't too far ahead, just restart the subscriber
        start()
      } else {
        // Clear cached data, which will restart the subscriber automatically
        refreshDataProviderToken()
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e)
    }
  }, [status, networkMatchesCachedData, start, refreshDataProviderToken])

  const pause = useCallback(async () => {
    if (status.state !== SubscriberState.Started) {
      return
    }

    await stop({ reason: SubscriberStoppedReason.Inactivity })
  }, [stop, status.state])

  useIdleTimer({
    onIdle: pause,
    onActive: reconnect,
    timeout: idleTimeoutMillis,
    throttle: 500,
  })

  if (status.state === SubscriberState.Stopped) {
    if (status.details.reason === SubscriberStoppedReason.Error) {
      let message = status.details.error.message
      if (status.details.error.message.toLowerCase().includes('failed to fetch')) {
        message = 'Subscription failed to retrieve data'
      } else if (status.details.error.message.toLowerCase().includes('daily free')) {
        message = 'Algonode daily free limit reached'
      }

      return (
        <Alert variant="destructive">
          <CircleAlert className="size-4" />
          <AlertDescription>{message}</AlertDescription>
          <Button onClick={reconnect} variant="outline" size="xs" className="ml-auto">
            Retry
          </Button>
        </Alert>
      )
    }

    if (status.details.reason === SubscriberStoppedReason.Inactivity) {
      return (
        <Alert>
          <Info className="size-4" />
          <AlertDescription>Subscription paused due to inactivity</AlertDescription>
        </Alert>
      )
    }
  }

  return undefined
}

export function SubscriberStatus() {
  const [subscriberStatus, startSubscriber, stopSubscriber] = useSubscriber()

  if (subscriberStatus.state === SubscriberState.NotStarted) {
    return undefined
  }

  return <SubscriberStatusInner status={subscriberStatus} start={startSubscriber} stop={stopSubscriber} />
}
