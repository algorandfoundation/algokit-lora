import { useSubscriberStatus } from '@/features/blocks/data'
import { SubscriberStatus } from '@/features/blocks/data/types'
import { Alert, AlertDescription } from '@/features/common/components/alert'
import { Button } from '@/features/common/components/button'
import { CircleAlert } from 'lucide-react'

type Props = {
  networkName?: string
}

export function AlertOnNetworkDisconnect({ networkName }: Props) {
  const [subscriberStatus, reconnect] = useSubscriberStatus()

  if (subscriberStatus === SubscriberStatus.Stopped) {
    return (
      <Alert variant="destructive" className="mt-4 animate-in fade-in-0">
        <CircleAlert className="size-4" />
        <AlertDescription>Failed to connect to {networkName ?? 'the network'}</AlertDescription>
        <Button onClick={reconnect} variant="outline" size="xs" className="ml-auto">
          Retry
        </Button>
      </Alert>
    )
  }

  return undefined
}
