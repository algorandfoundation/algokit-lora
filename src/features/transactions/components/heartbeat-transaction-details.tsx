import { Card, CardContent } from '@/features/common/components/card'
import { cn } from '@/features/common/utils'
import { TransactionNote } from './transaction-note'
import { HeartbeatTransaction, SignatureType } from '../models'
import { MultisigDetails } from './multisig-details'
import { LogicsigDetails } from './logicsig-details'
import { TransactionViewTabs } from './transaction-view-tabs'
import { HeartbeatTransactionInfo } from './heartbeat-transaction-info'

type Props = {
  transaction: HeartbeatTransaction
}

export function HeartbeatTransactionDetails({ transaction }: Props) {
  return (
    <Card>
      <CardContent className={cn('space-y-4')}>
        <HeartbeatTransactionInfo transaction={transaction} />
        <TransactionViewTabs transaction={transaction} />
        {transaction.note && <TransactionNote note={transaction.note} />}
        {transaction.signature?.type === SignatureType.Multi && <MultisigDetails signature={transaction.signature} />}
        {transaction.signature?.type === SignatureType.Logic && <LogicsigDetails signature={transaction.signature} />}
      </CardContent>
    </Card>
  )
}
