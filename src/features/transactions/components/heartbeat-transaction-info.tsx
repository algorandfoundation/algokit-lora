import { cn } from '@/features/common/utils'
import { useMemo } from 'react'
import { HeartbeatTransaction } from '../models'
import { DescriptionList } from '@/features/common/components/description-list'
import { AccountLink } from '@/features/accounts/components/account-link'
import { transactionSenderLabel } from './labels'

type Props = {
  transaction: HeartbeatTransaction
}

export const heartbeatAddressLabel = 'Address'

// TODO: HB - Present the data we want to show

export function HeartbeatTransactionInfo({ transaction }: Props) {
  const items = useMemo(
    () => [
      {
        dt: transactionSenderLabel,
        dd: <AccountLink address={transaction.sender} showCopyButton={true} />,
      },
      {
        dt: heartbeatAddressLabel,
        dd: <AccountLink address={transaction.address} showCopyButton={true} />,
      },
    ],
    [transaction.address, transaction.sender]
  )

  return (
    <div className={cn('space-y-1')}>
      <h2>Heartbeat</h2>
      <DescriptionList items={items} />
    </div>
  )
}
